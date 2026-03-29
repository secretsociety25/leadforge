import type { User } from "@supabase/supabase-js";

import type { TypedSupabaseClient } from "@/lib/database.types";

/**
 * Ensures a row exists in `public.users` for the signed-in auth user.
 * Mirrors the DB trigger `handle_new_user` when the trigger did not run (e.g. users created before trigger, or manual auth imports).
 */
export async function ensurePublicUserFromAuth(
  admin: TypedSupabaseClient,
  authUser: User,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = authUser.email?.trim();
  if (!email) {
    return {
      ok: false,
      error:
        "Your account needs an email address before billing. Add one in your auth provider or Supabase Auth settings.",
    };
  }

  console.info("[auth] ensurePublicUserFromAuth", { authUserId: authUser.id });

  const { error } = await admin.from("users").upsert(
    { id: authUser.id, email },
    { onConflict: "id" },
  );

  if (error) {
    console.warn("[auth] ensurePublicUserFromAuth failed", {
      authUserId: authUser.id,
      code: error.code,
      message: error.message,
    });
    return {
      ok: false,
      error: `Could not sync your profile to the database: ${error.message}`,
    };
  }

  console.info("[auth] public.users row ensured", { authUserId: authUser.id });
  return { ok: true };
}
