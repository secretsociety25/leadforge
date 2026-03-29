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

/** USD / month list prices (source of truth). Example: Starter $49 → ~180 AED / £38 / €45. */
export const PAID_TIER_USD_MONTHLY: Record<PaidTier, number> = {
  starter: 49,
  pro: 99,
  enterprise: 249,
};

/**
 * Approximate USD → local major unit (whole numbers, marketing-friendly).
 * Tune rates as needed.
 */
const USD_TO_MONTHLY_MAJOR: Record<SupportedCurrency, (usd: number) => number> = {
  AED: (usd) => Math.round(usd * 3.67),
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
      return `${majorUnits} AED`;
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

/** Card headline price (same as getTierPricing().displayAmount). */
export function formatTierMoney(
  tier: PaidTier,
  isAnnual: boolean,
  currency: SupportedCurrency,
): string {
  return getTierPricing(tier, isAnnual, currency).displayAmount;
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
  }
> = {
  starter: {
    name: "Starter",
    description: "For small teams getting consistent outbound volume.",
    highlights: ["500 leads / month", "5 campaigns", "Email support"],
  },
  pro: {
    name: "Pro",
    description: "Scale pipeline with higher limits and room to run more campaigns.",
    highlights: ["2,500 leads / month", "25 campaigns", "Priority support"],
  },
  enterprise: {
    name: "Enterprise",
    description: "High volume and multiple motions in one workspace.",
    highlights: ["10,000 leads / month", "100 campaigns", "Dedicated success"],
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
