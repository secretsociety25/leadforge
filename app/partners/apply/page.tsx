import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AffiliateApplyForm } from "@/components/affiliate/affiliate-apply-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Activate partner account",
  description: "Get your LeadForge referral link and start earning commission.",
};

export default async function PartnersApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/partners/apply");
  }

  const { data: existing } = await supabase
    .from("affiliates")
    .select("referral_code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.referral_code) {
    redirect("/partner");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/partners" className="text-sm font-medium text-slate-400 hover:text-slate-200">
            ← Partner program
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Activate your partner account</h1>
        <p className="mt-2 text-sm text-slate-400">
          One click creates your referral code. You&apos;ll land on the partner dashboard with your
          link and earnings.
        </p>
        <div className="mt-10">
          <AffiliateApplyForm />
        </div>
      </main>
    </div>
  );
}
