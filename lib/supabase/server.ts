import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database, TypedSupabaseClient } from "@/lib/database.types";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

export async function createClient(): Promise<TypedSupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseAnon || !supabaseUrl.startsWith("http")) {
    throw new Error(
      "Missing or invalid NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and add your Supabase project keys.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnon, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component — session refresh happens in middleware.
        }
      },
    },
  }) as TypedSupabaseClient;
}
