import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EventBody = {
  event_type: "pageview" | "conversion" | "cta_click";
  event_name: string;
  path?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device?: "mobile" | "tablet" | "desktop";
  session_id?: string;
  user_id?: string | null;
  related_quote_id?: string | null;
  related_agreement_id?: string | null;
  metadata?: Record<string, unknown>;
};

function clamp(s: unknown, max = 500): string | null {
  if (typeof s !== "string") return null;
  const v = s.trim();
  if (!v) return null;
  return v.length > max ? v.slice(0, max) : v;
}

// Vindu-basert rate limiting: maks 60 events per minutt per IP
// (analytics er høyfrekvent, så cooldown-modellen fra submit-quick-feedback passer ikke)
const RATE_WINDOW_MS = 60000;
const RATE_MAX_PER_WINDOW = 60;
const rateLimits = new Map<string, { windowStart: number; count: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  if (rateLimits.size > 10000) {
    for (const [key, value] of rateLimits.entries()) {
      if (now - value.windowStart > RATE_WINDOW_MS) rateLimits.delete(key);
    }
  }

  const entry = rateLimits.get(ip);
  if (!entry || now - entry.windowStart >= RATE_WINDOW_MS) {
    rateLimits.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_MAX_PER_WINDOW;
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
}

// Utled user_id fra JWT i Authorization-header — klient-oppgitt user_id kan ikke stoles på.
// supabase.functions.invoke sender automatisk brukerens token når en sesjon finnes,
// så innloggede brukere får samme user_id som før; anonyme får null.
async function getUserIdFromAuth(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

const METADATA_MAX_BYTES = 2000;

function safeMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  try {
    if (JSON.stringify(metadata).length > METADATA_MAX_BYTES) return {};
    return metadata as Record<string, unknown>;
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!checkRateLimit(getClientIP(req))) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as EventBody;
    if (
      !body?.event_type ||
      !["pageview", "conversion", "cta_click"].includes(body.event_type) ||
      !body?.event_name
    ) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-country") ||
      null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const row = {
      event_type: body.event_type,
      event_name: clamp(body.event_name, 120) ?? "unknown",
      path: clamp(body.path, 500),
      referrer: clamp(body.referrer, 500),
      utm_source: clamp(body.utm_source, 120),
      utm_medium: clamp(body.utm_medium, 120),
      utm_campaign: clamp(body.utm_campaign, 120),
      country,
      device:
        body.device && ["mobile", "tablet", "desktop"].includes(body.device)
          ? body.device
          : null,
      session_id: clamp(body.session_id, 80),
      user_id: await getUserIdFromAuth(req),
      related_quote_id: body.related_quote_id ?? null,
      related_agreement_id: body.related_agreement_id ?? null,
      metadata: safeMetadata(body.metadata),
    };

    const { error } = await supabase.from("analytics_events").insert(row);
    if (error) {
      console.error("analytics insert failed", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("log-event error", e);
    return new Response(JSON.stringify({ error: "bad request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
