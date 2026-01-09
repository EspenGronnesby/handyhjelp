import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const FUNCTION_NAME = "send-agreement-confirmation";

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

interface AgreementConfirmationRequest {
  contactPerson: string;
  email: string;
}

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

  let requestData: AgreementConfirmationRequest;

  try {
    requestData = await req.json();
  } catch (parseError) {
    log.error("Failed to parse request body", parseError, { requestId });
    return errorResponse("Invalid JSON in request body", 400, requestId);
  }

  const { contactPerson, email } = requestData;

  // Validate required fields
  if (!contactPerson || !email) {
    log.warn("Missing required fields", { requestId, contactPerson: !!contactPerson, email: !!email });
    return errorResponse("Missing required fields: contactPerson, email", 400, requestId);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    log.warn("Invalid email format", { requestId, email });
    return errorResponse("Invalid email format", 400, requestId);
  }

  log.info("Sending agreement confirmation email", { requestId, email });

  try {
    const { data, error } = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [email],
      subject: "Takk for din avtaleforespørsel – HandyHjelp",
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
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .contact-info { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .contact-info h3 { margin-top: 0; color: #0891B2; }
            .contact-item { margin: 8px 0; }
            .contact-label { font-weight: bold; color: #374151; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">HandyHjelp</div>
              <h1>Takk for din avtaleforespørsel!</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hei <strong>${contactPerson}</strong>,</p>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Takk for at dere vurderer HandyHjelp som deres faste servicepartner!
              </p>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Vi har mottatt forespørselen deres og vil gjennomgå den grundig. Dere kan forvente å bli kontaktet <strong>innen 1-3 virkedager</strong> for en uforpliktende samtale om deres behov.
              </p>
              
              <div class="contact-info">
                <h3>Har dere spørsmål i mellomtiden?</h3>
                <div class="contact-item">
                  <span class="contact-label">Telefon:</span> <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a>
                </div>
                <div class="contact-item">
                  <span class="contact-label">E-post:</span> <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a>
                </div>
                <div class="contact-item">
                  <span class="contact-label">Åpningstid:</span> Man-Fre 09:00-17:00
                </div>
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
      `,
    });

    if (error) {
      throw error;
    }

    log.info("Agreement confirmation email sent successfully", { 
      requestId, 
      messageId: data?.id,
      recipient: email 
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
    log.error("Failed to send agreement confirmation email", error, { requestId, email });

    // Send error notification to team
    try {
      await resend.emails.send({
        from: "HandyHjelp System <team@handyhjelp.no>",
        to: ["team@handyhjelp.no"],
        subject: "⚠️ Feil ved sending av avtalebekreftelse",
        html: `
          <h2>Feil ved sending av avtalebekreftelse</h2>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Kontaktperson:</strong> ${contactPerson} (${email})</p>
          <p><strong>Feilmelding:</strong> ${error instanceof Error ? error.message : 'Ukjent feil'}</p>
          <p><strong>⚠️ Vennligst kontakt kunden manuelt.</strong></p>
        `,
      });
      log.info("Error notification sent to team", { requestId });
    } catch (notificationError) {
      log.error("Failed to send error notification", notificationError, { requestId });
    }

    return errorResponse("Failed to send agreement confirmation email", 500, requestId, error);
  }
};

serve(handler);
