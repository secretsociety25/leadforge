import type { Json, TypedSupabaseClient } from "@/lib/database.types";

const CSV_SEARCH: Json = { source: "csv_upload", label: "CSV uploads" };

/**
 * One stable campaign per user for CSV-imported leads (FK + RLS).
 */
export async function getOrCreateCsvCampaignId(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<{ id: string; error?: string }> {
  const { data: existing, error: findErr } = await supabase
    .from("campaigns")
    .select("id")
    .eq("user_id", userId)
    .contains("search_parms", { source: "csv_upload" })
    .limit(1)
    .maybeSingle();

  if (findErr) {
    return { id: "", error: findErr.message };
  }
  if (existing?.id) {
    return { id: existing.id };
  }

  const { data: created, error: insErr } = await supabase
    .from("campaigns")
    .insert({
      user_id: userId,
      search_parms: CSV_SEARCH,
      status: "active",
    })
    .select("id")
    .single();

  if (insErr) {
    return { id: "", error: insErr.message };
  }
  if (!created?.id) {
    return { id: "", error: "Could not create CSV campaign" };
  }
  return { id: created.id };
}
