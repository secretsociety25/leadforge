import {
  ArrowUpRight,
  BarChart3,
  Mail,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { listCampaignsAction } from "@/app/actions/campaigns";
import { listLeadsAction } from "@/app/actions/leads";
import { getQuotaAction } from "@/app/actions/quota";
import { CampaignLaunchCard } from "@/components/dashboard/campaign-launch-card";
import { CsvUploadFlow } from "@/components/dashboard/csv-upload-flow";
import { LeadsFactoryClient } from "@/components/dashboard/leads-factory-client";
import { campaignTargetingFromJson } from "@/lib/campaign-search-parms";
import { createClient } from "@/lib/supabase/server";

/** Preview metrics until email / analytics pipes are connected */
const DEMO_METRICS = {
  emailsSent: "1,240",
  responseRate: "18.2%",
  conversionRate: "3.4%",
} as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [campaignsRes, quotaRes, leadsRes] = await Promise.all([
    listCampaignsAction(),
    getQuotaAction(),
    listLeadsAction(),
  ]);

  const campaigns = campaignsRes.ok ? campaignsRes.data : [];
  const quota = quotaRes.ok ? quotaRes.data : null;
  const leads = leadsRes.ok ? leadsRes.data : [];

  const totalLeads = leads.length;
  const atCampaignLimit = quota
    ? quota.campaignCount >= quota.maxCampaigns
    : false;
  const showProUpsell = quota ? quota.tier !== "pro" && quota.tier !== "enterprise" : true;

  const statCards = [
    {
      label: "Total leads",
      value: String(totalLeads),
      hint: quota
        ? `${quota.leadsUsedThisMonth} used this month · cap ${quota.monthlyLeadLimit === Number.POSITIVE_INFINITY ? "∞" : quota.monthlyLeadLimit}`
        : "In your workspace",
      icon: Target,
      accent: "text-violet-300",
      bg: "bg-violet-500/15 border-violet-500/25",
      demo: false,
    },
    {
      label: "Emails sent",
      value: DEMO_METRICS.emailsSent,
      hint: "Last 30 days · preview",
      icon: Mail,
      accent: "text-sky-300",
      bg: "bg-sky-500/15 border-sky-500/25",
      demo: true,
    },
    {
      label: "Response rate",
      value: DEMO_METRICS.responseRate,
      hint: "Opens + replies · preview",
      icon: BarChart3,
      accent: "text-emerald-300",
      bg: "bg-emerald-500/15 border-emerald-500/25",
      demo: true,
    },
    {
      label: "Conversion rate",
      value: DEMO_METRICS.conversionRate,
      hint: "Meetings booked · preview",
      icon: TrendingUp,
      bg: "bg-amber-500/15 border-amber-500/25",
      accent: "text-amber-300",
      demo: true,
    },
  ];

  return (
    <main className="relative w-full text-zinc-100">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-600/10 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <header id="overview" className="mb-10 max-w-3xl scroll-mt-28">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Overview</p>
            <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-500">
              Live workspace
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white lg:text-4xl">Dashboard</h1>
          <p className="mt-2 text-zinc-400">
            Signed in as{" "}
            <span className="font-medium text-zinc-200">{user?.email ?? user?.id}</span>
            {quota ? (
              <>
                {" "}
                ·{" "}
                <span className="capitalize text-violet-300">{quota.tier.replace(/_/g, " ")}</span> plan
              </>
            ) : null}
          </p>
        </header>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, hint, icon: Icon, accent, bg, demo }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 shadow-lg shadow-black/40"
            >
              {demo ? (
                <span className="absolute right-3 top-3 rounded-md border border-zinc-700/80 bg-zinc-900/90 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-zinc-500">
                  Demo
                </span>
              ) : null}
              <div className="flex items-start justify-between gap-3 pr-14">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
                  <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-white">{value}</p>
                  <p className="mt-1.5 text-xs leading-snug text-zinc-500">{hint}</p>
                </div>
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${bg} ${accent}`}
                >
                  <Icon className="size-6" aria-hidden />
                </div>
              </div>
              <div
                className="pointer-events-none absolute -bottom-8 -right-8 size-28 rounded-full bg-violet-600/5 blur-2xl"
                aria-hidden
              />
            </div>
          ))}
        </div>

        <section
          id="leadforge-alpha"
          className="mb-14 scroll-mt-28 rounded-2xl border border-violet-500/20 bg-zinc-950/60 p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.08)] sm:p-8"
        >
          <div className="mb-8 border-b border-zinc-800/90 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-400">LeadForge Alpha</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">CSV → AI emails → Export</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Upload a list, map columns, generate Claude drafts, then export a CSV with your final copy.
            </p>
          </div>
          <CsvUploadFlow embedded />
          <LeadsFactoryClient initialLeads={leads} embedded />
        </section>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Main column */}
          <div className="flex min-w-0 flex-col gap-10 lg:col-span-8">
            <CampaignLaunchCard atCampaignLimit={atCampaignLimit} />

            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-6 shadow-inner shadow-black/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Your campaigns</h2>
                  <p className="mt-1 text-sm text-zinc-500">Recent drafts and targeting rules.</p>
                </div>
                <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-500 sm:block">
                  {campaigns.length} total
                </div>
              </div>
              {campaigns.length === 0 ? (
                <p className="mt-8 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-10 text-center text-sm text-zinc-500">
                  No campaigns yet. Use <strong className="text-zinc-300">Generate leads</strong> above to
                  create your first one.
                </p>
              ) : (
                <ul className="mt-6 divide-y divide-zinc-800/80">
                  {campaigns.slice(0, 10).map((c) => {
                    const t = campaignTargetingFromJson(c.search_parms);
                    return (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
                        <div>
                          <p className="font-medium text-zinc-100">
                            {t.targetJobTitle ?? "Untitled campaign"}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {[t.industry, t.location].filter(Boolean).join(" · ") ||
                              "Add industry & location"}
                          </p>
                        </div>
                        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium capitalize text-zinc-400">
                          {c.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar column */}
          <aside className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-8 lg:self-start">
            <div
              className={`relative overflow-hidden rounded-2xl border p-6 shadow-lg ${
                showProUpsell
                  ? "border-violet-500/35 bg-gradient-to-br from-violet-950/90 via-zinc-950 to-zinc-950"
                  : "border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-zinc-950"
              }`}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-violet-500/20 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <div className="flex items-center gap-2 text-violet-300">
                  <Sparkles className="size-4" aria-hidden />
                  {showProUpsell ? (
                    <p className="text-xs font-bold uppercase tracking-widest">Upgrade to Pro</p>
                  ) : (
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                      Paid plan
                    </p>
                  )}
                </div>
                {showProUpsell ? (
                  <>
                    <h3 className="mt-3 text-xl font-bold text-white">Unlock higher limits</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      More monthly leads, more campaigns, and room to scale — same checkout flow as
                      pricing.
                    </p>
                    <Link
                      href="/pricing"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-950 shadow-lg transition hover:bg-zinc-100"
                    >
                      View plans
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="mt-3 text-xl font-bold text-white">You&apos;re on a paid tier</h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      Adjust billing or move to Enterprise anytime.
                    </p>
                    <Link
                      href="/pricing"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      Billing &amp; plans
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5">
              <p className="text-sm font-semibold text-zinc-200">Quota snapshot</p>
              {quota ? (
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex justify-between gap-2 border-b border-zinc-800/80 pb-3">
                    <span className="text-zinc-500">Campaigns</span>
                    <span className="tabular-nums font-medium text-zinc-200">
                      {quota.campaignCount} / {quota.maxCampaigns}
                    </span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span className="text-zinc-500">Leads (month)</span>
                    <span className="tabular-nums font-medium text-zinc-200">
                      {quota.leadsUsedThisMonth} /{" "}
                      {quota.monthlyLeadLimit === Number.POSITIVE_INFINITY ? "∞" : quota.monthlyLeadLimit}
                    </span>
                  </li>
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">Could not load quota. Refresh the page.</p>
              )}
            </div>
          </aside>
        </div>

      </div>
    </main>
  );
}
