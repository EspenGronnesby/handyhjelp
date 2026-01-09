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
      <p style="font-size: 18px; margin-bottom: 20px;">Hei <strong>${quote.name}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
        For et par dager siden fullførte vi <strong>${serviceType}</strong> for deg. 
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
        <a href="${reviewUrl}" class="cta-button">
          Gi din tilbakemelding
        </a>
      </div>
      
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
