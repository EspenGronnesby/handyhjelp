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
      subject: "Takk for din avtaleforespørsel – HandyHjelp | Levert med kvalitet",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2C3E50;">Hei ${contactPerson},</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Takk for at dere vurderer HandyHjelp som deres faste servicepartner! 🏠
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Vi har mottatt forespørselen deres og vil gjennomgå den grundig. Dere kan forvente å bli kontaktet <strong>innen 1-3 virkedager</strong> for en uforpliktende samtale om deres behov.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Har dere spørsmål i mellomtiden?</p>
            <p style="margin: 5px 0;">📞 Ring oss: <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a></p>
            <p style="margin: 5px 0;">📧 E-post: <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a></p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Med vennlig hilsen,<br>
            <strong>HandyHjelp-teamet</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6B7280; text-align: center;">
            HandyHjelp – Levert med kvalitet<br>
            <a href="https://www.handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
          </p>
        </div>
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
