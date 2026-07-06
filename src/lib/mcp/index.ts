import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyQuotes from "./tools/list-my-quotes";
import listMyAgreements from "./tools/list-my-agreements";
import listMyJobs from "./tools/list-my-jobs";
import listPendingQuotes from "./tools/list-pending-quotes";
import getAnalyticsSummary from "./tools/get-analytics-summary";

// Bygg issuer fra prosjekt-ref (Vite inlines dette ved build-tid — import-safe).
// Fallback holder verdien well-formed under manifest-extract eval.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "handyhjelp-mcp",
  title: "HandyHjelp",
  version: "0.1.0",
  instructions:
    "Verktøy for HandyHjelp. Innlogget bruker kan hente sine egne tilbud, serviceavtaler og jobber. Admin/eier kan i tillegg hente analytics-oppsummering og ubehandlede tilbud.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listMyQuotes,
    listMyAgreements,
    listMyJobs,
    listPendingQuotes,
    getAnalyticsSummary,
  ],
});
