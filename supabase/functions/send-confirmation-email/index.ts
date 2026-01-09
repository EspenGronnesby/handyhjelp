import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const FUNCTION_NAME = "send-confirmation-email";

// Rate limiting - IP-based with in-memory store
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimits.get(ip);

  // Clean up old entries periodically
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

// Error response helper
const errorResponse = (message: string, status: number, details?: unknown) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: details instanceof Error ? details.message : details,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    }
  );
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  name: string;
  email: string;
  phone?: string;
  customerType: 'private' | 'business';
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const clientIP = getClientIP(req);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  log.info("Request received", { requestId, method: req.method, clientIP });

  // Rate limiting check
  if (!checkRateLimit(clientIP)) {
    log.warn("Rate limit exceeded", { requestId, clientIP });
    return new Response(
      JSON.stringify({
        success: false,
        error: "Too many requests. Please try again later.",
        timestamp: new Date().toISOString()
      }),
      {
        status: 429,
        headers: { 
          "Content-Type": "application/json", 
          "Retry-After": "60",
          ...corsHeaders 
        }
      }
    );
  }

  // Validate request method
  if (req.method !== "POST") {
    log.warn("Invalid request method", { requestId, method: req.method });
    return errorResponse("Method not allowed", 405);
  }

  let requestData: ConfirmationEmailRequest;

  try {
    requestData = await req.json();
  } catch (parseError) {
    log.error("Failed to parse request body", parseError, { requestId });
    return errorResponse("Invalid JSON in request body", 400);
  }

  const { name, email, phone, customerType } = requestData;

  // Validate required fields
  if (!name || !email || !customerType) {
    log.warn("Missing required fields", { requestId, name: !!name, email: !!email, customerType: !!customerType });
    return errorResponse("Missing required fields: name, email, customerType", 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    log.warn("Invalid email format", { requestId, email });
    return errorResponse("Invalid email format", 400);
  }

  log.info("Sending confirmation email", { requestId, email, customerType });

  try {
    const customerEmailResponse = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [email],
      subject: "Takk for din forespørsel – HandyHjelp",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #0891B2 0%, #06B6D4 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #ffffff;
                padding: 30px 20px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .steps {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .step {
                display: flex;
                align-items: flex-start;
                margin-bottom: 15px;
              }
              .step-number {
                background: #0891B2;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 12px;
                flex-shrink: 0;
              }
              .contact-info {
                background: #f0f9ff;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .contact-item {
                margin-bottom: 10px;
              }
              .contact-label {
                font-weight: 600;
                color: #0891B2;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
                border-top: 1px solid #e5e7eb;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">HandyHjelp</div>
              <h1 style="margin: 0; font-size: 28px;">Takk for din forespørsel!</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hei <strong>${name}</strong>,</p>
              
              <p>Takk for at du kontaktet HandyHjelp!</p>
              
              <p>Vi har mottatt din forespørsel og vil gjennomgå den så snart som mulig. Du kan forvente å høre fra oss <strong>innen 1-3 virkedager</strong> i vår åpningstid.</p>
              
              <div class="steps">
                <h3 style="margin-top: 0; color: #0891B2;">Hva skjer videre?</h3>
                <div class="step">
                  <div class="step-number">1</div>
                  <div>Vi vurderer oppdraget ditt og lager et skreddersydd tilbud</div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div>Du mottar et uforpliktende tilbud på SMS eller e-post</div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div>Hvis du aksepterer, avtaler vi tidspunkt som passer deg</div>
                </div>
              </div>
              
              <div class="contact-info">
                <h3 style="margin-top: 0; color: #0891B2;">Har du spørsmål i mellomtiden?</h3>
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
              
              <p style="margin-top: 30px;">Med vennlig hilsen,<br><strong>HandyHjelp-teamet</strong></p>
            </div>
            
            <div class="footer">
              <strong>Levert med kvalitet</strong><br>
              <a href="https://handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
            </div>
          </body>
        </html>
      `,
    });

    if (customerEmailResponse.error) {
      throw customerEmailResponse.error;
    }

    log.info("Email sent successfully", { 
      requestId, 
      messageId: customerEmailResponse.data?.id,
      recipient: email 
    });

    return new Response(JSON.stringify({ 
      success: true,
      messageId: customerEmailResponse.data?.id,
      requestId
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    log.error("Failed to send confirmation email", error, { requestId, email });

    // Try to send error notification email to team
    try {
      await resend.emails.send({
        from: "HandyHjelp System <team@handyhjelp.no>",
        to: ["team@handyhjelp.no"],
        subject: "⚠️ FEIL: Bekreftelsesmail kunne ikke sendes",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: sans-serif; padding: 20px; }
                .alert { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; }
                .info-box { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="alert">
                <h2 style="color: #dc2626;">⚠️ Feil ved sending av bekreftelsesmail</h2>
                <p>Request ID: ${requestId}</p>
              </div>
              <div class="info-box">
                <p><strong>Navn:</strong> ${name}</p>
                <p><strong>E-post:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone || 'Ikke oppgitt'}</p>
                <p><strong>Type:</strong> ${customerType === 'private' ? 'Privat' : 'Bedrift'}</p>
              </div>
              <div class="info-box">
                <p><strong>Feil:</strong></p>
                <pre style="background: #1f2937; color: #f9fafb; padding: 12px; border-radius: 4px;">${error instanceof Error ? error.message : 'Ukjent feil'}</pre>
              </div>
              <p><strong>⚠️ Vennligst kontakt kunden manuelt.</strong></p>
            </body>
          </html>
        `,
      });
      log.info("Error notification sent to team", { requestId });
    } catch (notificationError) {
      log.error("Failed to send error notification", notificationError, { requestId });
    }

    return errorResponse("Failed to send confirmation email", 500, error);
  }
};

serve(handler);
