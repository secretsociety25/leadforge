"use server";

import { revalidatePath } from "next/cache";

import type { Tables } from "@/lib/database.types";
import type { ActionResult } from "@/lib/actions/result";
import { requireSessionUser } from "@/lib/auth/session";
import {
  countLeadsThisMonthForUser,
  loadUserProfile,
} from "@/lib/data/quotas";
import { effectiveMonthlyLeadQuota } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import {
  insertLeadInputSchema,
  type InsertLeadInput,
} from "@/lib/validation/insert-lead";

export type { InsertLeadInput };

export async function listLeadsAction(input?: {
  campaignId?: string;
}): Promise<ActionResult<Tables<"leads">[]>> {
  await requireSessionUser();
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (input?.campaignId) {
    query = query.eq("campaign_id", input.campaignId);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: data ?? [] };
}

/** Inserts a lead with monthly quota enforcement (app layer — no DB RPC required). */
export async function insertLeadAction(
  input: InsertLeadInput,
): Promise<ActionResult<Tables<"leads">>> {
  const parsed = insertLeadInputSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    return { ok: false, error: msg || "Invalid input" };
  }

  const user = await requireSessionUser();
  const supabase = await createClient();

  const profile = await loadUserProfile(supabase, user.id);
  if (!profile) {
    return { ok: false, error: "Profile not ready yet. Try again in a moment." };
  }

  const limit = effectiveMonthlyLeadQuota(
    profile.tier,
    profile.monthly_lead_quota_override,
  );
  const used = await countLeadsThisMonthForUser(supabase, user.id);
  if (limit !== Number.POSITIVE_INFINITY && used >= limit) {
    return { ok: false, error: "Monthly lead limit reached for your tier" };
  }

  const row = parsed.data;

  const { data: campaign, error: campErr } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", row.campaign_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (campErr) {
    return { ok: false, error: campErr.message };
  }
  if (!campaign) {
    return { ok: false, error: "Campaign not found or access denied" };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      campaign_id: row.campaign_id,
      name: row.name,
      linkedin_url: row.linkedin_url,
      email: row.email,
      personalised_pitch: row.personalised_pitch,
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: "Insert returned no row" };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { ok: true, data };
}
