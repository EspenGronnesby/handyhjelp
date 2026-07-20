import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type FacebookRating = {
  reviewer?: { id: string; name: string };
  created_time: string;
  recommendation_type?: "positive" | "negative";
  rating?: number;
  review_text?: string;
};

// Side-token kan enten settes direkte (FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID),
// eller utledes automatisk fra et bruker-token (FACEBOOK_USER_ACCESS_TOKEN) via /me/accounts.
async function getPageCredentials(): Promise<
  { pageId: string; pageToken: string } | { error: string }
> {
  const pageToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
  const pageIdEnv = Deno.env.get("FACEBOOK_PAGE_ID");
  if (pageToken && pageIdEnv) return { pageId: pageIdEnv, pageToken };

  const userToken = Deno.env.get("FACEBOOK_USER_ACCESS_TOKEN");
  if (!userToken) {
    return {
      error:
        "Mangler Facebook-nøkler. Sett enten FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID, eller FACEBOOK_USER_ACCESS_TOKEN, under Edge Functions → Secrets.",
    };
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?access_token=${encodeURIComponent(userToken)}`
  );
  const body = await res.json();
  if (!res.ok) {
    console.error("Facebook /me/accounts error:", body?.error?.message);
    return {
      error: `Facebook API-feil ved henting av side: ${body?.error?.message || res.status}`,
    };
  }
  const pages: Array<{ id: string; access_token?: string }> = body.data || [];
  const page = pageIdEnv ? pages.find((p) => p.id === pageIdEnv) : pages[0];
  if (!page?.access_token) {
    return { error: "Fant ingen Facebook-side med tilgang på denne kontoen." };
  }
  return { pageId: page.id, pageToken: page.access_token };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Auth: enten cron-secret (planlagt kjøring) eller innlogget admin
  const cronSecret = Deno.env.get("CRON_SECRET");
  const isCron = !!cronSecret && req.headers.get("x-cron-secret") === cronSecret;

  if (!isCron) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabaseUser.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const roleCheck = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const userId = claims.claims.sub as string;
    const { data: roles } = await roleCheck
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAllowed = (roles || []).some(
      (r: { role: string }) => r.role === "platform_owner" || r.role === "admin"
    );
    if (!isAllowed) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }
  }

  const creds = await getPageCredentials();
  if ("error" in creds) {
    return jsonResponse({ error: creds.error }, 500);
  }
  const { pageId, pageToken: accessToken } = creds;

  // Hent anmeldelser fra Facebook Graph API (med paginering, maks 500)
  const ratings: FacebookRating[] = [];
  let url: string | null =
    `https://graph.facebook.com/v21.0/${encodeURIComponent(pageId)}/ratings` +
    `?fields=reviewer{id,name},created_time,recommendation_type,rating,review_text` +
    `&limit=100&access_token=${encodeURIComponent(accessToken)}`;

  while (url && ratings.length < 500) {
    const res = await fetch(url);
    const body = await res.json();
    if (!res.ok) {
      console.error("Facebook API error:", body?.error?.message);
      return jsonResponse(
        { error: `Facebook API-feil: ${body?.error?.message || res.status}` },
        502
      );
    }
    ratings.push(...(body.data || []));
    url = body.paging?.next || null;
  }

  // Bare anmeldelser med tekst er verdt å vise på nettsiden
  const withText = ratings.filter((r) => r.review_text?.trim());

  const rows = withText.map((r) => {
    const rating =
      r.rating ?? (r.recommendation_type === "negative" ? 1 : 5);
    const approved = rating >= 4;
    return {
      external_id: `fb_${r.created_time}_${r.reviewer?.id ?? "ukjent"}`,
      customer_name: r.reviewer?.name || "Facebook-bruker",
      rating,
      comment: r.review_text!.trim().slice(0, 5000),
      source: "facebook",
      feedback_type: "manual",
      is_verified_customer: false,
      user_id: null,
      // Positive anbefalinger publiseres direkte; negative legges til manuell vurdering
      status: approved ? "approved" : "pending",
      approved_at: approved ? new Date().toISOString() : null,
      created_at: r.created_time,
    };
  });

  if (rows.length === 0) {
    return jsonResponse({ imported: 0, total: 0, message: "Ingen anmeldelser med tekst funnet på Facebook-siden." });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ignoreDuplicates: allerede synkede anmeldelser røres ikke,
  // så admin-endringer (f.eks. avvist status) ikke overskrives ved neste synk
  const { data: inserted, error } = await admin
    .from("reviews")
    .upsert(rows, { onConflict: "external_id", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("Insert error:", error.message);
    return jsonResponse({ error: `Databasefeil: ${error.message}` }, 500);
  }

  return jsonResponse({
    imported: inserted?.length ?? 0,
    total: rows.length,
    message: `${inserted?.length ?? 0} nye anmeldelser hentet fra Facebook (${rows.length} totalt på siden).`,
  });
});
