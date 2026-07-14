import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_deleted_lists",
  title: "List recently deleted shopping lists",
  description:
    "Return the signed-in user's shopping lists that were deleted in the last 30 days and can still be restored in Wochenend-Retter.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
    const { data, error } = await supabaseForUser(ctx)
      .from("deleted_lists")
      .select("id, list_data, deleted_at")
      .gte("deleted_at", cutoff)
      .order("deleted_at", { ascending: false });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const rows = (data ?? []).map((row) => ({
      id: row.id as string,
      deletedAt: row.deleted_at as string,
      list: row.list_data,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { lists: rows },
    };
  },
});