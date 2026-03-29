import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/lib/database.types";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

/**
 * Handles Supabase Auth PKCE / email-confirm redirects (?code=...).
 * Add this URL to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:
 * https://www.mtdfix.co.uk/auth/callback
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/dashboard";
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseAnon || !supabaseUrl.startsWith("http")) {
    return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnon, {
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
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession", error.message);
    const login = new URL("/login", request.url);
    login.searchParams.set("error", "auth_callback");
    login.searchParams.set("error_description", error.message);
    return NextResponse.redirect(login);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
