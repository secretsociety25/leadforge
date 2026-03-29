"use server";

import { ensurePublicUserFromAuth } from "@/lib/auth/ensure-public-user";
import { getSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Call after login/signup so `public.users` exists before dashboard/checkout.
 * Safe to call repeatedly; uses upsert by primary key.
 */
export async function syncPublicUserFromAuthAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Not signed in" };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    const m = e instanceof Error ? e.message : "Server misconfiguration";
    console.warn("[auth] syncPublicUserFromAuthAction: no admin client", m);
    return { ok: false, error: "Profile sync unavailable (server keys)." };
  }

  const r = await ensurePublicUserFromAuth(admin, user);
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true };
}
