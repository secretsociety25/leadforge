"use server";

import { randomUUID } from "crypto";
import { z } from "zod";

import type { ActionResult } from "@/lib/actions/result";
import { ensurePublicUserFromAuth } from "@/lib/auth/ensure-public-user";
import { requireSessionUser } from "@/lib/auth/session";
import { ziinaCreatePaymentIntent } from "@/lib/billing/ziina-client";
import type { UserTier } from "@/lib/database.types";
import {
  getTierPricing,
  isPaidTier,
  PRICING_CURRENCY_CODE,
  type PaidTier,
} from "@/lib/plans";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

const ziinaPaymentInputSchema = z.object({
  tier: z.enum(["starter", "pro", "enterprise"]),
  isAnnual: z.boolean(),
});

export type CreateZiinaPaymentInput = z.infer<typeof ziinaPaymentInputSchema>;

/**
 * Ziina Payment Intent API — POST https://api-v2.ziina.com/api/payment_intent
 * Auth: Authorization: Bearer ${ZIINA_API_KEY}
 *
 * For MVP we use one-time payments (test=true in development). Recurring subscriptions later.
 * Amounts: GBP pence from getTierPricing() — global currency is GBP (£) only.
 */
export async function createZiinaPaymentAction(
  tier: UserTier,
  isAnnual: boolean,
): Promise<ActionResult<{ redirectUrl: string }>> {
  const parsed = ziinaPaymentInputSchema.safeParse({ tier, isAnnual });
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    return { ok: false, error: msg || "Invalid payment request" };
  }

  if (!isPaidTier(parsed.data.tier)) {
    return { ok: false, error: "Choose a paid plan (starter, pro, or enterprise)." };
  }

  if (!process.env.ZIINA_API_KEY && !process.env.ZIINA_ACCESS_TOKEN) {
    return {
      ok: false,
      error:
        "Checkout isn’t available — Ziina is not configured (missing ZIINA_API_KEY). Add it to the server environment and restart.",
    };
  }

  const user = await requireSessionUser();

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return {
      ok: false,
      error:
        "Billing can’t start — Supabase admin keys are missing. Set SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) on the server.",
    };
  }

  console.info("[billing] createZiinaPaymentAction session user", {
    userId: user.id,
    email: user.email ?? null,
  });

  const profile = await ensurePublicUserFromAuth(admin, user);
  if (!profile.ok) {
    return { ok: false, error: profile.error };
  }

  let pricing;
  try {
    pricing = getTierPricing(parsed.data.tier, parsed.data.isAnnual);
  } catch (e) {
    const m = e instanceof Error ? e.message : "Invalid pricing";
    return { ok: false, error: m };
  }

  const operationId = randomUUID();
  const paidTier = parsed.data.tier as PaidTier;
  const billingInterval = parsed.data.isAnnual ? "year" : "month";

  const { error: opErr } = await admin.from("ziina_checkout_operations").insert({
    operation_id: operationId,
    user_id: user.id,
    tier: paidTier,
    billing_interval: billingInterval,
    currency: PRICING_CURRENCY_CODE,
  });

  if (opErr) {
    const m = opErr.message;
    const code = (opErr as { code?: string }).code;
    const looksLikeFk =
      code === "23503" || /foreign key|violates foreign key constraint/i.test(m);
    if (looksLikeFk) {
      return {
        ok: false,
        error:
          `Checkout could not be linked to your account (database rejected user_id ${user.id}). ` +
          "Try signing out and signing in again so your profile syncs. If this persists, confirm the `public.users` table exists and matches `auth.users` ids.",
      };
    }
    const schemaHint =
      /schema cache|Could not find the table|does not exist/i.test(m)
        ? " Run pending SQL migrations against your Supabase project (Dashboard → SQL Editor, or `npx supabase db push`). The `ziina_checkout_operations` table is created by `supabase/migrations`."
        : "";
    console.warn("[billing] ziina_checkout_operations insert failed", {
      userId: user.id,
      code,
      message: m,
    });
    return { ok: false, error: `${m}${schemaHint}` };
  }

  console.info("[billing] ziina_checkout_operations inserted", {
    userId: user.id,
    operationId,
  });

  const appUrl = getSiteUrl();

  const message = `LeadForge ${paidTier} ${parsed.data.isAnnual ? "Annual" : "Monthly"} — ${pricing.displayAmount}`;

  try {
    const pi = await ziinaCreatePaymentIntent({
      amount: pricing.amountMinorUnits,
      currency_code: pricing.currency,
      message,
      success_url: `${appUrl}/billing/success?payment_intent_id={PAYMENT_INTENT_ID}`,
      cancel_url: `${appUrl}/pricing`,
      failure_url: `${appUrl}/pricing?checkout=failed`,
      operation_id: operationId,
      test: process.env.NODE_ENV === "development",
    });

    if (!pi.redirect_url) {
      return { ok: false, error: "Ziina did not return a redirect URL" };
    }

    if (pi.id) {
      await admin
        .from("ziina_checkout_operations")
        .update({ payment_intent_id: pi.id })
        .eq("operation_id", operationId);
    }

    return { ok: true, data: { redirectUrl: pi.redirect_url } };
  } catch (e) {
    await admin.from("ziina_checkout_operations").delete().eq("operation_id", operationId);
    const detail = e instanceof Error ? e.message : "Unknown error";
    return {
      ok: false,
      error: `Ziina could not create checkout: ${detail}`,
    };
  }
}

/** @deprecated Use createZiinaPaymentAction — kept for older imports. */
export async function createCheckoutSessionAction(
  input: { tier: PaidTier; billingInterval: "month" | "year" },
): Promise<ActionResult<{ url: string }>> {
  const r = await createZiinaPaymentAction(input.tier, input.billingInterval === "year");
  if (!r.ok) return r;
  return { ok: true, data: { url: r.data.redirectUrl } };
}
