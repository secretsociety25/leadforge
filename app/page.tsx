import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Play,
  ScanSearch,
  ShieldCheck,
  Upload,
} from "lucide-react";
import Link from "next/link";

import { DownloadExplainerPdfButton } from "@/components/marketing/download-explainer-pdf-button";
import { MarketingSiteHeader } from "@/components/marketing/marketing-site-header";

export const metadata: Metadata = {
  title: "LeadForge by MTDFIX — Outbound That Actually Converts",
  description:
    "LinkedIn research, 1:1 AI email drafts, and verified deliverability. Stop spray-and-pray. Launch the engine.",
};

const pillars = [
  {
    title: "Data Enrichment",
    body: "Upload your Apollo/SalesNav CSV. We map it instantly.",
    icon: Upload,
  },
  {
    title: "L3 Psychographic Research",
    body: "Our AI scans LinkedIn and 10-Ks to find the 'Business Pain'.",
    icon: ScanSearch,
  },
  {
    title: "Waterfall Deliverability",
    body: "We verify every email so you never hit a bounce.",
    icon: ShieldCheck,
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/80">
        <div className="lf-hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-indigo-600/15 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-1/4 top-24 h-[320px] w-[55%] rounded-full bg-teal-500/10 blur-[90px]"
          aria-hidden
        />

        <MarketingSiteHeader />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="lf-kinetic-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400/90">
              B2B outbound engine
            </p>
            <h1 className="lf-kinetic-2 mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem]">
              Outbound That Actually Converts.
            </h1>
            <p className="lf-kinetic-3 mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
              Stop the &apos;Spray and Pray&apos;. LeadForge researches every prospect on LinkedIn and writes
              1:1 personalized emails that bypass spam filters and land meetings.
            </p>
            <div className="lf-kinetic-4 mt-10 flex flex-col items-center justify-center gap-3">
              <div className="flex w-full max-w-lg flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link href="/dashboard" className="lf-marketing-primary w-full sm:w-auto">
                  Launch Engine
                  <ArrowRight className="size-5 shrink-0" aria-hidden />
                </Link>
                <a href="#proof" className="lf-marketing-secondary w-full sm:w-auto">
                  <Play className="size-4 fill-current opacity-90" aria-hidden />
                  Watch Demo
                </a>
              </div>
            </div>
          </div>

          <div id="partner-program" className="mt-20 py-16 border-t border-zinc-800">
            <div className="max-w-4xl mx-auto text-center px-6">
              <div className="inline-block bg-violet-950 text-violet-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                PARTNER PROGRAM
              </div>
              <h2 className="text-5xl font-bold mb-6">Earn 60% Recurring Commission</h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
                Refer sales teams, agencies, or other users to LeadForge and earn 60% of every subscription they pay —
                every month, forever.
              </p>
              <a
                href="#"
                className="inline-block bg-violet-600 hover:bg-violet-700 px-10 py-4 rounded-2xl text-lg font-medium"
              >
                Become a Partner →
              </a>
            </div>
          </div>

          {/* Outside .lf-kinetic-* so hero CTAs animate but PDF control is never stuck at opacity:0 */}
          <div className="relative z-[100] mx-auto mt-8 flex w-full max-w-3xl flex-col items-center justify-center gap-2 border-t border-zinc-800/60 pt-8">
            <p className="text-center text-xs text-zinc-500">
              Product overview — no account required.
            </p>
            <DownloadExplainerPdfButton label="Download PDF Overview" />
          </div>
        </div>
      </section>

      {/* Proof — Live Feed mockup */}
      <section
        id="proof"
        className="scroll-mt-20 border-b border-zinc-800/80 bg-zinc-950 py-16 sm:py-24"
        aria-labelledby="proof-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 id="proof-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Live pipeline
            </h2>
            <p className="mt-2 text-slate-400">
              Real UI — research signals and drafts as they flow through the engine.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_0_1px_rgba(24,24,27,0.9),0_24px_64px_-16px_rgba(0,0,0,0.55)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400/40" />
                  <span className="relative inline-flex size-2 rounded-full bg-teal-500" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Live feed
                </span>
              </div>
              <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
                Mock
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/80">
                    <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-5">
                      Prospect
                    </th>
                    <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-5">
                      Research Signal
                    </th>
                    <th className="min-w-[280px] px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-5">
                      AI Draft
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/90">
                  <tr className="bg-zinc-950/30">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-zinc-100 sm:px-5">
                      Satya Nadella (Microsoft)
                    </td>
                    <td className="px-4 py-4 text-zinc-400 sm:px-5">
                      <span className="text-violet-400/90">Signal: </span>
                      Recent post on AI Ethics
                    </td>
                    <td className="px-4 py-4 text-zinc-400 sm:px-5">
                      <span className="text-violet-400/90">Draft: </span>
                      &apos;Satya, your point about the democratization of GPU access is exactly what
                      we&apos;re solving...&apos;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow pillars */}
      <section className="border-b border-zinc-800/80 py-16 sm:py-24" aria-labelledby="pillars-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="pillars-heading" className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            The workflow
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-400">
            Three pillars — from file drop to inbox-ready copy.
          </p>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {pillars.map(({ title, body, icon: Icon }) => (
              <li
                key={title}
                className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-lg shadow-black/20 transition hover:border-violet-500/25 hover:shadow-violet-950/20"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust */}
      <section className="py-14 sm:py-20" aria-label="Trust and compliance">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950 px-6 py-10 text-center sm:px-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300">
                <BadgeCheck className="size-3.5 text-violet-400" aria-hidden />
                SOC 2 Type II Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300">
                <BadgeCheck className="size-3.5 text-violet-400" aria-hidden />
                GDPR Ready
              </span>
            </div>
            <p className="max-w-lg text-sm text-zinc-400">
              Powering outreach for{" "}
              <span className="font-semibold text-zinc-200">500+ high-growth teams.</span>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
