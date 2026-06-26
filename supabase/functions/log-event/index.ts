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
      user_id: body.user_id ?? null,
      related_quote_id: body.related_quote_id ?? null,
      related_agreement_id: body.related_agreement_id ?? null,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
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
