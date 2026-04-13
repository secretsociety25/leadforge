/**
 * Compare Companies House officer name to Apollo person name for registry verification.
 */

export function normalisePersonName(s: string): string {
  let t = s.trim().toLowerCase();
  t = t.replace(/\b(mr|mrs|ms|miss|dr|prof|sir|dame)\b\.?/gi, "");
  if (t.includes(",")) {
    const parts = t.split(",").map((x) => x.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const [last, ...rest] = parts;
      t = `${rest.join(" ")} ${last}`.trim();
    } else {
      t = parts[0] ?? "";
    }
  }
  return t.replace(/[^a-z0-9\s'-]+/g, " ").replace(/\s+/g, " ").trim();
}

export function classifyPersonNameMatch(
  registryDirector: string,
  apolloPersonName: string,
): "verified" | "likely_match" | "unverified" {
  const a = normalisePersonName(registryDirector);
  const b = normalisePersonName(apolloPersonName);
  if (!a || !b) return "unverified";
  if (a === b) return "verified";

  const aParts = a.split(/\s+/).filter((w) => w.length > 0);
  const bParts = b.split(/\s+/).filter((w) => w.length > 0);
  if (aParts.length === 0 || bParts.length === 0) return "unverified";

  const aLast = aParts[aParts.length - 1];
  const bLast = bParts[bParts.length - 1];
  const sig = (w: string) => w.length > 2;

  if (aLast === bLast && sig(aLast)) {
    const aFirst = aParts[0];
    const bFirst = bParts[0];
    if (aFirst === bFirst) return "verified";
    if (aFirst.length === 1 && bFirst.startsWith(aFirst)) return "likely_match";
    if (bFirst.length === 1 && aFirst.startsWith(bFirst)) return "likely_match";
    if (aFirst[0] === bFirst[0]) return "likely_match";
  }

  const aSig = new Set(aParts.filter(sig));
  const overlap = bParts.filter((w) => aSig.has(w)).length;
  const minSig = Math.min(
    aParts.filter(sig).length || 1,
    bParts.filter(sig).length || 1,
  );
  if (overlap >= 2) return "likely_match";
  if (overlap === 1 && overlap / minSig >= 0.5) return "likely_match";

  if (a.includes(b) || b.includes(a)) return "likely_match";

  return "unverified";
}
