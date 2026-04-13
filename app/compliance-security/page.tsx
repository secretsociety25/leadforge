import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compliance & Security",
  description:
    "UK GDPR compliance, data processing agreements for Pro/Sovereign tiers, and proprietary signal sourcing via public records (Companies House).",
  alternates: { canonical: "/compliance-security" },
};

export default function ComplianceSecurityPage() {
  return (
    <main
      className="min-h-screen bg-black text-white"
      style={{
        background:
          "radial-gradient(120% 85% at 50% -18%, rgba(99, 102, 241, 0.22), transparent 58%), radial-gradient(95% 65% at 100% 0%, rgba(139, 92, 246, 0.14), transparent 52%), #000000",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <nav className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition hover:text-violet-200"
          >
            ← Home
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-semibold text-violet-300 transition hover:text-violet-200"
          >
            View tiers
          </Link>
        </nav>

        <header className="border-b border-indigo-500/20 pb-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-indigo-300/70">
            Trust & assurance
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Compliance &amp; Security
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Built to close the trust gap: clear governance language, auditable posture, and signal
            sourcing that avoids anything that looks like “scraping”.
          </p>
        </header>

        <section className="mt-10 space-y-8">
          <div className="rounded-2xl border border-indigo-500/25 bg-zinc-950/60 p-6 shadow-[0_0_0_1px_rgba(99,102,241,0.08)]">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
              Compliance posture
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-300">
              <li>
                <strong className="text-zinc-100">UK GDPR Compliant</strong> — designed for UK-first
                operations and lawful processing.
              </li>
              <li>
                <strong className="text-zinc-100">Data Processing Agreements</strong> available for
                all <strong className="text-zinc-100">Pro</strong> /{" "}
                <strong className="text-zinc-100">Sovereign</strong> tiers.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-indigo-500/25 bg-zinc-950/60 p-6 shadow-[0_0_0_1px_rgba(99,102,241,0.08)]">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
              Signal sourcing (public records)
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              <strong className="text-zinc-100">
                Proprietary Signal Sourcing via Public Records (Companies House)
              </strong>
              . We describe this as market mapping and signal synthesis — focused on lawful,
              auditable sources and clear provenance.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

