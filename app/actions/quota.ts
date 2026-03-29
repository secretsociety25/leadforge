"use server";

import type { ActionResult } from "@/lib/actions/result";
import { requireSessionUser } from "@/lib/auth/session";
import type { QuotaStatus } from "@/lib/data/quotas";
import { getQuotaStatusForUser } from "@/lib/data/quotas";
import { createClient } from "@/lib/supabase/server";

export async function getQuotaAction(): Promise<ActionResult<QuotaStatus>> {
  const user = await requireSessionUser();
  const supabase = await createClient();

  try {
    const status = await getQuotaStatusForUser(supabase, user.id);
    return { ok: true, data: status };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
