import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const FUNCTION_NAME = "send-agreement-status-email";

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

interface AgreementStatusEmailRequest {
  contactPerson: string;
  email: string;
  address: string;
  services: string[];
  status: "under_review" | "offer_sent" | "contract_signed" | "rejected";
  offerAmount?: number;
  offerDocumentUrl?: string;
  contractDocumentUrl?: string;
}

const STATUS_CONFIG = {
  under_review: {
    subject: "Vi har mottatt din forespørsel – HandyHjelp",
    title: "Din forespørsel er under vurdering",
    message: "Takk for din interesse i en fast serviceavtale! Vi ser nå gjennom din forespørsel og vil kontakte deg snart med mer informasjon.",
    color: "#3B82F6"
  },
  offer_sent: {
    subject: "Du har mottatt et tilbud fra HandyHjelp",
    title: "Vi har sendt deg et tilbud!",
    message: "Basert på din forespørsel har vi utarbeidet et skreddersydd tilbud til deg. Ta gjerne kontakt hvis du har spørsmål eller ønsker å diskutere detaljene.",
    color: "#8B5CF6"
  },
  contract_signed: {
    subject: "Velkommen som avtalekunde – HandyHjelp",
    title: "Avtalen er bekreftet! 🎉",
    message: "Gratulerer! Du er nå avtalekunde hos HandyHjelp. Vi ser frem til et godt samarbeid og vil ta kontakt for å avtale oppstart.",
    color: "#10B981"
  },
  rejected: {
    subject: "Oppdatering på din forespørsel – HandyHjelp",
    title: "Angående din forespørsel",
    message: "Dessverre kan vi ikke tilby tjenester for denne forespørselen på dette tidspunktet. Ta gjerne kontakt hvis du har andre behov vi kan hjelpe med.",
    color: "#EF4444"
  }
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

  let requestData: AgreementStatusEmailRequest;

  try {
    requestData = await req.json();
  } catch (parseError) {
    log.error("Failed to parse request body", parseError, { requestId });
    return errorResponse("Invalid JSON in request body", 400, requestId);
  }

  const { contactPerson, email, address, services, status, offerAmount, offerDocumentUrl, contractDocumentUrl } = requestData;

  if (!contactPerson || !email || !status) {
    log.warn("Missing required fields", { requestId, contactPerson: !!contactPerson, email: !!email, status: !!status });
    return errorResponse("Missing required fields", 400, requestId);
  }

  if (!["under_review", "offer_sent", "contract_signed", "rejected"].includes(status)) {
    log.warn("Invalid status value", { requestId, status });
    return errorResponse("Invalid status value", 400, requestId);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    log.warn("Invalid email format", { requestId, email });
    return errorResponse("Invalid email format", 400, requestId);
  }

  log.info("Sending agreement status email", { requestId, email, status });

  const config = STATUS_CONFIG[status];
  const serviceLabels: Record<string, string> = {
    maintenance: "Generelt vedlikehold",
    cleaning: "Utvendig renhold",
    winter: "Snømåking og strøing",
    summer: "Gressklipping og hagearbeid",
    inspection: "Tilsyn og inspeksjoner",
    other: "Andre tjenester"
  };

  const servicesList = services?.map(s => serviceLabels[s] || s).join(", ") || "Ikke spesifisert";

  try {
    // Bygg tilbudsdetaljer hvis relevant
    let offerSection = '';
    if (status === 'offer_sent' && offerAmount) {
      offerSection = `
        <div style="background-color: #EDE9FE; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #8B5CF6;">
          <h3 style="margin: 0 0 10px 0; color: #5B21B6;">💰 Tilbudsdetaljer</h3>
          <p style="font-size: 24px; font-weight: bold; color: #5B21B6; margin: 0;">
            kr ${offerAmount.toLocaleString('nb-NO')}/mnd
          </p>
          ${offerDocumentUrl ? `
            <a href="${offerDocumentUrl}" style="display: inline-block; margin-top: 15px; background-color: #8B5CF6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              📄 Last ned tilbudsdokument
            </a>
          ` : ''}
        </div>
      `;
    }

    // Bygg kontraktdetaljer hvis relevant
    let contractSection = '';
    if (status === 'contract_signed' && contractDocumentUrl) {
      contractSection = `
        <div style="background-color: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10B981;">
          <h3 style="margin: 0 0 10px 0; color: #047857;">📋 Din kontrakt</h3>
          <p style="color: #047857; margin: 0 0 15px 0;">Kontrakten din er nå klar for nedlasting.</p>
          <a href="${contractDocumentUrl}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            📄 Last ned kontrakt
          </a>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${config.color}; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${config.title}</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #E5E7EB; border-top: none;">
          <h2 style="color: #2C3E50; margin-top: 0;">Hei ${contactPerson},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4A5568;">
            ${config.message}
          </p>

          ${offerSection}
          ${contractSection}
          
          <div style="background-color: #F1F5F9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2C3E50;">Detaljer om forespørselen:</h3>
            <p style="margin: 8px 0; color: #4A5568;"><strong>Adresse:</strong> ${address || 'Ikke oppgitt'}</p>
            <p style="margin: 8px 0; color: #4A5568;"><strong>Tjenester:</strong> ${servicesList}</p>
          </div>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #F8FAFC; border-radius: 8px; border-left: 4px solid ${config.color};">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #2C3E50;">Har du spørsmål?</p>
            <p style="margin: 5px 0; color: #4A5568;">📞 Ring oss: <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a></p>
            <p style="margin: 5px 0; color: #4A5568;">📧 E-post: <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a></p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4A5568;">
            Med vennlig hilsen,<br>
            <strong>HandyHjelp-teamet</strong>
          </p>
        </div>
        
        <div style="padding: 20px; background-color: #F8FAFC; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #E5E7EB; border-top: none;">
          <p style="font-size: 14px; color: #6B7280; margin: 0;">
            HandyHjelp – Levert med kvalitet<br>
            <a href="https://www.handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
          </p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [email],
      subject: config.subject,
      html: html,
    });

    if (error) {
      throw error;
    }

    log.info("Agreement status email sent successfully", { requestId, messageId: data?.id, recipient: email, status });

    return new Response(JSON.stringify({ success: true, data, requestId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    log.error("Failed to send agreement status email", error, { requestId, email, status });

    try {
      await resend.emails.send({
        from: "HandyHjelp System <team@handyhjelp.no>",
        to: ["team@handyhjelp.no"],
        subject: "⚠️ Feil ved sending av avtalestatus-epost",
        html: `
          <h2>Feil ved sending av avtalestatus-epost</h2>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Kontaktperson:</strong> ${contactPerson} (${email})</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Adresse:</strong> ${address}</p>
          <p><strong>Feilmelding:</strong> ${error instanceof Error ? error.message : 'Ukjent feil'}</p>
          <p><strong>⚠️ Vennligst informer kunden manuelt.</strong></p>
        `,
      });
      log.info("Error notification sent to team", { requestId });
    } catch (notificationError) {
      log.error("Failed to send error notification", notificationError, { requestId });
    }

    return errorResponse("Failed to send agreement status email", 500, requestId, error);
  }
};

serve(handler);
