import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

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

  let requestData: JobStatusEmailRequest;

  try {
    requestData = await req.json();
  } catch (parseError) {
    log.error("Failed to parse request body", parseError, { requestId });
    return errorResponse("Invalid JSON in request body", 400, requestId);
  }

  const { customerName, customerEmail, jobDescription, status } = requestData;

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

  try {
    let subject: string;
    let html: string;

    if (status === "started") {
      subject = "Ditt oppdrag er i gang – HandyHjelp | Levert med kvalitet";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2C3E50;">Hei ${customerName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Gode nyheter! Vi har startet arbeidet med ditt oppdrag:
          </p>
          
          <div style="background-color: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; font-weight: bold; margin: 0;">
              "${jobDescription}"
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Takk for tålmodigheten – vi jobber for å levere med kvalitet. Du vil motta en ny bekreftelse når oppdraget er fullført.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Har du spørsmål underveis?</p>
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
      `;
    } else {
      subject = "Oppdraget er fullført – Takk for tilliten! | Levert med kvalitet ✓";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2C3E50;">Hei ${customerName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Oppdraget ditt er nå fullført:
          </p>
          
          <div style="background-color: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; font-weight: bold; margin: 0;">
              "${jobDescription}"
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Takk for at du valgte HandyHjelp! Vi håper du er fornøyd med arbeidet.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Har du tilbakemeldinger eller nye oppdrag?</p>
            <p style="font-size: 16px; margin-bottom: 10px;">Vi er alltid klare til å hjelpe.</p>
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
        subject: "⚠️ Feil ved sending av jobbstatus-epost",
        html: `
          <h2>Feil ved sending av jobbstatus-epost</h2>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Kunde:</strong> ${customerName} (${customerEmail})</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Jobbeskrivelse:</strong> ${jobDescription}</p>
          <p><strong>Feilmelding:</strong> ${error instanceof Error ? error.message : 'Ukjent feil'}</p>
          <p><strong>⚠️ Vennligst informer kunden manuelt.</strong></p>
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
