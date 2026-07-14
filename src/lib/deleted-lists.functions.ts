import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// A deleted list is stored as a JSON snapshot; we only need to display and
// restore it, so the schema is intentionally opaque.
const listSnapshotSchema = z.object({
  id: z.string(),
  name: z.string(),
  tag: z.string().optional().default(""),
  createdAt: z.number(),
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      done: z.boolean(),
      price: z.number().optional(),
    }),
  ),
});

export type DeletedListSnapshot = z.infer<typeof listSnapshotSchema>;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const listDeletedLists = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
    const { data, error } = await context.supabase
      .from("deleted_lists")
      .select("id, list_data, deleted_at")
      .gte("deleted_at", cutoff)
      .order("deleted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      deletedAt: row.deleted_at as string,
      list: row.list_data as DeletedListSnapshot,
    }));
  });

export const saveDeletedList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ list: listSnapshotSchema }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("deleted_lists").insert({
      user_id: context.userId,
      list_data: data.list,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const removeDeletedList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("deleted_lists")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });