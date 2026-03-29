import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { AFFILIATE_REF_COOKIE } from "@/lib/affiliate/constants";
import type { Database } from "@/lib/database.types";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

const REF_CODE_RE = /^[a-z0-9_-]{4,32}$/i;

function withAffiliateRefCookie(request: NextRequest, response: NextResponse): NextResponse {
  const ref = request.nextUrl.searchParams.get("ref")?.trim();
  if (ref && REF_CODE_RE.test(ref)) {
    response.cookies.set(AFFILIATE_REF_COOKIE, ref.toLowerCase(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

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
    return withAffiliateRefCookie(request, NextResponse.next({ request }));
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

    /** Affiliate dashboard: /partner only — not /partners (public marketing) or /partners/* (apply flow). */
    const partnerDashboard =
      pathname === "/partner" || pathname.startsWith("/partner/");
    const requiresAuth = pathname.startsWith("/dashboard") || partnerDashboard;

    if (!user && requiresAuth) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return withAffiliateRefCookie(request, NextResponse.redirect(url));
    }

    if (user && isAuthPage) {
      const next = request.nextUrl.searchParams.get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        return withAffiliateRefCookie(request, NextResponse.redirect(new URL(next, request.url)));
      }
      return withAffiliateRefCookie(request, NextResponse.redirect(new URL("/dashboard", request.url)));
    }

    return withAffiliateRefCookie(request, supabaseResponse);
  } catch (e) {
    console.error("[supabase middleware] Unexpected error — continuing without auth:", e);
    return withAffiliateRefCookie(request, NextResponse.next({ request }));
  }
}
