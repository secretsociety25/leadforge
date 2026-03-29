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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/80">
        <div className="lf-hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-indigo-600/15 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-1/4 top-24 h-[320px] w-[55%] rounded-full bg-teal-500/10 blur-[90px]"
          aria-hidden
        />

        <header className="relative z-50 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-tight text-slate-200">
            LeadForge{" "}
            <span className="font-normal text-slate-500">by MTDFIX</span>
          </p>
          <nav
            className="relative z-50 flex flex-wrap items-center justify-end gap-2 text-sm sm:gap-3"
            aria-label="Primary"
          >
            <Link
              href="/pricing"
              prefetch={false}
              className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg px-3 py-2 text-slate-400 transition hover:bg-slate-800/40 hover:text-slate-200"
            >
              Pricing
            </Link>
            <a
              href="/login"
              className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg px-3 py-2 text-slate-400 transition hover:bg-slate-800/40 hover:text-slate-200"
            >
              Sign in
            </a>
            <Link
              href="/dashboard"
              prefetch={false}
              className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg px-3 py-2 font-medium text-indigo-400 transition hover:bg-slate-800/40 hover:text-indigo-300"
            >
              Dashboard
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="lf-kinetic-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-400/90">
              B2B outbound engine
            </p>
            <h1 className="lf-kinetic-2 mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem]">
              Outbound That Actually Converts.
            </h1>
            <p className="lf-kinetic-3 mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
              Stop the &apos;Spray and Pray&apos;. LeadForge researches every prospect on LinkedIn and writes
              1:1 personalized emails that bypass spam filters and land meetings.
            </p>
            <div className="lf-kinetic-4 mt-10 flex flex-col items-center justify-center gap-3">
              <div className="flex w-full max-w-lg flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_0_48px_-8px_rgba(99,102,241,0.55),0_0_80px_-20px_rgba(20,184,166,0.35)] transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  Launch Engine
                  <ArrowRight className="size-5 shrink-0" aria-hidden />
                </Link>
                <a
                  href="#proof"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-700/90 bg-slate-950/40 px-8 py-3 text-base font-semibold text-slate-200 backdrop-blur-sm transition hover:border-teal-500/40 hover:bg-slate-900/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500/50"
                >
                  <Play className="size-4 fill-current opacity-90" aria-hidden />
                  Watch Demo
                </a>
              </div>
            </div>

            {/* Outside .lf-kinetic-* so hero CTAs animate but PDF control is never stuck at opacity:0 */}
            <div className="relative z-[100] mt-6 flex w-full flex-col items-center justify-center gap-2">
              <p className="text-center text-xs text-slate-500">
                Product overview — no account required.
              </p>
              <DownloadExplainerPdfButton
                label="Download PDF Overview"
                buttonClassName="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Proof — Live Feed mockup */}
      <section
        id="proof"
        className="scroll-mt-20 border-b border-slate-800/80 bg-slate-950 py-16 sm:py-24"
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

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_24px_64px_-16px_rgba(0,0,0,0.55)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400/40" />
                  <span className="relative inline-flex size-2 rounded-full bg-teal-500" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Live feed
                </span>
              </div>
              <span className="rounded-md border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                Mock
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80">
                    <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                      Prospect
                    </th>
                    <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                      Research Signal
                    </th>
                    <th className="min-w-[280px] px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                      AI Draft
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/90">
                  <tr className="bg-slate-950/30">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-100 sm:px-5">
                      Satya Nadella (Microsoft)
                    </td>
                    <td className="px-4 py-4 text-slate-400 sm:px-5">
                      <span className="text-teal-500/90">Signal: </span>
                      Recent post on AI Ethics
                    </td>
                    <td className="px-4 py-4 text-slate-400 sm:px-5">
                      <span className="text-indigo-400/90">Draft: </span>
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
      <section className="border-b border-slate-800/80 py-16 sm:py-24" aria-labelledby="pillars-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="pillars-heading" className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            The workflow
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
            Three pillars — from file drop to inbox-ready copy.
          </p>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {pillars.map(({ title, body, icon: Icon }) => (
              <li
                key={title}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-black/20 transition hover:border-indigo-500/20 hover:shadow-indigo-950/20"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust */}
      <section className="py-14 sm:py-20" aria-label="Trust and compliance">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 px-6 py-10 text-center sm:px-10">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300">
                <BadgeCheck className="size-3.5 text-teal-400" aria-hidden />
                SOC 2 Type II Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300">
                <BadgeCheck className="size-3.5 text-indigo-400" aria-hidden />
                GDPR Ready
              </span>
            </div>
            <p className="max-w-lg text-sm text-slate-400">
              Powering outreach for{" "}
              <span className="font-semibold text-slate-200">500+ high-growth teams.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-white">LeadForge</p>
            <p className="mt-1 text-xs text-slate-500">Part of the MTDFIX Ecosystem.</p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400" aria-label="Footer">
            <Link href="/dashboard" prefetch={false} className="transition hover:text-indigo-400">
              Dashboard
            </Link>
            <Link href="/pricing" prefetch={false} className="transition hover:text-indigo-400">
              Pricing
            </Link>
            <a href="/login" className="transition hover:text-indigo-400">
              Login
            </a>
          </nav>
          <p className="text-xs text-slate-600 sm:text-right">
            © {new Date().getFullYear()} MTDFIX Services Ltd.
          </p>
        </div>
      </footer>
    </div>
  );
}
