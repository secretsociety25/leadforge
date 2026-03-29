"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { createAffiliateAccountAction } from "@/app/actions/affiliate";

export function AffiliateApplyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onActivate = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await createAffiliateAccountAction();
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.push("/partner");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
      <p className="text-sm text-slate-400">
        Use your LeadForge account to generate a unique referral code. You can copy your link and
        share it anywhere.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void onActivate()}
        className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Creating…
          </>
        ) : (
          "Create my partner account"
        )}
      </button>
      <p className="mt-6 text-center text-xs text-slate-500">
        Wrong account?{" "}
        <Link href="/login?next=/partners/apply" className="text-indigo-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
