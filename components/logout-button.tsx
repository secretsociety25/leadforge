"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase";

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* still navigate */
    }
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={loading}
      className={
        className ??
        "mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-wait"
      }
    >
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
