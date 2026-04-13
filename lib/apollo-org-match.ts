/** Compare Companies House registered name to Apollo organization name for trust badges. */

export function normaliseForOrgCompare(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(ltd|limited|plc|llp|uk|inc|incorporated|the|co|company|llp)\b/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function classifyOrgNameMatch(
  registryName: string,
  apolloName: string,
): "verified" | "likely_match" | "unverified" {
  const a = normaliseForOrgCompare(registryName);
  const b = normaliseForOrgCompare(apolloName);
  if (!a || !b) return "unverified";
  if (a === b) return "verified";
  if (a.includes(b) || b.includes(a)) return "likely_match";

  const aWords = registryName
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  const bWords = apolloName
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  if (aWords.length === 0 || bWords.length === 0) return "unverified";

  const bSet = new Set(bWords);
  const overlap = aWords.filter((w) => bSet.has(w)).length;
  const minLen = Math.min(aWords.length, bWords.length);
  if (overlap / minLen >= 0.55) return "likely_match";

  return "unverified";
}
