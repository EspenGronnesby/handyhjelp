import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Structured logging
const log = {
  info: (message: string, data?: Record<string, unknown>) => 
    console.log(JSON.stringify({ level: 'INFO', message, ...data, timestamp: new Date().toISOString() })),
  error: (message: string, data?: Record<string, unknown>) => 
    console.error(JSON.stringify({ level: 'ERROR', message, ...data, timestamp: new Date().toISOString() })),
  warn: (message: string, data?: Record<string, unknown>) => 
    console.warn(JSON.stringify({ level: 'WARN', message, ...data, timestamp: new Date().toISOString() })),
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log.info('Starting feedback request job');

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
      log.error('Error fetching jobs', { error: jobsError.message });
      throw jobsError;
    }

    log.info('Found jobs needing feedback emails', { count: jobs?.length || 0 });

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No jobs need feedback emails', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const siteUrl = Deno.env.get('SITE_URL') || 'https://handyhjelp.no';

    for (const job of jobs) {
      const quote = (job.quotes as unknown as { id: string; name: string; email: string; type: string });
      if (!quote) continue;
      
      const reviewUrl = `${siteUrl}/anmeldelse/${job.id}`;
      
      const serviceType = quote.type === 'vaktmester' ? 'Vaktmestertjenester' :
                         quote.type === 'tomrer' ? 'Tømrertjenester' :
                         quote.type === 'blikk' ? 'Blikkenslagertjenester' :
                         quote.type === 'takrennerens' ? 'Takrennerens' : 'Tjenester';

      try {
        const emailResponse = await resend.emails.send({
          from: 'HandyHjelp <post@handyhjelp.no>',
          to: [quote.email],
          subject: 'Hvordan gikk jobben? Vi setter pris på din tilbakemelding 🙏',
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="https://bwwodqzhkehirerzlzpu.supabase.co/storage/v1/object/public/site-images/handyhjelp-logo.png" alt="HandyHjelp" style="height: 50px; width: auto;">
      </div>
      
      <!-- Heading -->
      <h1 style="color: #1a2332; font-size: 24px; font-weight: 700; text-align: center; margin: 0 0 16px 0;">
        Hei ${quote.name}! 👋
      </h1>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
        For et par dager siden fullførte vi <strong>${serviceType}</strong> for deg. 
        Vi håper du er fornøyd med arbeidet!
      </p>
      
      <!-- Stars illustration -->
      <div style="text-align: center; margin: 32px 0;">
        <span style="font-size: 40px;">⭐️⭐️⭐️⭐️⭐️</span>
      </div>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 32px 0;">
        Din tilbakemelding betyr mye for oss og hjelper andre kunder å ta gode valg. 
        Det tar bare 1 minutt å dele din opplevelse.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 14px rgba(8, 145, 178, 0.4);">
          Gi din tilbakemelding
        </a>
      </div>
      
      <!-- Benefits -->
      <div style="background: #f0fdfa; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <p style="color: #0d9488; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">
          Hvorfor dele din mening?
        </p>
        <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Hjelper oss å bli enda bedre</li>
          <li>Veileder andre kunder</li>
          <li>Tar kun 1 minutt</li>
        </ul>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
          Tusen takk for at du valgte HandyHjelp! 💚
        </p>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 16px 0 0 0;">
          HandyHjelp AS | Ægirsvei 3, 4632 Kristiansand<br>
          <a href="tel:+4741250553" style="color: #0891b2; text-decoration: none;">+47 412 50 553</a> | 
          <a href="mailto:handyhjelp@gmail.com" style="color: #0891b2; text-decoration: none;">handyhjelp@gmail.com</a>
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>
          `,
        });

        log.info('Feedback email sent', { jobId: job.id, email: quote.email, response: emailResponse });

        // Mark job as feedback email sent
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ feedback_sent_at: new Date().toISOString() })
          .eq('id', job.id);

        if (updateError) {
          log.error('Error updating job feedback_sent_at', { jobId: job.id, error: updateError.message });
        } else {
          sentCount++;
        }

      } catch (emailError) {
        log.error('Error sending feedback email', { jobId: job.id, error: String(emailError) });
      }
    }

    log.info('Feedback request job completed', { sent: sentCount, total: jobs.length });

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: jobs.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    log.error('Fatal error in feedback request function', { error: String(error) });
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
