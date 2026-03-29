import { NextResponse } from "next/server";

/** Minimal health check — no Supabase, useful when debugging blank/broken pages. */
export function GET() {
  return NextResponse.json({ ok: true, service: "leadforge" });
}
