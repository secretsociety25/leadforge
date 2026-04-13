import type { UserTier } from "@/lib/database.types";

/**
 * Monthly lead caps per tier must match `public.insert_lead_with_quota` in
 * supabase/migrations/20260330120100_update_lead_quota_case.sql (CASE on user_tier).
 *
 * Billing: For MVP we use one-time Ziina payment intents per checkout. Recurring
 * subscriptions (renewals) are planned for a later release.
 */

/** Paid plans exposed on Pricing / Ziina checkout (signup defaults to `free`). */
export const PAID_TIERS = ["starter", "pro", "enterprise"] as const;
export type PaidTier = (typeof PAID_TIERS)[number];

export const SUPPORTED_CURRENCIES = ["AED", "GBP", "EUR"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_TAB: Record<
  SupportedCurrency,
  { code: string; title: string; hint: string }
> = {
  AED: { code: "AED", title: "UAE & GCC", hint: "United Arab Emirates dirham" },
  GBP: { code: "GBP", title: "United Kingdom", hint: "Pound sterling" },
  EUR: { code: "EUR", title: "Euro area", hint: "Euro" },
};

/** USD / month list prices — used for GBP/EUR FX approximation at checkout. */
export const PAID_TIER_USD_MONTHLY: Record<PaidTier, number> = {
  starter: 79,
  pro: 149,
  enterprise: 349,
};

/**
 * AED monthly list prices (whole dirhams). Shown and charged when currency is AED — overrides USD×FX.
 */
/** AED monthly list prices (dirhams) — used for AED checkout and on-card copy when currency is AED. */
export const AED_MONTHLY_MAJOR: Record<PaidTier, number> = {
  starter: 2500,
  pro: 5500,
  enterprise: 12_000,
};

/**
 * Approximate USD → local major unit (whole numbers, marketing-friendly).
 * AED uses {@link AED_MONTHLY_MAJOR} instead.
 */
const USD_TO_MONTHLY_MAJOR: Record<Exclude<SupportedCurrency, "AED">, (usd: number) => number> = {
  GBP: (usd) => Math.round(usd * 0.776),
  EUR: (usd) => Math.round(usd * 0.918),
};

/** Annual = 10 × monthly local price (two months free vs paying 12 × monthly). */
export const ANNUAL_MONTHS_CHARGED = 10;

export type TierLimits = {
  monthlyLeads: number;
  maxCampaigns: number;
};

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: { monthlyLeads: 25, maxCampaigns: 1 },
  starter: { monthlyLeads: 500, maxCampaigns: 5 },
  pro: { monthlyLeads: 2500, maxCampaigns: 25 },
  enterprise: { monthlyLeads: 10_000, maxCampaigns: 100 },
};

const MIN_MINOR_UNITS: Record<SupportedCurrency, number> = {
  AED: 200,
  GBP: 30,
  EUR: 50,
};

export type TierPricing = {
  /** Smallest currency unit (AED fils, GBP pence, EUR cents). */
  amountMinorUnits: number;
  /** @deprecated Use amountMinorUnits */
  amountInFils: number;
  currency: SupportedCurrency;
  /** Human-readable line for receipts / Ziina `message` fallback context. */
  description: string;
  /** Localized price for UI, e.g. €45.00, £38.00, 180.00 AED */
  displayAmount: string;
};

export function isSupportedCurrency(c: string): c is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(c);
}

function monthlyMajorUnits(tier: PaidTier, currency: SupportedCurrency): number {
  if (currency === "AED") {
    return AED_MONTHLY_MAJOR[tier];
  }
  return USD_TO_MONTHLY_MAJOR[currency](PAID_TIER_USD_MONTHLY[tier]);
}

function majorUnitsForPlan(
  tier: PaidTier,
  isAnnual: boolean,
  currency: SupportedCurrency,
): number {
  const m = monthlyMajorUnits(tier, currency);
  return isAnnual ? m * ANNUAL_MONTHS_CHARGED : m;
}

