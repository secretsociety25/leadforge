import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { getQuotaStatusForUser } from "@/lib/data/quotas";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    const status = await getQuotaStatusForUser(supabase, user.id);
    return NextResponse.json({ quota: status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
