import { createBrowserClient } from "@supabase/ssr";

import type { Database, TypedSupabaseClient } from "@/lib/database.types";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

/**
 * Browser Supabase client — use only in Client Components.
 * Validates env at call time so misconfiguration surfaces as a clear error.
 */
export function createClient(): TypedSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon || !url.startsWith("http")) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local or your host (e.g. Vercel).",
    );
  }
  return createBrowserClient<Database>(url, anon, {
    cookieOptions: getSupabaseCookieOptions(),
  }) as TypedSupabaseClient;
}
