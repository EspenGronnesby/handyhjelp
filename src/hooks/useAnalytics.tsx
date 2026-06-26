import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// ---- Session ID (per-tab persistence via sessionStorage) ----
const SESSION_KEY = "hh_session_id";
const UTM_KEY = "hh_utm";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid =
      (crypto as any)?.randomUUID?.() ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  if (/mobi|iphone|android|ipod|blackberry|opera mini|iemobile/.test(ua))
    return "mobile";
  return "desktop";
}

function readUtm(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
  };
  if (fromUrl.utm_source || fromUrl.utm_medium || fromUrl.utm_campaign) {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }
  try {
    const cached = sessionStorage.getItem(UTM_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    /* ignore */
  }
  return {};
}

const MEASUREMENT_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) || "";

function gtagSafe(...args: unknown[]) {
  try {
    (window as any).gtag?.(...args);
  } catch {
    /* ignore */
  }
}

type EventPayload = {
  event_type: "pageview" | "conversion" | "cta_click";
  event_name: string;
  metadata?: Record<string, unknown>;
  related_quote_id?: string | null;
  related_agreement_id?: string | null;
};

async function postEvent(payload: EventPayload) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const utm = readUtm();
    await supabase.functions.invoke("log-event", {
      body: {
        ...payload,
        path: typeof window !== "undefined" ? window.location.pathname + window.location.search : null,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        device: detectDevice(),
        session_id: getSessionId(),
        user_id: user?.id ?? null,
        ...utm,
      },
    });
  } catch (err) {
    // Non-blocking — analytics must never break UX
    if (import.meta.env.DEV) console.warn("analytics log failed", err);
  }
}

export function trackPageView(path?: string) {
  if (MEASUREMENT_ID) {
    gtagSafe("event", "page_view", {
      page_path: path ?? (typeof window !== "undefined" ? window.location.pathname : "/"),
      page_location: typeof window !== "undefined" ? window.location.href : undefined,
    });
  }
  void postEvent({ event_type: "pageview", event_name: "page_view" });
}

export function trackCTAClick(name: string, metadata?: Record<string, unknown>) {
  if (MEASUREMENT_ID) {
    gtagSafe("event", "cta_click", { cta_name: name, ...metadata });
  }
  void postEvent({ event_type: "cta_click", event_name: name, metadata });
}

export function trackConversion(
  name: string,
  options?: {
    metadata?: Record<string, unknown>;
    quoteId?: string | null;
    agreementId?: string | null;
  }
) {
  if (MEASUREMENT_ID) {
    gtagSafe("event", "conversion", { conversion_name: name, ...options?.metadata });
    gtagSafe("event", name, options?.metadata || {});
  }
  void postEvent({
    event_type: "conversion",
    event_name: name,
    metadata: options?.metadata,
    related_quote_id: options?.quoteId ?? null,
    related_agreement_id: options?.agreementId ?? null,
  });
}

/** Mount once near the router to track every route change. */
export function useAnalyticsPageviews() {
  const location = useLocation();
  const firstRef = useRef(true);
  useEffect(() => {
    // Skip duplicate on initial mount because the GA snippet already fires page_view
    if (firstRef.current) {
      firstRef.current = false;
      // Still log to our own table so we have a record
      void postEvent({ event_type: "pageview", event_name: "page_view" });
      return;
    }
    trackPageView(location.pathname);
  }, [location.pathname]);
}
