export type BillingInterval = "month" | "year";

export function getZiinaCurrencyCode(): string {
  return process.env.ZIINA_CURRENCY_CODE?.trim().toUpperCase() || "GBP";
}

export function getZiinaApiBase(): string {
  return (
    process.env.ZIINA_API_BASE_URL?.replace(/\/$/, "") ??
    "https://api-v2.ziina.com/api"
  );
}
