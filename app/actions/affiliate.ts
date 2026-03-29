"use server";

import { randomBytes } from "crypto";

import type { ActionResult } from "@/lib/actions/result";
import { requireSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

function generateReferralCode(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz23456789";
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

/**
 * Applies referral from `?ref=` (passed from the client reading `lf_ref` cookie) once per account.
 * Client-passed code avoids a race where the server action runs before auth cookies are visible.
 */
export async function applyAffiliateReferralWithCodeAction(
  referralCode: string | null | undefined,
): Promise<ActionResult<{ applied: boolean }>> {
  const user = await requireSessionUser();
  const raw = referralCode?.trim().toLowerCase() ?? "";
  if (!raw || !/^[a-z0-9_-]{4,32}$/.test(raw)) {
    return { ok: true, data: { applied: false } };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "Server configuration error." };
  }

  const { data: me, error: meErr } = await admin
    .from("users")
    .select("id, referred_by_affiliate_id")
    .eq("id", user.id)
    .maybeSingle();

  if (meErr || !me) {
    return { ok: false, error: meErr?.message ?? "Profile not found." };
  }
  if (me.referred_by_affiliate_id) {
    return { ok: true, data: { applied: false } };
  }

  const { data: aff, error: affErr } = await admin
    .from("affiliates")
    .select("id, user_id")
    .eq("referral_code", raw)
    .maybeSingle();

  if (affErr) {
    return { ok: false, error: affErr.message };
  }
  if (!aff) {
    return { ok: true, data: { applied: false } };
  }
  if (aff.user_id === user.id) {
    return { ok: true, data: { applied: false } };
  }

  const { error: upErr } = await admin
    .from("users")
    .update({ referred_by_affiliate_id: aff.id })
    .eq("id", user.id)
    .is("referred_by_affiliate_id", null);

  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  return { ok: true, data: { applied: true } };
}

export async function createAffiliateAccountAction(): Promise<
  ActionResult<{ referralCode: string }>
> {
  const user = await requireSessionUser();

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return {
      ok: false,
      error: "Affiliate signup requires server keys (SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const { data: existing } = await admin
    .from("affiliates")
    .select("referral_code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.referral_code) {
    return { ok: true, data: { referralCode: existing.referral_code } };
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const referral_code = generateReferralCode();
    const { data: inserted, error } = await admin
      .from("affiliates")
      .insert({ user_id: user.id, referral_code })
      .select("referral_code")
      .maybeSingle();

    if (!error && inserted?.referral_code) {
      return { ok: true, data: { referralCode: inserted.referral_code } };
    }
    const code = (error as { code?: string })?.code;
    if (code !== "23505") {
      return { ok: false, error: error?.message ?? "Could not create affiliate account." };
    }
  }

  return { ok: false, error: "Could not generate a unique referral code. Try again." };
}
