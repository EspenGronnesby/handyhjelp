import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function isAdminOrOwner(ctx: ToolContext): Promise<boolean> {
  const supabase = supabaseForUser(ctx);
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.getUserId());
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  return roles.some((r) => ["admin", "platform_owner"].includes(r));
}

export default defineTool({
  name: "get_analytics_summary",
  title: "Analyseoppsummering",
  description: "Hent HandyHjelp analytics-oppsummering (siste N dager). Kun admin/eier.",
  inputSchema: {
    days: z.number().int().min(1).max(90).optional().describe("Antall dager tilbake (default 7)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Ikke innlogget" }], isError: true };
    }
    if (!(await isAdminOrOwner(ctx))) {
      return { content: [{ type: "text", text: "Krever admin-/eier-rolle" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const from = new Date(Date.now() - (days ?? 7) * 86400_000).toISOString();
    const { data, error } = await supabase.functions.invoke("analytics-summary", {
      body: { from },
    });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { summary: data },
    };
  },
});
