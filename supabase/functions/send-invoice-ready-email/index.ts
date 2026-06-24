import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCTION_NAME = "send-invoice-ready-email";

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

function escapeHtml(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface InvoiceReadyPayload {
  userId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: string;
  invoiceNumber: string;
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

  // --- AuthN/Z: require admin or platform_owner ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  const jwt = authHeader.replace("Bearer ", "");
  const supabaseUrlForAuth = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKeyForAuth = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authClient = createClient(supabaseUrlForAuth, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: userData, error: userError } = await authClient.auth.getUser(jwt);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  const supabaseForRoles = createClient(supabaseUrlForAuth, supabaseServiceKeyForAuth);
  const { data: roleRows } = await supabaseForRoles
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .in("role", ["admin", "platform_owner"]);
  if (!roleRows || roleRows.length === 0) {
    return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
      status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Resolve sender identity for the email history
  const senderUserId = userData.user.id;
  const { data: senderProfile } = await supabaseForRoles
    .from("profiles")
    .select("full_name")
    .eq("id", senderUserId)
    .maybeSingle();
  const senderName = senderProfile?.full_name ?? userData.user.email ?? "System";

  try {
    const payload: InvoiceReadyPayload = await req.json();
    log.info("Processing payload", { requestId, invoiceNumber: payload.invoiceNumber });

    const { userId, customerName, customerEmail, amount, dueDate, invoiceNumber } = payload;

    // Validate required fields
    if (!userId || !customerName || !customerEmail || !amount || !dueDate || !invoiceNumber) {
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

    const formattedAmount = new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);

    const formattedDate = new Date(dueDate).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Send email to customer
    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [customerEmail],
      subject: `Faktura ${invoiceNumber} er klar`,
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
            .invoice-details { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .contact-info { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .cta-button { display: inline-block; background-color: #0891B2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">HandyHjelp</div>
              <h1>Faktura tilgjengelig</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px;">Hei <strong>${escapeHtml(customerName)}</strong>,</p>
              
              <p style="font-size: 16px; line-height: 1.6;">Din faktura for utført arbeid er nå klar.</p>
              
              <div class="invoice-details">
                <h3 style="margin-top: 0; color: #0891B2;">Fakturadetaljer</h3>
                <p style="margin: 8px 0;"><strong>Fakturanummer:</strong> ${escapeHtml(invoiceNumber)}</p>
                <p style="margin: 8px 0;"><strong>Beløp:</strong> ${escapeHtml(formattedAmount)}</p>
                <p style="margin: 8px 0;"><strong>Forfallsdato:</strong> ${escapeHtml(formattedDate)}</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">Du kan laste ned fakturaen fra din kundeside på handyhjelp.no</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://handyhjelp.no/dashboard/aktivitet" class="cta-button">
                  Se faktura
                </a>
              </div>
              
              <div class="contact-info">
                <h3 style="margin-top: 0; color: #0891B2;">Har du spørsmål?</h3>
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
      `,
      });
      if (emailResponse.error) {
        throw emailResponse.error;
      }
    } catch (sendError) {
      log.error("Failed to send invoice ready email", sendError, { requestId, invoiceNumber });

      // Log failed send to email history
      const supabaseUrlFail = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKeyFail = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseFail = createClient(supabaseUrlFail, supabaseServiceKeyFail);
      const { error: failLogError } = await supabaseFail.from("email_logs").insert({
        recipient_email: customerEmail,
        recipient_name: customerName || null,
        recipient_type: 'customer',
        subject: `Faktura ${invoiceNumber} er klar`,
        content: `Faktura ${invoiceNumber} på ${formattedAmount} er klar. Forfallsdato: ${formattedDate}.`,
        template_name: 'invoice_ready',
        sender_user_id: senderUserId,
        sender_name: senderName,
        status: 'failed',
        error_message: sendError instanceof Error ? sendError.message : 'Unknown error',
        sent_at: new Date().toISOString(),
      });
      if (failLogError) {
        log.warn("Failed to write failed email_log", { requestId, error: failLogError.message });
      }
      throw sendError;
    }

    log.info("Email sent successfully", { requestId, messageId: emailResponse.data?.id });

    // Create notification for customer
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log successful send to email history
    const { error: logError } = await supabase.from("email_logs").insert({
      recipient_email: customerEmail,
      recipient_name: customerName || null,
      recipient_type: 'customer',
      subject: `Faktura ${invoiceNumber} er klar`,
      content: `Faktura ${invoiceNumber} på ${formattedAmount} er klar. Forfallsdato: ${formattedDate}.`,
      template_name: 'invoice_ready',
      sender_user_id: senderUserId,
      sender_name: senderName,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
    if (logError) {
      log.warn("Failed to write email_log", { requestId, error: logError.message });
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "invoice",
      title: "Faktura tilgjengelig",
      message: `Faktura ${invoiceNumber} på ${formattedAmount} er nå klar. Forfallsdato: ${formattedDate}`,
      read: false,
    });

    log.info("Customer notification created", { requestId, userId });

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
