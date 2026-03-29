import { createClient } from "@supabase/supabase-js";

import type { Database, TypedSupabaseClient } from "@/lib/database.types";

/**
 * Service role client — bypasses RLS. Use only on the server (e.g. webhooks,
 * admin tools). Never import from client components or expose the key.
 */
export function createAdminClient(): TypedSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.ZIINA_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and a service role key (SUPABASE_SERVICE_ROLE_KEY or ZIINA_SERVICE_ROLE_KEY).",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as TypedSupabaseClient;
}
