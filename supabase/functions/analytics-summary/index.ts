import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Row = {
  occurred_at: string;
  event_type: "pageview" | "conversion" | "cta_click";
  event_name: string;
  path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  country: string | null;
  device: string | null;
  session_id: string | null;
  related_quote_id: string | null;
  related_agreement_id: string | null;
  metadata: Record<string, unknown> | null;
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function classifySource(row: Row): { source: string; medium: string } {
  if (row.utm_source) {
    return {
      source: row.utm_source,
      medium: row.utm_medium || "utm",
    };
  }
  const ref = row.referrer || "";
  if (!ref) return { source: "Direkte", medium: "(none)" };
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (/google\./.test(host)) return { source: "Google", medium: "organic" };
    if (/bing\./.test(host)) return { source: "Bing", medium: "organic" };
    if (/duckduckgo\./.test(host)) return { source: "DuckDuckGo", medium: "organic" };
    if (/facebook\.|fb\./.test(host)) return { source: "Facebook", medium: "referral" };
    if (/instagram\./.test(host)) return { source: "Instagram", medium: "referral" };
    if (/linkedin\./.test(host)) return { source: "LinkedIn", medium: "referral" };
    if (/t\.co|twitter\.|x\.com/.test(host)) return { source: "X / Twitter", medium: "referral" };
    if (/handyhjelp\.no|handyhjelp\.lovable\.app/.test(host))
      return { source: "Direkte", medium: "(none)" };
    return { source: host, medium: "referral" };
  } catch {
    return { source: "Direkte", medium: "(none)" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await supabaseUser.auth.getClaims(token);
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const userId = claims.claims.sub as string;
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const isAllowed = (roles || []).some(
    (r: any) => r.role === "platform_owner" || r.role === "admin"
  );
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let from: string;
  let to: string;
  try {
    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const defFrom = new Date(now);
    defFrom.setDate(defFrom.getDate() - 30);
    from = body.from || defFrom.toISOString();
    to = body.to || now.toISOString();
  } catch {
    from = new Date(Date.now() - 30 * 86400000).toISOString();
    to = new Date().toISOString();
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  const ms = toDate.getTime() - fromDate.getTime();
  const prevFrom = new Date(fromDate.getTime() - ms).toISOString();
  const prevTo = from;

  // Fetch events for current and previous period
  const [{ data: curr, error: e1 }, { data: prev, error: e2 }] = await Promise.all([
    admin
      .from("analytics_events")
      .select(
        "occurred_at,event_type,event_name,path,referrer,utm_source,utm_medium,country,device,session_id,related_quote_id,related_agreement_id,metadata"
      )
      .gte("occurred_at", from)
      .lte("occurred_at", to)
      .order("occurred_at", { ascending: false })
      .limit(50000),
    admin
      .from("analytics_events")
      .select("event_type,session_id")
      .gte("occurred_at", prevFrom)
      .lt("occurred_at", prevTo)
      .limit(50000),
  ]);

  if (e1 || e2) {
    return new Response(JSON.stringify({ error: e1?.message || e2?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows = (curr || []) as Row[];
  const prevRows = (prev || []) as Pick<Row, "event_type" | "session_id">[];

  // KPIs
  const pageviews = rows.filter((r) => r.event_type === "pageview").length;
  const conversions = rows.filter((r) => r.event_type === "conversion").length;
  const sessions = new Set(rows.map((r) => r.session_id).filter(Boolean));
  const visitors = sessions.size;
  const prevPv = prevRows.filter((r) => r.event_type === "pageview").length;
  const prevConv = prevRows.filter((r) => r.event_type === "conversion").length;
  const prevVisitors = new Set(prevRows.map((r) => r.session_id).filter(Boolean)).size;

  // Time series — group by day
  const tsMap = new Map<string, { day: string; pageviews: number; conversions: number; visitors: Set<string> }>();
  const days: string[] = [];
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d);
    days.push(k);
    tsMap.set(k, { day: k, pageviews: 0, conversions: 0, visitors: new Set() });
  }
  for (const r of rows) {
    const k = dayKey(new Date(r.occurred_at));
    const bucket = tsMap.get(k);
    if (!bucket) continue;
    if (r.event_type === "pageview") bucket.pageviews++;
    if (r.event_type === "conversion") bucket.conversions++;
    if (r.session_id) bucket.visitors.add(r.session_id);
  }
  const timeseries = days.map((k) => {
    const b = tsMap.get(k)!;
    return { day: k, pageviews: b.pageviews, conversions: b.conversions, visitors: b.visitors.size };
  });

  // Sources
  const sourceMap = new Map<string, { source: string; medium: string; visitors: Set<string>; conversions: number }>();
  for (const r of rows) {
    if (r.event_type !== "pageview" && r.event_type !== "conversion") continue;
    const { source, medium } = classifySource(r);
    const key = `${source}__${medium}`;
    if (!sourceMap.has(key)) sourceMap.set(key, { source, medium, visitors: new Set(), conversions: 0 });
    const b = sourceMap.get(key)!;
    if (r.session_id) b.visitors.add(r.session_id);
    if (r.event_type === "conversion") b.conversions++;
  }
  const sources = [...sourceMap.values()]
    .map((b) => ({ source: b.source, medium: b.medium, visitors: b.visitors.size, conversions: b.conversions }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 12);

  // Countries
  const countryMap = new Map<string, number>();
  for (const r of rows) {
    if (r.event_type !== "pageview" || !r.session_id) continue;
    const c = r.country || "??";
    countryMap.set(c, (countryMap.get(c) || 0) + 1);
  }
  const countries = [...countryMap.entries()]
    .map(([country, visits]) => ({ country, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 12);

  // Devices
  const deviceMap = new Map<string, number>();
  for (const r of rows) {
    if (r.event_type !== "pageview") continue;
    const d = r.device || "ukjent";
    deviceMap.set(d, (deviceMap.get(d) || 0) + 1);
  }
  const devices = [...deviceMap.entries()].map(([device, count]) => ({ device, count }));

  // Top pages
  const pageMap = new Map<string, { visits: number; conversions: number }>();
  for (const r of rows) {
    const p = r.path || "/";
    if (!pageMap.has(p)) pageMap.set(p, { visits: 0, conversions: 0 });
    const b = pageMap.get(p)!;
    if (r.event_type === "pageview") b.visits++;
    if (r.event_type === "conversion") b.conversions++;
  }
  const topPages = [...pageMap.entries()]
    .map(([path, v]) => ({ path, visits: v.visits, conversions: v.conversions }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 12);

  // Top conversion sources
  const convMap = new Map<string, number>();
  for (const r of rows) {
    if (r.event_type !== "conversion") continue;
    convMap.set(r.event_name, (convMap.get(r.event_name) || 0) + 1);
  }
  const conversionSources = [...convMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Funnel
  const visitedSessions = new Set(rows.filter((r) => r.event_type === "pageview").map((r) => r.session_id).filter(Boolean));
  const ctaSessions = new Set(rows.filter((r) => r.event_type === "cta_click").map((r) => r.session_id).filter(Boolean));
  const convSessions = new Set(rows.filter((r) => r.event_type === "conversion").map((r) => r.session_id).filter(Boolean));
  const funnel = [
    { step: "Besøk", count: visitedSessions.size },
    { step: "CTA-klikk", count: ctaSessions.size },
    { step: "Konvertering", count: convSessions.size },
  ];

  // Recent conversions, enriched with quote/agreement details
  const recentRaw = rows.filter((r) => r.event_type === "conversion").slice(0, 20);
  const quoteIds = recentRaw.map((r) => r.related_quote_id).filter(Boolean) as string[];
  const agreementIds = recentRaw.map((r) => r.related_agreement_id).filter(Boolean) as string[];
  const [{ data: quotes }, { data: agreements }] = await Promise.all([
    quoteIds.length
      ? admin.from("quotes").select("id,name,email,type").in("id", quoteIds)
      : Promise.resolve({ data: [] as any[] }),
    agreementIds.length
      ? admin.from("service_agreements").select("id,contact_person,email").in("id", agreementIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const quoteMap = new Map((quotes || []).map((q: any) => [q.id, q]));
  const agreementMap = new Map((agreements || []).map((a: any) => [a.id, a]));
  const recent = recentRaw.map((r) => {
    const q = r.related_quote_id ? quoteMap.get(r.related_quote_id) : null;
    const a = r.related_agreement_id ? agreementMap.get(r.related_agreement_id) : null;
    const { source, medium } = classifySource(r);
    return {
      occurred_at: r.occurred_at,
      event_name: r.event_name,
      path: r.path,
      source,
      medium,
      country: r.country,
      device: r.device,
      name: q?.name || a?.contact_person || null,
      email: q?.email || a?.email || null,
    };
  });

  return new Response(
    JSON.stringify({
      range: { from, to },
      kpi: {
        pageviews,
        visitors,
        conversions,
        conversionRate: visitors ? conversions / visitors : 0,
        prev: { pageviews: prevPv, visitors: prevVisitors, conversions: prevConv },
      },
      timeseries,
      sources,
      countries,
      devices,
      topPages,
      conversionSources,
      funnel,
      recent,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
