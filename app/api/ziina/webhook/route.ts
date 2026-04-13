import crypto from "crypto";

import { AFFILIATE_COMMISSION_RATE } from "@/lib/affiliate/constants";
import {
  getTierPricing,
  isPaidTier,
  PRICING_CURRENCY_CODE,
  resolvePaidPlanFromMinorAmount,
  type PaidTier,
} from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * For MVP we use one-time payment intents; tier upgrades when Ziina confirms success.
 * Recurring subscriptions / renewals — future work.
 */

type ZiinaWebhookPayload = {
  event: string;
  data: Record<string, unknown>;
};

function verifyHmacOptional(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
): boolean {
  if (!secret) return true;
  if (!signatureHeader) return false;
  const expectedHex = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  try {
    const a = Buffer.from(signatureHeader.trim(), "hex");
    const b = Buffer.from(expectedHex, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function paymentSucceeded(status: string): boolean {
  const s = status.toLowerCase();
  return s === "succeeded" || s === "completed";
}

function addInterval(date: Date, billingInterval: "month" | "year"): Date {
  const d = new Date(date.getTime());
  if (billingInterval === "year") {
    d.setUTCFullYear(d.getUTCFullYear() + 1);
  } else {
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return d;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get("x-hmac-signature");
  const webhookSecret = process.env.ZIINA_WEBHOOK_SECRET;

  if (webhookSecret && !verifyHmacOptional(rawBody, sig, webhookSecret)) {
    console.warn("[ziina webhook] invalid HMAC");
    return new Response("Invalid signature", { status: 401 });
  }
  if (!webhookSecret) {
    console.warn("[ziina webhook] ZIINA_WEBHOOK_SECRET not set — skipping signature (MVP only)");
  }

  let payload: ZiinaWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ZiinaWebhookPayload;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (payload.event !== "payment_intent.status.updated") {
    return new Response(JSON.stringify({ ok: true, received: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = payload.data;
  const status = typeof data.status === "string" ? data.status : "";
  const operationId =
    typeof data.operation_id === "string" ? data.operation_id : null;
  const paymentIntentId = typeof data.id === "string" ? data.id : null;
  const amount =
    typeof data.amount === "number" ? data.amount : Number(data.amount);
  const payloadCurrency =
    typeof data.currency_code === "string"
      ? data.currency_code.toUpperCase()
      : null;

  if (!paymentSucceeded(status) || !paymentIntentId || !operationId) {
    return new Response(JSON.stringify({ ok: true, received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dedupeId = `ziina:${paymentIntentId}:${status}`;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Admin client error";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: existing } = await admin
    .from("processed_webhook_events")
    .select("id")
    .eq("id", dedupeId)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ ok: true, received: true, duplicate: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: op, error: opErr } = await admin
    .from("ziina_checkout_operations")
    .select("user_id, tier, billing_interval, currency")
    .eq("operation_id", operationId)
    .maybeSingle();

  if (opErr) {
    console.error("[ziina webhook] checkout lookup", opErr);
    return new Response(JSON.stringify({ ok: false, error: opErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!op || !isPaidTier(op.tier)) {
    console.warn("[ziina webhook] unknown operation_id", operationId);
    return new Response(JSON.stringify({ ok: true, received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const tier = op.tier as PaidTier;
  const billingInterval = op.billing_interval === "year" ? "year" : "month";

  if (payloadCurrency && payloadCurrency !== "GBP") {
    console.warn("[ziina webhook] currency_code expected GBP", payloadCurrency);
  }

  let expectedAmount: number;
  try {
    expectedAmount = getTierPricing(tier, billingInterval === "year").amountMinorUnits;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Pricing config error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resolved = resolvePaidPlanFromMinorAmount(amount);
  if (resolved && (resolved.tier !== tier || resolved.isAnnual !== (billingInterval === "year"))) {
    console.warn("[ziina webhook] amount map vs checkout row", {
      resolved,
      tier,
      billingInterval,
    });
  }

  if (!Number.isFinite(amount) || amount !== expectedAmount) {
    console.warn("[ziina webhook] amount mismatch", { amount, expectedAmount, tier });
    return new Response(JSON.stringify({ ok: false, error: "Amount mismatch" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const expiresAt = addInterval(new Date(), billingInterval).toISOString();

  const { error: upErr } = await admin
    .from("users")
    .update({
      tier,
      monthly_lead_quota_override: null,
      ziina_customer_id: paymentIntentId,
      ziina_last_payment_intent_id: paymentIntentId,
      payment_customer_id: paymentIntentId,
      tier_expires_at: expiresAt,
      billing_currency: PRICING_CURRENCY_CODE,
    })
    .eq("id", op.user_id);

  if (upErr) {
    console.error("[ziina webhook] user update", upErr);
    return new Response(JSON.stringify({ ok: false, error: upErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: payer } = await admin
    .from("users")
    .select("referred_by_affiliate_id")
    .eq("id", op.user_id)
    .maybeSingle();

  if (payer?.referred_by_affiliate_id) {
    const commissionMinor = Math.floor(amount * AFFILIATE_COMMISSION_RATE);
    if (commissionMinor > 0) {
      const { data: affRow } = await admin
        .from("affiliates")
        .select("id")
        .eq("id", payer.referred_by_affiliate_id)
        .maybeSingle();

      if (affRow) {
        const { error: commErr } = await admin.from("affiliate_commissions").insert({
          affiliate_id: affRow.id,
          referred_user_id: op.user_id,
          payment_intent_id: paymentIntentId,
          amount_paid_minor: amount,
          commission_minor: commissionMinor,
          currency: PRICING_CURRENCY_CODE,
        });

        if (commErr && (commErr as { code?: string }).code !== "23505") {
          console.error("[ziina webhook] affiliate_commissions insert", commErr);
        }
      }
    }
  }

  await admin
    .from("ziina_checkout_operations")
    .update({ payment_intent_id: paymentIntentId })
    .eq("operation_id", operationId);

  const { error: insErr } = await admin
    .from("processed_webhook_events")
    .insert({ id: dedupeId, provider: "ziina" });

  if (insErr) {
    if ((insErr as { code?: string }).code === "23505") {
      return new Response(JSON.stringify({ ok: true, received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("[ziina webhook] idempotency insert", insErr);
    return new Response(JSON.stringify({ ok: false, error: insErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
