"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/result";
import { requireSessionUser } from "@/lib/auth/session";
import type { Json, Tables } from "@/lib/database.types";
import {
  countCampaignsForUser,
  getQuotaStatusForUser,
  loadUserProfile,
  type QuotaStatus,
} from "@/lib/data/quotas";
import { effectiveMaxCampaigns } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export type CreateCampaignSuccess = {
  id: string;
  /** Tier + monthly lead quota, usage, and campaign slots after this create. */
  quota: QuotaStatus;
};

export async function createCampaignAction(input: {
  searchParms?: Json;
  status?: string;
}): Promise<ActionResult<CreateCampaignSuccess>> {
  const user = await requireSessionUser();
  const supabase = await createClient();

  const profile = await loadUserProfile(supabase, user.id);
  if (!profile) {
    return { ok: false, error: "Profile not ready yet. Try again in a moment." };
  }

  const maxCampaigns = effectiveMaxCampaigns(profile.tier);
  const count = await countCampaignsForUser(supabase, user.id);
  if (count >= maxCampaigns) {
    return {
      ok: false,
      error: `Campaign limit reached for ${profile.tier} (${maxCampaigns}). Upgrade to add more.`,
    };
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      search_parms: input.searchParms ?? {},
      status: input.status ?? "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  const quota = await getQuotaStatusForUser(supabase, user.id);

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: data.id, quota } };
}

/**
 * Placeholder for the future lead-generation pipeline (enrichment / outreach run).
 */
export async function runCampaignAction(
  campaignId?: string,
): Promise<ActionResult<{ message: string }>> {
  await requireSessionUser();
  void campaignId;
  revalidatePath("/dashboard");
  return {
    ok: true,
    data: {
      message:
        "Lead generation will run here soon — connect your data source and sequences in a future update.",
    },
  };
}

export async function listCampaignsAction(): Promise<
  ActionResult<Tables<"campaigns">[]>
> {
  const user = await requireSessionUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: data ?? [] };
}
