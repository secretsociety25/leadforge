/**
 * Canonical public site origin (no trailing slash).
 * Used for redirects, billing return URLs, Open Graph metadata, and absolute links.
 *
 * Priority: NEXT_PUBLIC_APP_URL → VERCEL_URL (preview/prod) → localhost for local dev.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
