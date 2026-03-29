import type { SupportedCurrency } from "@/lib/plans";
import { isSupportedCurrency } from "@/lib/plans";

/** Display minor units (fils, pence, cents) as currency. */
export function formatMinorUnits(amountMinor: number, currencyRaw: string): string {
  const c = currencyRaw.toUpperCase();
  const currency: SupportedCurrency = isSupportedCurrency(c) ? c : "GBP";
  const divisor = 100;
  const n = amountMinor / divisor;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${(amountMinor / divisor).toFixed(2)} ${currency}`;
  }
}
