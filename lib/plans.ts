import type { UserTier } from "@/lib/database.types";

/**
 * Monthly lead caps per tier must match `public.insert_lead_with_quota` in
 * supabase/migrations (CASE on user_tier).
 *
 * Billing: one-time Ziina payment intents. All list pricing and checkout are **GBP (£)** only.
 */

/** Paid plans exposed on Pricing / Ziina checkout (signup defaults to `free`). */
export const PAID_TIERS = ["starter", "pro", "enterprise"] as const;
export type PaidTier = (typeof PAID_TIERS)[number];

/** Global billing currency — no AED/EUR toggles or alternate checkout currencies. */
export const PRICING_CURRENCY_CODE = "GBP" as const;
export type SupportedCurrency = typeof PRICING_CURRENCY_CODE;

export const SUPPORTED_CURRENCIES = [PRICING_CURRENCY_CODE] as const;

/** GBP monthly list prices (whole pounds). */
export const GBP_MONTHLY_MAJOR: Record<PaidTier, number> = {
  starter: 550,
  pro: 1250,
  enterprise: 2500,
};

/** Annual = 10 × monthly (two months free vs paying 12 × monthly). */
export const ANNUAL_MONTHS_CHARGED = 10;

export type TierLimits = {
  monthlyLeads: number;
  maxCampaigns: number;
};

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: { monthlyLeads: 25, maxCampaigns: 1 },
  starter: { monthlyLeads: 1000, maxCampaigns: 5 },
  pro: { monthlyLeads: 3500, maxCampaigns: 25 },
  enterprise: { monthlyLeads: 10_000, maxCampaigns: 100 },
};

const MIN_MINOR_UNITS_GBP = 30;

export type TierPricing = {
  /** Smallest currency unit (pence). */
  amountMinorUnits: number;
  /** @deprecated Use amountMinorUnits */
  amountInFils: number;
  currency: SupportedCurrency;
  /** Human-readable line for receipts / Ziina `message` fallback context. */
  description: string;
  /** Localized price for UI, e.g. £550 */
  displayAmount: string;
};

export function isSupportedCurrency(c: string): c is SupportedCurrency {
  return c.toUpperCase() === PRICING_CURRENCY_CODE;
}

function majorUnitsForPlan(tier: PaidTier, isAnnual: boolean): number {
  const m = GBP_MONTHLY_MAJOR[tier];
  return isAnnual ? m * ANNUAL_MONTHS_CHARGED : m;
}

function formatGbpMajor(majorUnits: number): string {
  if (Number.isInteger(majorUnits)) {
    return `£${majorUnits.toLocaleString("en-GB")}`;
  }
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(majorUnits);
  } catch {
    return `£${majorUnits.toFixed(2)}`;
  }
}

/**
 * List price in minor units + display string. Annual applies a 10-month charge (2 months free).
 */
export function getTierPricing(tier: UserTier, isAnnual: boolean): TierPricing {
  if (tier === "free") {
    throw new Error("No paid pricing for free tier");
  }

  const paid = tier as PaidTier;
  const major = majorUnitsForPlan(paid, isAnnual);
  const amountMinorUnits = Math.round(major * 100);
  if (amountMinorUnits < MIN_MINOR_UNITS_GBP) {
    throw new Error(`Amount below minimum for GBP (${MIN_MINOR_UNITS_GBP} minor units)`);
  }

  const cadence = isAnnual ? "Annual" : "Monthly";
  const displayAmount = formatGbpMajor(major);
  const description = `LeadForge ${paid} ${cadence} — ${displayAmount}`;

  return {
    amountMinorUnits,
    amountInFils: amountMinorUnits,
    currency: PRICING_CURRENCY_CODE,
    description,
    displayAmount,
  };
}

/**
 * Card headline price — enterprise shows £2,500+ / £25,000+ style for positioning.
 */
export function formatTierMoney(tier: PaidTier, isAnnual: boolean): string {
  const major = majorUnitsForPlan(tier, isAnnual);
  const formatted = `£${major.toLocaleString("en-GB")}`;
  if (tier === "enterprise") {
    return `${formatted}+`;
  }
  return formatted;
}

/**
 * Resolve tier + annual flag from Ziina amount (GBP pence only).
 */
export function resolvePaidPlanFromMinorAmount(
  amountMinor: number,
): { tier: PaidTier; isAnnual: boolean } | null {
  for (const tier of PAID_TIERS) {
    for (const isAnnual of [false, true]) {
      try {
        const p = getTierPricing(tier, isAnnual);
        if (p.amountMinorUnits === amountMinor) {
          return { tier, isAnnual };
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

export const PAID_TIER_DISPLAY: Record<
  PaidTier,
  {
    name: string;
    description: string;
    highlights: string[];
    leadVolumeLabel: string;
  }
> = {
  starter: {
    name: "Starter (£550) · The Intercept",
    description:
      "Fast qualification and sovereign positioning — enough runway to test the engine without overexposing process.",
    leadVolumeLabel: "1,000 High-Signal Leads / mo.",
    highlights: ["Standard L3 Neural Mapping", "Classified Dossier access"],
  },
  pro: {
    name: "Pro (£1,250) · The Infiltrator",
    description:
      "Serious outbound cadence — deeper synthesis, faster queue, and multi-channel coherence when inboxes get noisy.",
    leadVolumeLabel: "3,500 High-Signal Leads / mo.",
    highlights: [
      "Deep Psychographic Synthesis",
      "Priority L3 Queue access",
      "Multi-Channel Signal Resolution",
    ],
  },
  enterprise: {
    name: "Enterprise (£2,500+) · The Sovereign",
    description:
      "Board-grade throughput — bespoke neural layers, analyst-led execution, and integrations that match how your firm actually runs revenue.",
    leadVolumeLabel: "10,000+ High-Signal Leads / mo.",
    highlights: [
      "Custom Neural Layer Training (Brand Voice Alignment)",
      "Dedicated Signal Analyst (Done-For-You Management)",
      "Bespoke CRM Integrations",
    ],
  },
};

export function isPaidTier(tier: string): tier is PaidTier {
  return (PAID_TIERS as readonly string[]).includes(tier);
}

export function effectiveMonthlyLeadQuota(
  tier: UserTier,
  override: number | null | undefined,
): number {
  if (override != null && override > 0) return override;
  return TIER_LIMITS[tier].monthlyLeads;
}

export function effectiveMaxCampaigns(tier: UserTier): number {
  return TIER_LIMITS[tier].maxCampaigns;
}
