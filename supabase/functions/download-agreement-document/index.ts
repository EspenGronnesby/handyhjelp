import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const FUNCTION_NAME = "download-agreement-document";

// Rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX_REQUESTS = 10;
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

// Validate token format (64 hex characters)
function isValidToken(str: string): boolean {
  const tokenRegex = /^[0-9a-f]{64}$/i;
  return tokenRegex.test(str);
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
  const token = url.searchParams.get("token");

  // Validate token parameter
  if (!token) {
    log.warn("Missing token parameter", { requestId });
    return new Response("Ugyldig eller manglende nedlastingslenke", {
      status: 400,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }

  if (!isValidToken(token)) {
    log.warn("Invalid token format", { requestId });
    return new Response("Ugyldig nedlastingslenke", {
      status: 400,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }

  try {
    // Create Supabase client with service role for token validation
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

    // Validate and consume the download token using the secure RPC function
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('validate_download_token', { 
        p_token: token, 
        p_ip_address: clientIP 
      });

    if (tokenError) {
      log.error("Token validation failed", tokenError, { requestId });
      return new Response("Kunne ikke validere nedlastingslenke", {
        status: 500,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    if (!tokenData || tokenData.length === 0) {
      log.warn("Token not found", { requestId });
      return new Response("Nedlastingslenken er ugyldig eller utløpt", {
        status: 404,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    const validatedToken = tokenData[0];

    if (!validatedToken.is_valid) {
      log.warn("Token is invalid or expired", { requestId, agreementId: validatedToken.agreement_id });
      return new Response("Nedlastingslenken er allerede brukt eller utløpt. Vennligst kontakt oss for en ny lenke.", {
        status: 410,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    // Get the correct document URL based on type
    const documentPath = validatedToken.document_type === "contract" 
      ? validatedToken.contract_document_url 
      : validatedToken.offer_document_url;

    if (!documentPath) {
      log.warn("Document not available", { requestId, agreementId: validatedToken.agreement_id, type: validatedToken.document_type });
      return new Response(`${validatedToken.document_type === "contract" ? "Kontrakt" : "Tilbud"} er ikke tilgjengelig`, {
        status: 404,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    log.info("Downloading document from storage", { requestId, agreementId: validatedToken.agreement_id, type: validatedToken.document_type, documentPath });

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
    const filename = validatedToken.document_type === "contract" 
      ? `kontrakt-${validatedToken.contact_person?.replace(/\s+/g, '-').toLowerCase() || 'dokument'}.pdf`
      : `tilbud-${validatedToken.contact_person?.replace(/\s+/g, '-').toLowerCase() || 'dokument'}.pdf`;

    log.info("Document download successful", { requestId, agreementId: validatedToken.agreement_id, type: validatedToken.document_type, filename });

    // Return the file as a downloadable PDF
    return new Response(fileData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        ...corsHeaders
      }
    });

  } catch (error) {
    log.error("Unexpected error during download", error, { requestId });
    return new Response("En uventet feil oppstod", {
      status: 500,
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }
};

serve(handler);
