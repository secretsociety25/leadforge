import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

function supabaseEnvOk(): { url: string; anon: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon || !url.startsWith("http")) {
    return null;
  }
  return { url, anon };
}

export async function updateSession(request: NextRequest) {
  const env = supabaseEnvOk();
  if (!env) {
    console.warn(
      "[supabase middleware] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing/invalid — session refresh and auth redirects are skipped.",
    );
    return NextResponse.next({ request });
  }

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient<Database>(env.url, env.anon, {
      cookieOptions: getSupabaseCookieOptions(),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const isAuthPage = pathname === "/login" || pathname === "/register";

    /** Public marketing routes must stay reachable without a session (nav, SEO, checkout return URLs). */
    const requiresAuth = pathname.startsWith("/dashboard");

    if (!user && requiresAuth) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
      const next = request.nextUrl.searchParams.get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        return NextResponse.redirect(new URL(next, request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  } catch (e) {
    console.error("[supabase middleware] Unexpected error — continuing without auth:", e);
    return NextResponse.next({ request });
  }
}
