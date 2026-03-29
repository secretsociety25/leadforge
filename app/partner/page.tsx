import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AFFILIATE_COMMISSION_RATE } from "@/lib/affiliate/constants";
import { formatMinorUnits } from "@/lib/affiliate/format-minor";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Partner dashboard",
  description: "Referrals, earnings, and your LeadForge affiliate link.",
};

export default async function PartnerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/partner");
  }

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, referral_code, total_earnings_minor, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!affiliate) {
    redirect("/partners/apply");
  }

  const { data: commissions } = await supabase
    .from("affiliate_commissions")
    .select("id, commission_minor, amount_paid_minor, currency, created_at, payment_intent_id")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const base = getSiteUrl();
  const referralUrl = `${base}/?ref=${encodeURIComponent(affiliate.referral_code)}`;
  const pct = Math.round(AFFILIATE_COMMISSION_RATE * 100);

  const earningsByCurrency: Record<string, number> = {};
  for (const row of commissions ?? []) {
    const c = row.currency.toUpperCase();
    earningsByCurrency[c] = (earningsByCurrency[c] ?? 0) + row.commission_minor;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              LeadForge
            </p>
            <h1 className="text-lg font-bold text-white">Partner dashboard</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
              App dashboard
            </Link>
            <Link href="/partners" className="text-slate-400 hover:text-slate-200">
              Program details
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Your referral link
          </h2>
          <p className="mt-3 break-all font-mono text-sm text-teal-300/95">{referralUrl}</p>
          <p className="mt-2 text-xs text-slate-500">
            Code: <span className="text-slate-400">{affiliate.referral_code}</span> · {pct}% recurring
            on referred payments
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Accrued earnings
            </p>
            <div className="mt-2 space-y-1">
              {Object.keys(earningsByCurrency).length === 0 ? (
                <p className="text-2xl font-bold text-slate-500">—</p>
              ) : (
                Object.entries(earningsByCurrency).map(([cur, minor]) => (
                  <p key={cur} className="text-xl font-bold text-white">
                    {formatMinorUnits(minor, cur)}
                  </p>
                ))
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Totals by currency (sum of commission lines below).
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Recent payments tracked
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{commissions?.length ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">Last 50 events · payout schedule communicated separately</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-white">Commission history</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/80">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Your commission
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Payment
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/90">
                {(commissions ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No payments yet. Share your link — when referrals subscribe, commissions appear
                      here.
                    </td>
                  </tr>
                ) : (
                  commissions!.map((row) => (
                    <tr key={row.id} className="bg-slate-950/20">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-400/95">
                        {formatMinorUnits(row.commission_minor, row.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatMinorUnits(row.amount_paid_minor, row.currency)}
                      </td>
                      <td className="hidden max-w-[140px] truncate px-4 py-3 font-mono text-xs text-slate-500 sm:table-cell">
                        {row.payment_intent_id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
