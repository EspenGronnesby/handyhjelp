import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCTION_NAME = "send-invoice-request-notification";

// Rate limiting - IP-based with in-memory store
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX_REQUESTS = 10;
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
      error: error instanceof Error ? error.message : error,
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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequestPayload {
  jobId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  jobDescription: string;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const clientIP = getClientIP(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  log.info("Request received", { requestId, clientIP });

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

  try {
    const payload: InvoiceRequestPayload = await req.json();
    log.info("Processing payload", { requestId, jobId: payload.jobId });

    const { jobId, userId, customerName, customerEmail, jobDescription } = payload;

    // Validate required fields
    if (!jobId || !userId || !customerName || !customerEmail || !jobDescription) {
      log.warn("Missing required fields", { requestId });
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      log.warn("Invalid email format", { requestId, customerEmail });
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "HandyHjelp System <team@handyhjelp.no>",
      to: ["team@handyhjelp.no"],
      subject: `Ny fakturaforespørsel fra ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0891B2;">Ny fakturaforespørsel</h1>
          <p>En kunde har bedt om faktura for en fullført jobb.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Kundedetaljer</h3>
            <p><strong>Navn:</strong> ${customerName}</p>
            <p><strong>E-post:</strong> ${customerEmail}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Jobbdetaljer</h3>
            <p><strong>Beskrivelse:</strong> ${jobDescription}</p>
            <p><strong>Jobb-ID:</strong> ${jobId}</p>
          </div>
          
          <p>Logg inn på admin-dashboardet for å legge til faktura.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Dette er en automatisk generert e-post fra HandyHjelp.
          </p>
        </div>
      `,
    });

    log.info("Email sent successfully", { requestId, messageId: emailResponse.data?.id });

    // Create notification for admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin user IDs
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminRoles && adminRoles.length > 0) {
      for (const admin of adminRoles) {
        await supabase.from("notifications").insert({
          user_id: admin.user_id,
          type: "invoice_request",
          title: "Ny fakturaforespørsel",
          message: `${customerName} har bedt om faktura for en fullført jobb.`,
          read: false,
        });
      }
      log.info("Admin notifications created", { requestId, count: adminRoles.length });
    }

    return new Response(JSON.stringify({ success: true, requestId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    log.error("Error processing request", error, { requestId });
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
