"use client";

import { Radar, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type SignalLeadRow = {
  id: string;
  name: string;
  company: string;
  role: string;
  location: string;
  score: string;
  status: string;
};

const SOVEREIGN_SEQUENCE = [
  "[L3] Intercepting Corporate Data...",
  "[SIGINT] Resolving Identities...",
  "[SYNC] Populating L3 Pipeline...",
] as const;

function buildPlaceholderLeads(location: string): SignalLeadRow[] {
  const loc = location.trim() || "United Kingdom";
  const base = [
    ["John Doe", "Axiom Quant Systems Ltd", "Chief Technology Officer", loc],
    ["Charlotte Webb", "Meridian Analytics", "Chief Revenue Officer", loc],
    ["James Okonkwo", "Northwind Systems", "VP Operations", loc],
    ["Priya Shah", "Helix Cloud Labs", "Head of Growth", loc],
    ["Oliver Grant", "Sterling Capital Partners", "Managing Director", loc],
    ["Elena Vasquez", "Atlas Manufacturing", "COO", loc],
    ["Thomas Byrne", "Cobalt Freight", "Director of Procurement", loc],
  ];
  return base.map(([name, company, role, locLabel], i) => ({
    id: `sig-${i}-${name.replace(/\s+/g, "-").toLowerCase()}`,
    name,
    company,
    role,
    location: locLabel,
    score: String(78 + ((i * 3) % 20)),
    status: "L3 Complete",
  }));
}

const rowHoverClass =
  "transition-[background-color,box-shadow] duration-200 hover:bg-indigo-500/[0.08] hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.22),0_0_24px_-8px_rgba(79,70,229,0.35)]";

const NEURAL_SYNTHESIS_LINES = [
  "[NEURAL] Bootstrapping Psychographic Manifold v4.2…",
  "[L3] Tensor fusion · executive intent vs. public comms delta",
  "[SIGINT] Resolving identity graph · corroboration 0.94",
  "[L3] Operational stress proxies · hiring velocity + capex mentions",
  "[NEURAL] Synthesising outreach hypothesis lattice (n=12)…",
  "[SYNC] Sealing classified dossier · AES-256 envelope OK",
] as const;

type DossierSections = {
  psychographic: string;
  operational: string;
  outreach: string;
};

function isJohnDoeLead(lead: SignalLeadRow): boolean {
  return lead.name.trim().toLowerCase() === "john doe";
}

/** Demo flagship dossier — depth reference for recordings (HTML fragments, John Doe only). */
const JOHN_DOE_CLASSIFIED_DOSSIER_HTML: DossierSections = {
  psychographic: `<p>Executive presents as systems-first, risk-aware, and visibly fatigued by “vendor theatre.” Public footprint (conference Q&amp;As, podcast cadence, and authored posts) clusters around deterministic engineering, latency budgets, and model governance — not growth hacks. Decision style is evidence-led: prefers quantified trade-offs, dislikes ambiguous ROI narratives, and delegates vendor screening to architecture + security pairs before procurement engages.</p><p>Signal graph indicates high conscientiousness and low tolerance for ambiguity under load: comms spike during release windows and regulatory filing periods, with sentiment cooling when roadmap promises outpace delivery reality. Peer-network edges show repeated co-attendance with heads of platform and CISO-adjacent leaders — a strong indicator that technical credibility and operational safety are gating factors, not price alone.</p><p>Psychographic composite (L3): “Sovereign operator” archetype — wants leverage without loss of control; receptive to bespoke workflows that sit behind their perimeter; allergic to black-box claims. Optimal framing: co-designed deployment, measurable SLOs, and a narrative that respects their mandate to protect customer data and model integrity.</p>`,

  operational: `<p>Axiom Quant Systems is mid-scale, UK-headquartered, and operating a hybrid estate (Kubernetes + regulated data zones) with a growing ML inference surface. Hiring signals show open roles for platform reliability, data governance, and MLOps-adjacent engineers — consistent with pipeline congestion between research prototypes and production-grade serving.</p><p>Primary bottlenecks inferred: (1) <strong>release throughput</strong> constrained by manual review gates and inconsistent environments; (2) <strong>observability debt</strong> — metrics exist, but cross-team causal tracing for model drift and latency regressions is fragmented; (3) <strong>vendor sprawl</strong> in the GTM stack creating duplicate records and weakening account-level truth; (4) <strong>security review cycles</strong> lengthening procurement for anything touching client portfolios.</p><p>These friction points are not “culture problems” — they are coordination and instrumentation problems. The organisation is trying to scale intelligence products without scaling operational risk. Any partner narrative must map cleanly to SRE/SLO language, change-management discipline, and an explicit rollback posture.</p>`,

  outreach: `<p>Open with a <strong>constraint-led hook</strong> tied to release risk or governance, not product features. Reference a credible operational scenario (e.g., “latency regressions after a model promotion” or “audit readiness for a tier-1 client”) and offer a <strong>narrow diagnostic</strong> — not a demo.</p><p>Recommended motion: a 30-minute “signal alignment” working session with a solution architect + security liaison, outcome-defined (e.g., map three integration points and one measurable success criterion). Avoid ROI superlatives; instead propose a phased path: instrument → harden → expand, with exit criteria at each gate.</p><p>Tone: crisp, British English, no hype adjectives. Close with a single ask: permission to share a one-page architecture sketch tailored to their stated constraints (not a generic deck). If no reply, follow with a <strong>high-signal nudge</strong> referencing a public artifact (talk, paper, hiring post) to prove the outreach was researched — not sequenced.</p>`,

};

function templateDossierForLead(lead: SignalLeadRow): DossierSections {
  const co = lead.company || "the organisation";
  return {
    psychographic: `${lead.name} reads as a pragmatic operator in ${lead.role} at ${co}. Public signals suggest a bias toward execution over abstraction: comms emphasise delivery cadence, cross-functional alignment, and risk-aware expansion. L3 classifies the profile as “steady accelerator” — receptive to tools that reduce coordination tax without adding governance overhead.`,
    operational: `Inferred pressure at ${co}: scaling customer delivery while keeping headcount lean. Typical bottlenecks in comparable accounts include pipeline hygiene, inconsistent handoffs between marketing and sales, and manual research steps that cap outbound quality. Territory context (${lead.location}) implies compliance-aware messaging and a preference for concise, evidence-backed proposals.`,
    outreach: `Lead with a specific operational hypothesis (e.g., “reducing research latency per account”) and offer a tight next step: a 20-minute working review against their ICP parameters. Keep copy factual; anchor to ${co}’s sector motion and ${lead.role} priorities. Close with one measurable outcome for a pilot window (meetings booked, qualified opportunities, or time saved per rep).`,
  };
}

export function SignalDiscoveryClient() {
  const [niche, setNiche] = useState("");
  const [headcount, setHeadcount] = useState("51–200");
  const [location, setLocation] = useState("United Kingdom");
  const [phase, setPhase] = useState<"idle" | "sovereign" | "done">("idle");
  const [sovereignIndex, setSovereignIndex] = useState(0);
  const [leads, setLeads] = useState<SignalLeadRow[]>([]);
  const [intelLead, setIntelLead] = useState<SignalLeadRow | null>(null);
  const [intelOpen, setIntelOpen] = useState(false);
  const [intelLoading, setIntelLoading] = useState(false);
  const [synthLog, setSynthLog] = useState<string[]>([]);
  const [intelPanelEntered, setIntelPanelEntered] = useState(false);

  const runMapping = useCallback(async () => {
    setLeads([]);
    setSovereignIndex(0);
    setPhase("sovereign");

    for (let i = 0; i < SOVEREIGN_SEQUENCE.length; i++) {
      setSovereignIndex(i);
      await new Promise((r) => setTimeout(r, 1100));
    }

    const next = buildPlaceholderLeads(location);
    setLeads(next);
    setPhase("done");
  }, [location]);

  const closeIntelPanel = useCallback(() => {
    setIntelOpen(false);
    setIntelLead(null);
    setIntelLoading(false);
    setSynthLog([]);
  }, []);

  const openIntelForLead = useCallback((row: SignalLeadRow) => {
    setIntelLead(row);
    setIntelOpen(true);
  }, []);

  useEffect(() => {
    if (!intelLead || !intelOpen) return;
    setIntelLoading(true);
    setSynthLog([]);
    const timeouts: number[] = [];
    let delay = 120;
    for (const line of NEURAL_SYNTHESIS_LINES) {
      const t = window.setTimeout(() => {
        setSynthLog((prev) => [...prev, line]);
      }, delay);
      timeouts.push(t);
      delay += 340;
    }
    const done = window.setTimeout(() => setIntelLoading(false), delay + 420);
    timeouts.push(done);
    return () => {
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [intelLead, intelOpen]);

  useEffect(() => {
    if (!intelOpen) {
      setIntelPanelEntered(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setIntelPanelEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [intelOpen]);

  useEffect(() => {
    if (!intelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeIntelPanel();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [intelOpen, closeIntelPanel]);

  return (
    <div className="relative min-h-screen min-w-0 bg-transparent text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(99 102 241 / 0.45) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(99 102 241 / 0.45) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="border-b border-indigo-500/25 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/35 bg-indigo-500/[0.08] shadow-[0_0_32px_-8px_rgba(99,102,241,0.55)]">
                <Radar className="size-5 text-violet-300" aria-hidden />
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-indigo-300/80">
                  Signal Discovery
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Market mapping console
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
                  Define your ideal account surface — we run sovereign{" "}
                  <span className="text-violet-300/95">signal synthesis</span> and map the graph before
                  anything hits your pipeline.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300/95">
              <Sparkles className="size-3.5" aria-hidden />
              Default territory: UK
            </div>
          </div>
        </header>

        <section className="mt-10" aria-labelledby="signal-params-heading">
          <h2 id="signal-params-heading" className="sr-only">
            Search parameters
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/85">
                Niche / industry
              </span>
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. B2B SaaS, Industrial logistics"
                className="rounded-xl border border-indigo-500/25 bg-black/50 px-4 py-3 text-sm text-zinc-100 shadow-inner shadow-black/40 outline-none ring-0 transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.35)]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/85">
                Headcount
              </span>
              <select
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                className="rounded-xl border border-indigo-500/25 bg-black/50 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-violet-500/45"
              >
                <option>1–10</option>
                <option>11–50</option>
                <option>51–200</option>
                <option>201–500</option>
                <option>501–1,000</option>
                <option>1,000+</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/85">
                Location
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="United Kingdom"
                className="rounded-xl border border-indigo-500/25 bg-black/50 px-4 py-3 text-sm text-zinc-100 shadow-inner shadow-black/40 outline-none placeholder:text-zinc-600 focus:border-violet-500/45"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={phase === "sovereign"}
              onClick={() => void runMapping()}
              className="inline-flex min-h-[52px] min-w-[220px] items-center justify-center rounded-xl border border-violet-400/35 bg-gradient-to-br from-violet-600 via-indigo-700 to-indigo-950 px-8 text-sm font-semibold tracking-wide text-white shadow-[0_8px_40px_-8px_rgba(99,102,241,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
            >
              {phase === "sovereign" ? "Mapping in progress…" : "Begin Market Mapping"}
            </button>
            {phase === "done" ? (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-sm text-emerald-400/90">
                  Signal synthesis complete — review mapped accounts below.
                </span>
                <span className="text-xs text-zinc-500">
                  ICP: {niche.trim() || "Open market"} · {headcount} · {location.trim() || "UK"}
                </span>
              </div>
            ) : null}
          </div>
        </section>

        {phase === "sovereign" ? (
          <section
            className="mt-12 overflow-hidden rounded-2xl border border-indigo-500/30 bg-black/70 p-6 shadow-[0_0_0_1px_rgba(79,70,229,0.12)]"
            aria-live="polite"
            aria-busy="true"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet-400/90">
              Sovereign sequence
            </p>
            <ul className="mt-4 space-y-3 font-mono text-sm text-emerald-400/95">
              {SOVEREIGN_SEQUENCE.map((line, i) => (
                <li
                  key={line}
                  className={
                    i <= sovereignIndex
                      ? "opacity-100 transition-opacity duration-300"
                      : "opacity-25"
                  }
                >
                  <span className="text-emerald-600/80">➜</span> {line}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-14" aria-labelledby="mapped-leads-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="mapped-leads-heading" className="text-lg font-semibold text-white">
                Mapped accounts
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                High-signal placeholder layer — wire to live ingestion when ready.
              </p>
            </div>
            <span
              className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                leads.length > 0
                  ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300/90"
                  : "border-zinc-600/40 bg-zinc-900/60 text-zinc-500"
              }`}
            >
              {leads.length > 0 ? "Populated" : "Awaiting mapping"}
            </span>
          </div>

          {leads.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-700/55 bg-zinc-950/35 px-5 py-12 text-center text-sm leading-relaxed text-zinc-500">
              Run <span className="text-zinc-400">Begin Market Mapping</span> to execute the sovereign
              sequence and populate this table with mapped decision-makers.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-black/60 shadow-[0_0_0_1px_rgba(99,102,241,0.08)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-indigo-500/15 bg-zinc-950/90">
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Name
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Company
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Role
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Territory
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Signal score
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Intel
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/10">
                    {leads.map((row, rowIndex) => (
                      <tr
                        key={row.id}
                        className={`${rowHoverClass} lf-l3-pipeline-row`}
                        style={{ animationDelay: `${rowIndex * 72}ms` }}
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-100">{row.name}</td>
                        <td className="max-w-[180px] truncate px-5 py-4 text-zinc-400" title={row.company}>
                          {row.company}
                        </td>
                        <td className="max-w-[160px] truncate px-5 py-4 text-zinc-400" title={row.role}>
                          {row.role}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500">{row.location}</td>
                        <td className="whitespace-nowrap px-5 py-4 tabular-nums">
                          <span className="text-violet-300/95">{row.score}</span>
                          <span className="text-zinc-600"> /100</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="inline-flex rounded-full border border-emerald-500/35 bg-emerald-500/[0.08] px-2.5 py-0.5 text-xs font-medium text-emerald-300/95">
                            {row.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openIntelForLead(row)}
                            className="inline-flex items-center justify-center rounded-lg border border-violet-500/40 bg-violet-500/[0.12] px-3 py-2 text-xs font-semibold text-violet-100 shadow-[0_0_20px_-8px_rgba(139,92,246,0.45)] transition hover:border-violet-400/55 hover:bg-violet-500/20"
                          >
                            Access Intel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {intelOpen && intelLead ? (
        <div className="fixed inset-0 z-[100] flex justify-end" role="presentation">
          <button
            type="button"
            aria-label="Close dossier panel"
            className="absolute inset-0 z-0 bg-black/70 backdrop-blur-[2px] transition-opacity"
            onClick={closeIntelPanel}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="intel-dossier-title"
            className={`relative z-10 flex h-full w-full max-w-lg flex-col border-l border-indigo-500/35 bg-zinc-950 shadow-[0_0_80px_-20px_rgba(99,102,241,0.5)] transition-transform duration-300 ease-out will-change-transform ${
              intelPanelEntered ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-black px-5 py-4">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-indigo-400/90">
                  Classified dossier
                </p>
                <h2 id="intel-dossier-title" className="mt-1 truncate text-lg font-semibold text-white">
                  {intelLead.name}
                </h2>
                <p className="truncate text-sm text-zinc-500">
                  {intelLead.role} · {intelLead.company}
                </p>
              </div>
              <button
                type="button"
                onClick={closeIntelPanel}
                className="shrink-0 rounded-lg border border-zinc-700/80 bg-zinc-900/80 p-2 text-zinc-400 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {intelLoading ? (
                <div
                  className="rounded-xl border border-indigo-500/25 bg-black/60 p-4"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400/50" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300/90">
                      Neural synthesis
                    </p>
                  </div>
                  <div className="font-mono text-[11px] leading-relaxed text-emerald-400/95 sm:text-xs">
                    {synthLog.map((line, idx) => (
                      <p key={`${line}-${idx}`} className="mb-1.5">
                        <span className="text-emerald-600/80">➜</span> {line}
                      </p>
                    ))}
                  </div>
                </div>
              ) : isJohnDoeLead(intelLead) ? (
                <article className="space-y-8">
                  <section>
                    <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-400/90">
                      Psychographic Profile
                    </h3>
                    <div
                      className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-zinc-100"
                      dangerouslySetInnerHTML={{ __html: JOHN_DOE_CLASSIFIED_DOSSIER_HTML.psychographic }}
                    />
                  </section>
                  <section>
                    <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-400/90">
                      Operational Bottlenecks
                    </h3>
                    <div
                      className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-zinc-100"
                      dangerouslySetInnerHTML={{ __html: JOHN_DOE_CLASSIFIED_DOSSIER_HTML.operational }}
                    />
                  </section>
                  <section>
                    <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-400/90">
                      Outreach Strategy
                    </h3>
                    <div
                      className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-zinc-100"
                      dangerouslySetInnerHTML={{ __html: JOHN_DOE_CLASSIFIED_DOSSIER_HTML.outreach }}
                    />
                  </section>
                </article>
              ) : (
                <article className="space-y-8">
                  {(() => {
                    const d = templateDossierForLead(intelLead);
                    return (
                      <>
                        <section>
                          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-400/90">
                            Psychographic Profile
                          </h3>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                            {d.psychographic}
                          </p>
                        </section>
                        <section>
                          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-400/90">
                            Operational Bottlenecks
                          </h3>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                            {d.operational}
                          </p>
                        </section>
                        <section>
                          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-400/90">
                            Outreach Strategy
                          </h3>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                            {d.outreach}
                          </p>
                        </section>
                      </>
                    );
                  })()}
                </article>
              )}
            </div>

            <div className="border-t border-indigo-500/15 bg-black/50 px-5 py-3">
              <p className="text-center text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                L3 signal score {intelLead.score}/100 · {intelLead.location}
                {isJohnDoeLead(intelLead) ? " · Demo depth profile" : ""}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