/**
 * Localized display: €45.00 / £38.00 / 180.00 AED style.
 */
export function formatPriceDisplay(
  majorUnits: number,
  currency: SupportedCurrency,
): string {
  if (currency === "AED") {
    if (Number.isInteger(majorUnits)) {
      return `${majorUnits.toLocaleString("en-US")} AED`;
    }
    return `${majorUnits.toFixed(2)} AED`;
  }
  const locale = currency === "GBP" ? "en-GB" : "en-IE";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(majorUnits);
  } catch {
    return `${majorUnits.toFixed(2)} ${currency}`;
  }
}

/**
 * List price in minor units + display string. Derived from USD base with
 * approximate FX; annual applies a 10-month charge (2 months free).
 */
export function getTierPricing(
  tier: UserTier,
  isAnnual: boolean,
  currency: SupportedCurrency = "AED",
): TierPricing {
  if (tier === "free") {
    throw new Error("No paid pricing for free tier");
  }
  if (!isSupportedCurrency(currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  const paid = tier as PaidTier;
  const major = majorUnitsForPlan(paid, isAnnual, currency);
  const amountMinorUnits = Math.round(major * 100);
  const min = MIN_MINOR_UNITS[currency];
  if (amountMinorUnits < min) {
    throw new Error(`Amount below minimum for ${currency} (${min} minor units)`);
  }

  const cadence = isAnnual ? "Annual" : "Monthly";
  const displayAmount = formatPriceDisplay(major, currency);
  const description = `LeadForge ${paid} ${cadence} — ${displayAmount}`;

  return {
    amountMinorUnits,
    amountInFils: amountMinorUnits,
    currency,
    description,
    displayAmount,
  };
}

/** Card headline price (same as getTierPricing().displayAmount, with tier-specific marketing tweaks). */
export function formatTierMoney(
  tier: PaidTier,
  isAnnual: boolean,
  currency: SupportedCurrency,
): string {
  const p = getTierPricing(tier, isAnnual, currency);
  if (tier === "enterprise" && currency === "AED") {
    const major = majorUnitsForPlan(tier, isAnnual, currency);
    const n = major.toLocaleString("en-US");
    return `${n}+ AED`;
  }
  return p.displayAmount;
}

/**
 * Resolve tier + annual flag from Ziina amount + currency (webhook cross-check / fallback).
 */
export function resolvePaidPlanFromMinorAmount(
  amountMinor: number,
  currency: SupportedCurrency,
): { tier: PaidTier; isAnnual: boolean } | null {
  if (!isSupportedCurrency(currency)) return null;
  for (const tier of PAID_TIERS) {
    for (const isAnnual of [false, true]) {
      try {
        const p = getTierPricing(tier, isAnnual, currency);
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
    /** Shown on pricing cards as the signal-volume headline */
    leadVolumeLabel: string;
  }
> = {
  starter: {
    name: "Starter · The Intercept",
    description:
      "Entry sovereignty — map the field, qualify fast, and keep your edge without exposing how the engine thinks.",
    leadVolumeLabel: "500 High-Value Signals / month",
    highlights: [
      "5 campaigns",
      "Neural Social-Graph Mapping & AI drafts",
      "Dedicated Signal Analyst",
    ],
  },
  pro: {
    name: "Pro · The Infiltrator",
    description:
      "Operational depth for teams that run outbound as a system — scale, priority, and room to win in crowded inboxes.",
    leadVolumeLabel: "2,500 High-Value Signals / month",
    highlights: [
      "Priority L3 Queue Access",
      "25 campaigns",
      "Priority support",
      "Built for serious outbound volume",
    ],
  },
  enterprise: {
    name: "Enterprise · The Sovereign",
    description:
      "Custom intelligence and throughput for orgs where pipeline is the business — governance, control, and bespoke playbooks.",
    leadVolumeLabel: "10,000+ High-Value Signals / month",
    highlights: [
      "100 campaigns",
      "Dedicated success & bespoke workflows",
      "Volume-ready infrastructure",
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
