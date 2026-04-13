import { NextResponse, type NextRequest } from "next/server";

import { AFFILIATE_REF_COOKIE } from "@/lib/affiliate/constants";

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

/** Auth disabled for local UI work — pass-through only (affiliate `ref` cookie still applied). */
export async function updateSession(request: NextRequest) {
  return withAffiliateRefCookie(request, NextResponse.next({ request }));
}
