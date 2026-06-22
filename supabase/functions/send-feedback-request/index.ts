import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const FUNCTION_NAME = "send-feedback-request";

// Rate limiting - IP-based with in-memory store
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimits.get(ip);

  if (rateLimits.size > 10000) {
    for (const [key, value] of rateLimits.entries()) {
      if (now > value.resetAt) {
        rateLimits.delete(key);
      }
    }
  }

  if (!record || now > record.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
}

// Structured logging
const log = {
  info: (message: string, data?: Record<string, unknown>) => 
    console.log(JSON.stringify({ level: 'INFO', function: FUNCTION_NAME, message, ...data, timestamp: new Date().toISOString() })),
  error: (message: string, data?: Record<string, unknown>) => 
    console.error(JSON.stringify({ level: 'ERROR', function: FUNCTION_NAME, message, ...data, timestamp: new Date().toISOString() })),
  warn: (message: string, data?: Record<string, unknown>) => 
    console.warn(JSON.stringify({ level: 'WARN', function: FUNCTION_NAME, message, ...data, timestamp: new Date().toISOString() })),
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function escapeHtml(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function isAuthorized(req: Request): Promise<boolean> {
  // Allow scheduler with shared secret
  const cronSecret = Deno.env.get("CRON_SECRET");
  const headerSecret = req.headers.get("x-cron-secret");
  if (cronSecret && headerSecret && headerSecret === cronSecret) return true;

  // Otherwise require an admin/platform_owner JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const jwt = authHeader.replace("Bearer ", "");
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authClient = createClient(url, anonKey);
  const { data: userData, error: userErr } = await authClient.auth.getUser(jwt);
  if (userErr || !userData?.user) return false;
  const svc = createClient(url, serviceKey);
  const { data: roleRows } = await svc
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .in("role", ["admin", "platform_owner"]);
  return !!(roleRows && roleRows.length > 0);
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const clientIP = getClientIP(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  log.info('Request received', { requestId, clientIP });

  if (!(await isAuthorized(req))) {
    log.warn('Unauthorized', { requestId, clientIP });
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized', requestId }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }


  // Rate limiting check
  if (!checkRateLimit(clientIP)) {
    log.warn('Rate limit exceeded', { requestId, clientIP });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests. Please try again later.',
        timestamp: new Date().toISOString()
      }),
      {
        status: 429,
        headers: { 
          'Content-Type': 'application/json', 
          'Retry-After': '60',
          ...corsHeaders 
        }
      }
    );
  }

  try {
    log.info('Starting feedback request job', { requestId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find jobs completed 48 hours ago that haven't received feedback email
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setHours(threeDaysAgo.getHours() - 72);

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        user_id,
        quote_id,
        completed_date,
        quotes!inner(
          id,
          name,
          email,
          type
        )
      `)
      .eq('status', 'completed')
      .is('feedback_sent_at', null)
      .lte('completed_date', twoDaysAgo.toISOString())
      .gte('completed_date', threeDaysAgo.toISOString());

    if (jobsError) {
      log.error('Error fetching jobs', { requestId, error: jobsError.message });
      throw jobsError;
    }

    log.info('Found jobs needing feedback emails', { requestId, count: jobs?.length || 0 });

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No jobs need feedback emails', sent: 0, requestId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const siteUrl = Deno.env.get('SITE_URL') || 'https://handyhjelp.no';

    for (const job of jobs) {
      const quote = (job.quotes as unknown as { id: string; name: string; email: string; type: string });
      if (!quote) continue;

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(quote.email)) {
        log.warn('Invalid email, skipping', { requestId, jobId: job.id });
        continue;
      }
      
      const reviewUrl = `${siteUrl}/anmeldelse/${job.id}`;
      const googleReviewUrl = 'https://g.page/r/CW2GzzcrRsq5EAE/review';
      const serviceType = quote.type === 'vaktmester' ? 'Vaktmestertjenester' :
                         quote.type === 'tomrer' ? 'Tømrertjenester' :
                         quote.type === 'blikk' ? 'Blikkenslagertjenester' :
                         quote.type === 'takrennerens' ? 'Takrennerens' : 'Tjenester';

      try {
        const emailResponse = await resend.emails.send({
          from: 'HandyHjelp <team@handyhjelp.no>',
          to: [quote.email],
          subject: 'Hvordan gikk jobben? Vi setter pris på din tilbakemelding',
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #0891B2, #06B6D4); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .logo { color: white; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .stars { text-align: center; margin: 25px 0; font-size: 40px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; }
    .benefits { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .contact-info { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">HandyHjelp</div>
      <h1>Hvordan gikk jobben?</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 20px;">Hei <strong>${escapeHtml(quote.name)}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
        For et par dager siden fullførte vi <strong>${escapeHtml(serviceType)}</strong> for deg. 
        Vi håper du er fornøyd med arbeidet!
      </p>
      
      <div class="stars">
        <span style="color: #fbbf24;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568; text-align: center;">
        Din tilbakemelding betyr mye for oss og hjelper andre kunder å ta gode valg. 
        Det tar bare 1 minutt å dele din opplevelse.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${googleReviewUrl}" class="cta-button" style="display: inline-flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" style="vertical-align: middle;">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Gi oss en Google-anmeldelse ⭐
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; text-align: center;">
        eller <a href="${reviewUrl}" style="color: #0891b2; text-decoration: underline;">gi tilbakemelding på nettsiden</a>
      </p>
      
      <div class="benefits">
        <p style="color: #0d9488; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">
          Hvorfor dele din mening?
        </p>
        <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Hjelper oss å bli enda bedre</li>
          <li>Veileder andre kunder</li>
          <li>Tar kun 1 minutt</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <h3 style="margin-top: 0; color: #0891B2;">Har du spørsmål?</h3>
        <p style="margin: 8px 0;"><strong>Telefon:</strong> <a href="tel:+4741250553" style="color: #0891b2; text-decoration: none;">+47 412 50 553</a></p>
        <p style="margin: 8px 0;"><strong>E-post:</strong> <a href="mailto:team@handyhjelp.no" style="color: #0891b2; text-decoration: none;">team@handyhjelp.no</a></p>
        <p style="margin: 8px 0;"><strong>Åpningstid:</strong> Man-Fre 09:00-17:00</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Med vennlig hilsen,<br>
        <strong>HandyHjelp-teamet</strong>
      </p>
    </div>
    
    <div class="footer">
      <strong>Levert med kvalitet</strong><br>
      <a href="https://handyhjelp.no" style="color: #0891b2; text-decoration: none;">www.handyhjelp.no</a>
    </div>
  </div>
</body>
</html>
          `,
        });

        log.info('Feedback email sent', { requestId, jobId: job.id, email: quote.email, messageId: emailResponse.data?.id });

        // Mark job as feedback email sent
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ feedback_sent_at: new Date().toISOString() })
          .eq('id', job.id);

        if (updateError) {
          log.error('Error updating job feedback_sent_at', { requestId, jobId: job.id, error: updateError.message });
        } else {
          sentCount++;
        }

      } catch (emailError) {
        log.error('Error sending feedback email', { requestId, jobId: job.id, error: String(emailError) });
      }
    }

    log.info('Feedback request job completed', { requestId, sent: sentCount, total: jobs.length });

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: jobs.length, requestId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    log.error('Fatal error in feedback request function', { requestId, error: String(error) });
    return new Response(
      JSON.stringify({ success: false, error: String(error), requestId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
