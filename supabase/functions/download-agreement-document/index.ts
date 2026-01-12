import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const FUNCTION_NAME = "download-agreement-document";

// Rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60000;

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

// Validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const clientIP = getClientIP(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  log.info("Download request received", { requestId, method: req.method, clientIP });

  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    log.warn("Rate limit exceeded", { requestId, clientIP });
    return new Response("For mange forespørsler. Vennligst vent litt.", {
      status: 429,
      headers: { "Content-Type": "text/plain", "Retry-After": "60", ...corsHeaders }
    });
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }

  // Parse query parameters
  const url = new URL(req.url);
  const agreementId = url.searchParams.get("id");
  const type = url.searchParams.get("type"); // 'offer' or 'contract'

  // Validate parameters
  if (!agreementId || !type) {
    log.warn("Missing parameters", { requestId, agreementId: !!agreementId, type: !!type });
    return new Response("Mangler påkrevde parametere (id og type)", {
      status: 400,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }

  if (!isValidUUID(agreementId)) {
    log.warn("Invalid agreement ID format", { requestId, agreementId });
    return new Response("Ugyldig avtale-ID", {
      status: 400,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }

  if (!["offer", "contract"].includes(type)) {
    log.warn("Invalid document type", { requestId, type });
    return new Response("Ugyldig dokumenttype (må være 'offer' eller 'contract')", {
      status: 400,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }

  try {
    // Create Supabase client with service role for storage access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      log.error("Missing Supabase environment variables", undefined, { requestId });
      return new Response("Server configuration error", {
        status: 500,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch agreement from database
    const { data: agreement, error: dbError } = await supabase
      .from("service_agreements")
      .select("offer_document_url, contract_document_url, contact_person")
      .eq("id", agreementId)
      .single();

    if (dbError || !agreement) {
      log.warn("Agreement not found", { requestId, agreementId, error: dbError });
      return new Response("Avtale ikke funnet", {
        status: 404,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    // Get the correct document URL based on type
    const documentPath = type === "contract" 
      ? agreement.contract_document_url 
      : agreement.offer_document_url;

    if (!documentPath) {
      log.warn("Document not available", { requestId, agreementId, type });
      return new Response(`${type === "contract" ? "Kontrakt" : "Tilbud"} er ikke tilgjengelig`, {
        status: 404,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    log.info("Downloading document from storage", { requestId, agreementId, type, documentPath });

    // Download file from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from("agreement-documents")
      .download(documentPath);

    if (storageError || !fileData) {
      log.error("Failed to download from storage", storageError, { requestId, documentPath });
      return new Response("Kunne ikke laste ned dokumentet", {
        status: 500,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    // Generate filename
    const filename = type === "contract" 
      ? `kontrakt-${agreement.contact_person?.replace(/\s+/g, '-').toLowerCase() || 'dokument'}.pdf`
      : `tilbud-${agreement.contact_person?.replace(/\s+/g, '-').toLowerCase() || 'dokument'}.pdf`;

    log.info("Document download successful", { requestId, agreementId, type, filename });

    // Return the file as a downloadable PDF
    return new Response(fileData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
        ...corsHeaders
      }
    });

  } catch (error) {
    log.error("Unexpected error during download", error, { requestId, agreementId, type });
    return new Response("En uventet feil oppstod", {
      status: 500,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }
};

serve(handler);
