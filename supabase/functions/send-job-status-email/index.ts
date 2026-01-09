import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCTION_NAME = "send-job-status-email";

// Structured logging utility
const log = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: "INFO",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: "ERROR",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      ...data
    }));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(JSON.stringify({
      level: "WARN",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Error response helper
const errorResponse = (message: string, status: number, requestId: string, details?: unknown) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: details instanceof Error ? details.message : details,
      requestId,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    }
  );
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface JobStatusEmailRequest {
  customerName: string;
  customerEmail: string;
  jobDescription: string;
  status: "started" | "completed";
  jobId?: string;
}

// Generate a secure random token
const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  log.info("Request received", { requestId, method: req.method });

  if (req.method !== "POST") {
    log.warn("Invalid request method", { requestId, method: req.method });
    return errorResponse("Method not allowed", 405, requestId);
  }

  let requestData: JobStatusEmailRequest;

  try {
    requestData = await req.json();
  } catch (parseError) {
    log.error("Failed to parse request body", parseError, { requestId });
    return errorResponse("Invalid JSON in request body", 400, requestId);
  }

  const { customerName, customerEmail, jobDescription, status, jobId } = requestData;

  // Validate required fields
  if (!customerName || !customerEmail || !jobDescription || !status) {
    log.warn("Missing required fields", { 
      requestId, 
      customerName: !!customerName, 
      customerEmail: !!customerEmail, 
      jobDescription: !!jobDescription, 
      status: !!status 
    });
    return errorResponse("Missing required fields", 400, requestId);
  }

  // Validate status
  if (!["started", "completed"].includes(status)) {
    log.warn("Invalid status value", { requestId, status });
    return errorResponse("Status must be 'started' or 'completed'", 400, requestId);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    log.warn("Invalid email format", { requestId, customerEmail });
    return errorResponse("Invalid email format", 400, requestId);
  }

  log.info("Sending job status email", { requestId, customerEmail, status });

  // Initialize Supabase client for feedback token
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let subject: string;
    let html: string;

    if (status === "started") {
      subject = "Ditt oppdrag er i gang – HandyHjelp";
      html = `
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
            .job-description { background: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .contact-info { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">HandyHjelp</div>
              <h1>Ditt oppdrag er i gang!</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px;">Hei <strong>${customerName}</strong>,</p>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Gode nyheter! Vi har startet arbeidet med ditt oppdrag:
              </p>
              
              <div class="job-description">
                <p style="font-size: 16px; font-weight: bold; margin: 0;">
                  "${jobDescription}"
                </p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Takk for tålmodigheten – vi jobber for å levere med kvalitet. Du vil motta en ny bekreftelse når oppdraget er fullført.
              </p>
              
              <div class="contact-info">
                <h3 style="margin-top: 0; color: #0891B2;">Har du spørsmål underveis?</h3>
                <p style="margin: 8px 0;"><strong>Telefon:</strong> <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a></p>
                <p style="margin: 8px 0;"><strong>E-post:</strong> <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a></p>
                <p style="margin: 8px 0;"><strong>Åpningstid:</strong> Man-Fre 09:00-17:00</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Med vennlig hilsen,<br>
                <strong>HandyHjelp-teamet</strong>
              </p>
            </div>
            
            <div class="footer">
              <strong>Levert med kvalitet</strong><br>
              <a href="https://handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // Generate feedback token for completed jobs
      let feedbackSection = '';
      
      if (jobId) {
        const feedbackToken = generateToken();
        
        // Insert feedback record
        const { error: feedbackError } = await supabase
          .from('quick_feedback')
          .insert({
            job_id: jobId,
            token: feedbackToken
          });

        if (feedbackError) {
          log.warn("Failed to create feedback token", { requestId, error: feedbackError.message });
        } else {
          const feedbackBaseUrl = `${supabaseUrl}/functions/v1/submit-quick-feedback`;
          
          feedbackSection = `
            <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
              <h3 style="margin: 0 0 20px 0; color: #0891B2; font-size: 18px;">Hvordan var opplevelsen?</h3>
              
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; max-width: 100%;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="${feedbackBaseUrl}?token=${feedbackToken}&rating=sad" 
                       style="display: block; text-decoration: none; text-align: center;">
                      <div style="font-size: 40px; line-height: 1;">😟</div>
                      <div style="color: #EF4444; font-size: 11px; font-weight: 600; margin-top: 5px;">Misfornøyd</div>
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="${feedbackBaseUrl}?token=${feedbackToken}&rating=neutral" 
                       style="display: block; text-decoration: none; text-align: center;">
                      <div style="font-size: 40px; line-height: 1;">😐</div>
                      <div style="color: #F59E0B; font-size: 11px; font-weight: 600; margin-top: 5px;">Nøytral</div>
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="${feedbackBaseUrl}?token=${feedbackToken}&rating=happy" 
                       style="display: block; text-decoration: none; text-align: center;">
                      <div style="font-size: 40px; line-height: 1;">😊</div>
                      <div style="color: #10B981; font-size: 11px; font-weight: 600; margin-top: 5px;">Fornøyd</div>
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 12px;">Trykk på et av fjesene</p>
            </div>
          `;
        }
      }

      subject = "Oppdraget er fullført – Takk for tilliten!";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #10B981, #34D399); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { color: white; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .job-description { background: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .contact-info { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">HandyHjelp</div>
              <h1>Oppdraget er fullført!</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px;">Hei <strong>${customerName}</strong>,</p>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Oppdraget ditt er nå fullført:
              </p>
              
              <div class="job-description">
                <p style="font-size: 16px; font-weight: bold; margin: 0;">
                  "${jobDescription}"
                </p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Takk for at du valgte HandyHjelp! Vi håper du er fornøyd med arbeidet.
              </p>
              
              ${feedbackSection}
              
              <div class="contact-info">
                <h3 style="margin-top: 0; color: #0891B2;">Har du tilbakemeldinger eller nye oppdrag?</h3>
                <p style="font-size: 16px; margin-bottom: 10px;">Vi er alltid klare til å hjelpe.</p>
                <p style="margin: 8px 0;"><strong>Telefon:</strong> <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a></p>
                <p style="margin: 8px 0;"><strong>E-post:</strong> <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a></p>
                <p style="margin: 8px 0;"><strong>Åpningstid:</strong> Man-Fre 09:00-17:00</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Med vennlig hilsen,<br>
                <strong>HandyHjelp-teamet</strong>
              </p>
            </div>
            
            <div class="footer">
              <strong>Levert med kvalitet</strong><br>
              <a href="https://handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [customerEmail],
      subject: subject,
      html: html,
    });

    if (error) {
      throw error;
    }

    log.info("Job status email sent successfully", { 
      requestId, 
      messageId: data?.id,
      recipient: customerEmail,
      status 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      requestId 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    log.error("Failed to send job status email", error, { requestId, customerEmail, status });

    // Send error notification to team
    try {
      await resend.emails.send({
        from: "HandyHjelp System <team@handyhjelp.no>",
        to: ["team@handyhjelp.no"],
        subject: "Feil ved sending av jobbstatus-epost",
        html: `
          <h2>Feil ved sending av jobbstatus-epost</h2>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Kunde:</strong> ${customerName} (${customerEmail})</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Jobbeskrivelse:</strong> ${jobDescription}</p>
          <p><strong>Feilmelding:</strong> ${error instanceof Error ? error.message : 'Ukjent feil'}</p>
          <p><strong>Vennligst informer kunden manuelt.</strong></p>
        `,
      });
      log.info("Error notification sent to team", { requestId });
    } catch (notificationError) {
      log.error("Failed to send error notification", notificationError, { requestId });
    }

    return errorResponse("Failed to send job status email", 500, requestId, error);
  }
};

serve(handler);
