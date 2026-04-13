"use client";

import { Radar, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";

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
  "cursor-default transition-[background-color,box-shadow] duration-200 hover:bg-indigo-500/[0.08] hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.22),0_0_24px_-8px_rgba(79,70,229,0.35)]";

export function SignalDiscoveryClient() {
  const [niche, setNiche] = useState("");
  const [headcount, setHeadcount] = useState("51–200");
  const [location, setLocation] = useState("United Kingdom");
  const [phase, setPhase] = useState<"idle" | "sovereign" | "done">("idle");
  const [sovereignIndex, setSovereignIndex] = useState(0);
  const [leads, setLeads] = useState<SignalLeadRow[]>([]);

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
  }, [niche, location]);

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
                <table className="w-full min-w-[720px] text-left text-sm">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
