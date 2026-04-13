/**
 * Companies House REST API: Basic auth uses the API key as username and an empty password.
 * Equivalent to curl `-u API_KEY:` — we append the colon when building the header.
 */
export const COMPANIES_HOUSE_USER_AGENT = "LeadForge/1.0 (+https://www.mtdfix.co.uk)";

export function sanitizeCompaniesHouseApiKey(raw: string | undefined): string {
  if (raw == null) return "";
  let k = raw.replace(/^\uFEFF/, "").trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim();
  }
  // Newlines / tabs from copy-paste (never strip hyphens inside UUIDs)
  k = k.replace(/[\r\n\t]+/g, "").trim();
  // If someone pasted `curl -u KEY:` they may have included the trailing colon in the value
  k = k.replace(/:+$/, "").trim();
  return k;
}

export function readCompaniesHouseApiKeyFromEnv(): string {
  const raw =
    process.env.COMPANIES_HOUSE_API_KEY ??
    process.env.CH_API_KEY ??
    process.env.COMPANIESHOUSE_API_KEY;
  return sanitizeCompaniesHouseApiKey(raw);
}

export function companiesHouseBasicAuthHeader(apiKey: string): string {
  const token = Buffer.from(`${apiKey}:`, "utf8").toString("base64");
  return `Basic ${token}`;
}
