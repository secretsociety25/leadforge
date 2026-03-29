import type { CookieOptions } from "@supabase/ssr";

/**
 * Shared across middleware, server client, browser client, and route handlers.
 * `secure: true` in production is required so browsers accept auth cookies on HTTPS (e.g. https://www.mtdfix.co.uk).
 */
export function getSupabaseCookieOptions(): CookieOptions {
  const secure = process.env.NODE_ENV === "production";
  return {
    path: "/",
    sameSite: "lax",
    secure,
  };
}
