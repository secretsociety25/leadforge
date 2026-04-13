"use client";

import { FileUp, Radio, X } from "lucide-react";
import Papa from "papaparse";
import { useCallback, useEffect, useRef, useState } from "react";

const FEED_LINES = [
  "[L3] Mapping Graph · high-signal layer online",
  "[L3] Social-graph traversal · edge weights converging",
  "[SIGINT] Intercepting market signals · noise floor low",
  "[NEURAL] Warming Psychographic Manifold…",
  "[L3] Executive intent vector · centroid update",
  "[INGEST] Prospeo schema aligned · identity columns locked",
  "[L3] Cross-encoding high-signal traits vs. ICP template v4",
  "[NEURAL] Multi-channel signal resolution · hypothesis #2 rising",
  "[SIGINT] Competitive signal delta · lexicon score stable",
  "[L3] Confidence calibration · ECE nominal",
  "[EXPORT] Staging row batch · AES-256 at rest",
  "[NEURAL] Hallucination guard · pass",
  "[L3] Psychographic composite · executive weighting…",
  "[L3] Mapping Graph depth +1 · manifold coverage OK",
] as const;

type PipelineRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  linkedinUrl: string;
  score: string;
  status: string;
};

function normHeader(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Resolve Prospeo / common export column names */
function mapRowFields(row: Record<string, unknown>): {
  fullName: string;
  email: string;
  linkedinUrl: string;
} {
  const keys = Object.keys(row);
  const byNorm = new Map(
    keys.map((k) => {
      const clean = k.replace(/^\ufeff/, "");
      return [normHeader(clean), k] as const;
    }),
  );

  const pick = (candidates: string[]): string => {
    for (const c of candidates) {
      const k = byNorm.get(normHeader(c));
      if (k !== undefined) {
        const v = row[k];
        if (v != null && String(v).trim() !== "") return String(v).trim();
      }
    }
    for (const c of candidates) {
      const cn = normHeader(c).replace(/[^a-z0-9]/g, "");
      for (const key of keys) {
        const kn = normHeader(key.replace(/^\ufeff/, "")).replace(/[^a-z0-9]/g, "");
        if (kn === cn || kn.includes(cn) || cn.includes(kn)) {
          const v = row[key];
          if (v != null && String(v).trim() !== "") return String(v).trim();
        }
      }
    }
    return "";
  };

  const fullName = pick([
    "Full Name",
    "full name",
    "Name",
    "First Name",
    "Prospect Name",
  ]);
  const email = pick(["Email", "email", "E-mail", "Email Address"]);
  const linkedinUrl = pick([
    "LinkedIn Profile URL",
    "Linkedin Profile URL",
    "LinkedIn URL",
    "linkedin url",
    "LinkedIn",
    "Linkedin",
  ]);

  return { fullName, email, linkedinUrl };
}

function companyFromEmail(email: string): string {
  const m = email.trim().match(/@([a-zA-Z0-9.-]+)/);
  if (!m) return "—";
  const parts = m[1].split(".");
  const slug = parts[0] ?? "";
  if (!slug) return "—";
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}

function randomScore() {
  return String(Math.floor(72 + Math.random() * 27));
}

const rowHoverClass =
  "cursor-pointer transition-[background-color,box-shadow] duration-200 hover:bg-indigo-500/[0.08] hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.22),0_0_24px_-8px_rgba(79,70,229,0.35)]";

function firstNameFromFull(full: string) {
  const t = full.trim();
  if (!t) return "there";
  return t.split(/\s+/)[0] ?? "there";
}

function researchSummaryPlaceholder(company: string) {
  const c = company === "—" ? "the organisation" : company;
  return `Identified scaling bottleneck at ${c}. Highly receptive to AI-automation messaging due to recent expansion.`;
}

function outreachHookDraft(row: PipelineRow) {
  const first = firstNameFromFull(row.name);
  const co = row.company === "—" ? "your team" : row.company;
  return `Hi ${first} — your L3 profile flagged ${co} as a high-signal account: ops load is scaling faster than headcount, which usually means automation leverage is on the table. If you’re open to a short thread, I can share how similar teams are tightening outbound + internal handoffs with AI-native workflows — conversational, no pitch deck.`;
}

function timestampForFeedLine() {
  return new Date().toISOString().split("T")[1].slice(0, 12);
}

function formatAmbientLine(content: string) {
  return `[${timestampForFeedLine()}] ${content}`;
}

/** Seeded ambient buffer so the terminal looks “live” before any interval fires. */
function initialAmbientFeedLines(): string[] {
  return Array.from(
    { length: 10 },
    (_, i) => formatAmbientLine(FEED_LINES[i % FEED_LINES.length]),
  );
}

export function L3ResearchTerminal() {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<PipelineRow[]>([]);
  /** Bumps when a successful CSV load populates the table so row fade animations replay. */
  const [pipelineGeneration, setPipelineGeneration] = useState(0);
  const [tableSource, setTableSource] = useState<"idle" | "csv">("idle");
  /** Single source of truth for Neural Feed — every line is rendered from this array. */
  const [feedLines, setFeedLines] = useState<string[]>([]);
  const [feedPhase, setFeedPhase] = useState<"ambient" | "extraction" | "mission">("ambient");
  const [missionReveal, setMissionReveal] = useState(false);
  const [dossierLead, setDossierLead] = useState<PipelineRow | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pauseRandomFeedRef = useRef(false);
  /** After a successful L3 CSV run, ambient logs stay off for the session. */
  const ambientFrozenAfterL3Ref = useRef(false);
  const processRunIdRef = useRef(0);
  /** Invalidates delayed table population if the user starts another ingest. */
  const ingestSessionRef = useRef(0);

  const formatFeedLine = useCallback((content: string) => formatAmbientLine(content), []);

  const appendFeed = useCallback(
    (line: string) => {
      setFeedLines((prev) => [...prev, formatFeedLine(line)].slice(-120));
    },
    [formatFeedLine],
  );

  const pushFeedLine = useCallback(() => {
    if (pauseRandomFeedRef.current || ambientFrozenAfterL3Ref.current) return;
    setFeedLines((prev) => {
      const next = FEED_LINES[Math.floor(Math.random() * FEED_LINES.length)];
      return [...prev, formatAmbientLine(next)].slice(-40);
    });
  }, []);

  const ambientPrimedRef = useRef(false);

  /** Ambient feed stream — seed + prime on client only so timestamps match (no SSR/client mismatch). */
  useEffect(() => {
    if (ambientPrimedRef.current || ambientFrozenAfterL3Ref.current) return;
    ambientPrimedRef.current = true;
    setFeedLines(initialAmbientFeedLines());
    pushFeedLine();
    const t1 = window.setTimeout(() => pushFeedLine(), 280);
    const t2 = window.setTimeout(() => pushFeedLine(), 560);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pushFeedLine]);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced ? 2800 : 780;
    const id = window.setInterval(pushFeedLine, ms);
    return () => window.clearInterval(id);
  }, [pushFeedLine]);

  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [feedLines]);

  useEffect(() => {
    if (!dossierLead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDossierLead(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [dossierLead]);

  const runRowPipeline = useCallback(
    async (parsedRows: PipelineRow[]) => {
      const runId = ++processRunIdRef.current;
      pauseRandomFeedRef.current = true;

      for (let i = 0; i < parsedRows.length; i++) {
        if (processRunIdRef.current !== runId) return;
        const lead = parsedRows[i];
        const name = lead.name || "Unknown";
        const company = lead.company || "—";

        setRows((prev) =>
          prev.map((r) => (r.id === lead.id ? { ...r, status: "Scanning…", score: "—" } : r)),
        );
        await new Promise((r) => setTimeout(r, 80));

        appendFeed(`[L3] Psychographic synthesis · mapping graph for ${name} at ${company}…`);
        await new Promise((r) => setTimeout(r, 260));

        if (processRunIdRef.current !== runId) return;
        const score = randomScore();
        setRows((prev) =>
          prev.map((r) =>
            r.id === lead.id ? { ...r, status: "L3 Complete", score } : r,
          ),
        );
        await new Promise((r) => setTimeout(r, 120));
      }

      if (processRunIdRef.current !== runId) return;
      pauseRandomFeedRef.current = true;
      ambientFrozenAfterL3Ref.current = true;
      setFeedPhase("mission");
      setMissionReveal(true);
    },
    [appendFeed],
  );

  const ingestFile = useCallback(
    (file: File) => {
      processRunIdRef.current += 1;
      ingestSessionRef.current += 1;
      const ingestSession = ingestSessionRef.current;
      setDossierLead(null);
      setRows([]);
      setTableSource("idle");
      setFileName(file.name);
      setMissionReveal(false);
      setFeedPhase("extraction");
      pauseRandomFeedRef.current = true;
      /* Drop ambient buffer — real-time lines append via appendFeed only */
      setFeedLines([
        formatFeedLine(
          `[SYS] CSV detected: ${file.name}. Initialising L3 Parsing...`,
        ),
      ]);

      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: "greedy",
        complete: (result) => {
          const data = result.data.filter((r) => Object.keys(r).some((k) => String(r[k] ?? "").trim() !== ""));
          if (data.length === 0) {
            appendFeed("[ERR] CSV has no data rows — check export");
            if (!ambientFrozenAfterL3Ref.current) pauseRandomFeedRef.current = false;
            setFeedPhase("ambient");
            return;
          }

          const mapped: PipelineRow[] = [];
          for (let i = 0; i < data.length; i++) {
            const { fullName, email, linkedinUrl } = mapRowFields(data[i]);
            const name = fullName || email || `Lead ${i + 1}`;
            const id = `csv-${i}-${email || name}`.replace(/\s+/g, "-");
            mapped.push({
              id,
              name,
              company: email ? companyFromEmail(email) : "—",
              email,
              linkedinUrl,
              score: "—",
              status: "Queued",
            });
          }

          if (mapped.length === 0) {
            appendFeed("[ERR] Could not map required identity columns (name / email / profile URL)");
            if (!ambientFrozenAfterL3Ref.current) pauseRandomFeedRef.current = false;
            setFeedPhase("ambient");
            return;
          }

          appendFeed(
            `[INGEST] ${mapped.length} high-signal contact(s) validated — L3 neural plane online…`,
          );
          window.setTimeout(() => {
            if (ingestSession !== ingestSessionRef.current) return;
            setPipelineGeneration((g) => g + 1);
            setTableSource("csv");
            setRows(mapped);
            void runRowPipeline(mapped);
          }, 64);
        },
        error: (err) => {
          appendFeed(`[ERR] Parse failed · ${err.message}`);
          if (!ambientFrozenAfterL3Ref.current) pauseRandomFeedRef.current = false;
          setFeedPhase("ambient");
        },
      });
    },
    [appendFeed, formatFeedLine, runRowPipeline],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) ingestFile(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) ingestFile(f);
    e.target.value = "";
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(99 102 241 / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(99 102 241 / 0.5) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/3 top-0 h-[min(55vh,420px)] w-[70%] rounded-full bg-violet-600/[0.07] blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(45vh,360px)] w-[55%] rounded-full bg-indigo-600/[0.06] blur-[100px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-indigo-500/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/[0.06] shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)]">
              <Radio className="size-4 text-violet-400" aria-hidden />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                LeadForge // L3 Research Terminal
              </h1>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300/70">
                Incandescent · Prospeo pipeline
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            </span>
            <span className="text-sm font-medium tabular-nums text-emerald-400/95">System Active</span>
          </div>
        </header>

        {/* Core: ingestion + neural */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Ingestion */}
          <section aria-label="Prospeo CSV ingestion">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-300/90">
                Ingestion Zone
              </h2>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Prospeo CSV
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={onFileChange}
            />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-[border-color,box-shadow,background-color] duration-300 ${
                dragActive
                  ? "border-violet-400/70 bg-violet-500/[0.06] shadow-[0_0_48px_-12px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "border-indigo-500/35 bg-black/40 hover:border-violet-500/50 hover:bg-violet-500/[0.03] hover:shadow-[0_0_40px_-16px_rgba(99,102,241,0.45)]"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-indigo-500/10 group-hover:ring-violet-500/25" />
              <FileUp
                className="size-10 text-violet-400/80 transition-transform duration-300 group-hover:scale-105 group-hover:text-violet-300"
                strokeWidth={1.25}
                aria-hidden
              />
              <p className="mt-4 text-center text-sm font-medium text-zinc-200">
                Drop Prospeo export{" "}
                <span className="text-violet-300/90">.csv</span> here
              </p>
              <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-zinc-500">
                Parsed in-browser with Papa Parse — maps Full Name, Email, and profile URL.
              </p>
              {fileName ? (
                <p className="mt-6 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-2 text-xs font-mono text-emerald-300/95">
                  Staged: {fileName}
                </p>
              ) : null}
            </div>
          </section>

          {/* Neural feed */}
          <section aria-label="Neural feed — Psychographic Manifold Synthesis">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-300/90">
                Neural Feed
              </h2>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                {feedPhase === "ambient"
                  ? "Ambient channel"
                  : feedPhase === "extraction"
                    ? "Real-time extraction"
                    : "L3 channel"}
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-indigo-500/25 bg-black shadow-[0_0_0_1px_rgba(79,70,229,0.12),0_24px_64px_-24px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-2 border-b border-indigo-500/20 bg-zinc-950/80 px-4 py-2.5">
                <span className="size-2 rounded-full bg-red-500/90" />
                <span className="size-2 rounded-full bg-amber-500/90" />
                <span className="size-2 rounded-full bg-emerald-500/90" />
                <span className="ml-2 font-mono text-[10px] text-zinc-500">l3_engine — zsh — 80×24</span>
              </div>
              <div
                ref={feedRef}
                className="relative h-[min(320px,42vh)] overflow-y-auto overscroll-contain bg-black px-4 py-3 font-mono text-[11px] leading-relaxed text-emerald-400/95 sm:text-xs"
              >
                <div
                  className={
                    missionReveal ? "pointer-events-none select-none opacity-[0.12] blur-[0.8px]" : ""
                  }
                  aria-hidden={missionReveal}
                >
                  {feedLines.map((line, i) => (
                    <div
                      key={`feed-${i}-${line.length}-${line.slice(-24)}`}
                      className="whitespace-pre-wrap break-all"
                    >
                      <span className="text-emerald-600/80">➜</span> {line}
                    </div>
                  ))}
                </div>
                {missionReveal ? (
                  <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/92 px-4 text-center backdrop-blur-[2px]"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="lf-l3-mission-title max-w-[95%] font-mono text-base font-bold uppercase leading-snug tracking-[0.12em] text-emerald-400 sm:text-lg md:text-xl">
                      L3 ANALYSIS COMPLETE // 100% DEPTH REACHED
                    </p>
                    <p className="mt-5 max-w-md text-sm font-medium leading-relaxed text-white sm:text-base">
                      High-Ticket Hooks Synthesized. Ready for Outreach.
                    </p>
                    <div
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(16,185,129,0.08),transparent_65%)]"
                      aria-hidden
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        {/* Table */}
        <section className="mt-12" aria-labelledby="leads-table-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="leads-table-heading" className="text-base font-semibold text-white">
                L3 pipeline
              </h2>
              <p className="mt-1 text-sm text-zinc-500">Psychographic scoring &amp; status</p>
            </div>
            <span
              className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                tableSource === "csv"
                  ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300/90"
                  : "border-zinc-600/40 bg-zinc-900/60 text-zinc-500"
              }`}
            >
              {tableSource === "csv" ? "Loaded" : "Awaiting import"}
            </span>
          </div>

          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-700/55 bg-zinc-950/35 px-5 py-10 text-center text-sm leading-relaxed text-zinc-500">
              L3 pipeline stays hidden until a Prospeo <span className="text-zinc-400">.csv</span>{" "}
              parses successfully and neural extraction begins — then rows populate below.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-black/60 shadow-[0_0_0_1px_rgba(99,102,241,0.08)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-indigo-500/15 bg-zinc-950/90">
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Lead Name
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Company
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Psychographic Score
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        L3 Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/10">
                    {rows.map((row, rowIndex) => (
                      <tr
                        key={`${pipelineGeneration}-${row.id}`}
                        role="button"
                        tabIndex={0}
                        className={`${rowHoverClass} lf-l3-pipeline-row`}
                        style={{ animationDelay: `${rowIndex * 72}ms` }}
                        title={
                          [row.email, row.linkedinUrl].filter(Boolean).join(" · ") || undefined
                        }
                        onClick={() => setDossierLead(row)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setDossierLead(row);
                          }
                        }}
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-100">{row.name}</td>
                        <td className="max-w-[200px] truncate px-5 py-4 text-zinc-400" title={row.company}>
                          {row.company}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 tabular-nums">
                          {row.score === "—" ? (
                            <span className="text-zinc-600">—</span>
                          ) : (
                            <>
                              <span className="text-violet-300/95">{row.score}</span>
                              <span className="text-zinc-600"> /100</span>
                            </>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                              row.status === "L3 Complete"
                                ? "border-emerald-500/35 bg-emerald-500/[0.08] text-emerald-300/95"
                                : row.status === "Scoring" || row.status === "Scanning…"
                                  ? "border-violet-500/35 bg-violet-500/[0.08] text-violet-200/90"
                                  : "border-zinc-600/50 bg-zinc-900/80 text-zinc-400"
                            }`}
                          >
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

      {/* Lead dossier — indigo/black modal */}
      {dossierLead ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dossier-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-[3px] transition-opacity"
            aria-label="Close dossier"
            onClick={() => setDossierLead(null)}
          />
          <div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-500/35 bg-zinc-950 shadow-[0_0_0_1px_rgba(79,70,229,0.15),0_32px_80px_-20px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(99,102,241,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-950/50 to-black/80 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-indigo-400/90">
                    Classified dossier
                  </p>
                  <h3 id="dossier-title" className="mt-1 text-lg font-semibold tracking-tight text-white">
                    {dossierLead.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-zinc-500">{dossierLead.company}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-700/80 bg-zinc-900/80 p-2 text-zinc-400 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
                  onClick={() => setDossierLead(null)}
                  aria-label="Close"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-violet-400/90">
                  Research summary
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {researchSummaryPlaceholder(dossierLead.company)}
                </p>
              </div>

              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-violet-400/90">
                  Generated outreach hook
                </p>
                <div className="mt-2 rounded-xl border border-indigo-500/20 bg-black/50 p-4 font-mono text-[13px] leading-relaxed text-zinc-200 shadow-inner shadow-black/40">
                  <p className="text-[0.6rem] font-sans uppercase tracking-wider text-zinc-600">Primary channel · draft</p>
                  <p className="mt-2 whitespace-pre-wrap text-zinc-100/95">
                    {outreachHookDraft(dossierLead)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-indigo-500/15 bg-black/40 px-5 py-3">
              <p className="text-center text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                L3 psychographic · {dossierLead.score === "—" ? "Pending" : `${dossierLead.score}/100`} ·{" "}
                {dossierLead.status}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
