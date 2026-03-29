import type { Tables, TypedSupabaseClient } from "@/lib/database.types";
import { effectiveMaxCampaigns, effectiveMonthlyLeadQuota } from "@/lib/plans";

export type QuotaStatus = {
  tier: Tables<"users">["tier"];
  monthlyLeadLimit: number;
  leadsUsedThisMonth: number;
  leadsRemaining: number;
  maxCampaigns: number;
  campaignCount: number;
};

export function utcMonthStartIso(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  ).toISOString();
}

export async function loadUserProfile(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<Tables<"users"> | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function countCampaignsForUser(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}

/** Leads created this UTC month across the user’s campaigns (no DB RPC required). */
export async function countLeadsThisMonthForUser(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<number> {
  const start = utcMonthStartIso();
  const { data: camps, error: e1 } = await supabase
    .from("campaigns")
    .select("id")
    .eq("user_id", userId);

  if (e1) throw e1;
  const ids = (camps ?? []).map((c) => c.id);
  if (ids.length === 0) return 0;

  const { count, error: e2 } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .in("campaign_id", ids)
    .gte("created_at", start);

  if (e2) throw e2;
  return count ?? 0;
}

export async function getQuotaStatusForUser(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<QuotaStatus> {
  const profile = await loadUserProfile(supabase, userId);
  if (!profile) {
    throw new Error("User profile not found. Complete signup or sync auth.");
  }

  const tier = profile.tier;
  const monthlyLeadLimit = effectiveMonthlyLeadQuota(
    tier,
    profile.monthly_lead_quota_override,
  );
  const maxCampaigns = effectiveMaxCampaigns(tier);

  const [leadsUsedThisMonth, campaignCount] = await Promise.all([
    countLeadsThisMonthForUser(supabase, userId),
    countCampaignsForUser(supabase, userId),
  ]);

  const leadsRemaining =
    monthlyLeadLimit === Number.POSITIVE_INFINITY
      ? Number.POSITIVE_INFINITY
      : Math.max(0, monthlyLeadLimit - leadsUsedThisMonth);

  return {
    tier,
    monthlyLeadLimit,
    leadsUsedThisMonth,
    leadsRemaining,
    maxCampaigns,
    campaignCount,
  };
}
