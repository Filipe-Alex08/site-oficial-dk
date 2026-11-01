import { createAdminClient } from "@/lib/supabase/admin";

type AssessmentAdmin = NonNullable<ReturnType<typeof createAdminClient>>;

type AssignmentItemLink = {
  item_id: string;
  sort_order: number;
};

/**
 * Carrega somente as questões vinculadas à indicação, preservando a ordem
 * sorteada. O gabarito só é incluído quando a chamada interna o solicita.
 */
export async function loadAssignmentItems(
  admin: AssessmentAdmin,
  assignmentId: string,
  columns: string,
): Promise<Array<Record<string, unknown> & { id: string; sort_order: number }>> {
  const { data: links, error: linkError } = await admin
    .from("assessment_assignment_items")
    .select("item_id,sort_order")
    .eq("assignment_id", assignmentId)
    .order("sort_order");
  if (linkError) throw new Error("Não foi possível carregar as questões desta indicação.");

  const typedLinks = (links ?? []) as AssignmentItemLink[];
  if (!typedLinks.length) return [];

  const { data: rawItems, error: itemError } = await admin
    .from("assessment_items")
    .select("*")
    .in("id", typedLinks.map((link) => link.item_id));
  if (itemError) throw new Error("Não foi possível carregar o conteúdo das questões.");

  const requestedColumns = new Set(columns.split(",").map((column) => column.trim()).filter(Boolean));
  requestedColumns.add("id");
  const items = (rawItems ?? []) as Array<Record<string, unknown> & { id: string }>;
  const byId = new Map(items.map((item) => [item.id, Object.fromEntries(
    Object.entries(item).filter(([key]) => requestedColumns.has(key)),
  )]));
  return typedLinks
    .map((link) => {
      const item = byId.get(link.item_id);
      return item ? { id: link.item_id, ...item, sort_order: link.sort_order } : null;
    })
    .filter((item): item is Record<string, unknown> & { id: string; sort_order: number } => item !== null);
}
