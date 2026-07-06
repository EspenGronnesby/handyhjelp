import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function hasStaffRole(ctx: ToolContext): Promise<boolean> {
  const supabase = supabaseForUser(ctx);
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.getUserId());
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  return roles.some((r) => ["admin", "worker", "platform_owner"].includes(r));
}

export default defineTool({
  name: "list_pending_quotes",
  title: "List ubehandlede tilbud",
  description: "Hent alle tilbud med status 'pending'. Kun tilgjengelig for admin/worker/eier.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Ikke innlogget" }], isError: true };
    }
    if (!(await hasStaffRole(ctx))) {
      return { content: [{ type: "text", text: "Krever admin/worker-rolle" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("quotes")
      .select("id, type, name, email, phone, description, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { quotes: data ?? [] },
    };
  },
});
