"use client";

import { ChevronLeft, ChevronRight, Globe, Loader2, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { TrustBadge, type TrustTier } from "@/components/dashboard/trust-badge";

export type MarketMappingPerson = {
  id: string;
  personName: string;
  title: string | null;
  email: string | null;
  linkedinUrl: string | null;
  city: string | null;
  country: string | null;
  organizationId: string | null;
  organizationName: string | null;
  organizationDomain: string | null;
  organizationWebsite: string | null;
  industryLabel: string | null;
  estimatedEmployees: number | null;
};

type VerifyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; tier: TrustTier; directorName: string | null; hint?: string }
  | { status: "error"; message: string };

const rowHoverClass =
  "transition-[background-color,box-shadow] duration-200 hover:bg-indigo-500/[0.08] hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.22),0_0_24px_-8px_rgba(79,70,229,0.35)]";

const inputClass =
  "rounded-lg border border-indigo-500/25 bg-black/50 px-3 py-2 text-xs text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none placeholder:text-zinc-600 focus:border-violet-500/45";

const EMPLOYEE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Any", value: "" },
  { label: "1–10", value: "1,10" },
  { label: "11–50", value: "11,50" },
  { label: "51–200", value: "51,200" },
  { label: "201–500", value: "201,500" },
  { label: "501–1,000", value: "501,1000" },
  { label: "1,001–5,000", value: "1001,5000" },
  { label: "5,001–10,000", value: "5001,10000" },
  { label: "10,001+", value: "10001,1000000" },
];

function rowKey(p: MarketMappingPerson, index: number): string {
  return p.id ? p.id : `idx-${index}`;
}

export function MarketMappingClient() {
  const [qOrgName, setQOrgName] = useState("");
  const [industryTagIds, setIndustryTagIds] = useState("");
  const [employeeRange, setEmployeeRange] = useState("");
  const [location, setLocation] = useState("United Kingdom");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const [people, setPeople] = useState<MarketMappingPerson[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const [companyNoByRow, setCompanyNoByRow] = useState<Record<string, string>>({});
  const [verifyByRow, setVerifyByRow] = useState<Record<string, VerifyState>>({});

  const filtersPayload = useMemo(() => {
    const organization_industry_tag_ids = industryTagIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const organization_num_employees_ranges = employeeRange ? [employeeRange] : [];
    const person_locations = location.trim() ? [location.trim()] : [];
    return {
      q_organization_name: qOrgName.trim(),
      organization_industry_tag_ids,
      organization_num_employees_ranges,
      person_locations,
    };
  }, [qOrgName, industryTagIds, employeeRange, location]);

  const runSearch = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setError(null);
      setHint(null);
      try {
        const res = await fetch("/api/discovery/market-mapping", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...filtersPayload,
            page: nextPage,
            per_page: perPage,
          }),
        });
        const raw = await res.text();
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          setError("Invalid response from market-mapping API.");
          setPeople([]);
          return;
        }
        const d = parsed as {
          ok?: boolean;
          error?: string;
          people?: MarketMappingPerson[];
          pagination?: { page?: number; total_entries?: number; total_pages?: number };
          hint?: string;
        };
        if (!res.ok || !d.ok) {
          setError(d.error ?? `Request failed (${res.status})`);
          setPeople([]);
          return;
        }
        setPeople(d.people ?? []);
        const pag = d.pagination ?? {};
        setPage(pag.page ?? nextPage);
        setTotalEntries(pag.total_entries ?? (d.people?.length ?? 0));
        setTotalPages(Math.max(1, pag.total_pages ?? 1));
        if (d.hint) setHint(d.hint);
      } catch {
        setError("Network error while calling market mapping.");
        setPeople([]);
      } finally {
        setLoading(false);
      }
    },
    [filtersPayload, perPage],
  );

  const onSearch = useCallback(() => {
    setVerifyByRow({});
    void runSearch(1);
  }, [runSearch]);

  const goPrev = useCallback(() => {
    if (page <= 1) return;
    void runSearch(page - 1);
  }, [page, runSearch]);

  const goNext = useCallback(() => {
    if (page >= totalPages) return;
    void runSearch(page + 1);
  }, [page, totalPages, runSearch]);

  const verifyRegistry = useCallback(
    async (key: string, personName: string) => {
      const companyNumber = (companyNoByRow[key] ?? "").trim().toUpperCase();
      if (!companyNumber) {
        setVerifyByRow((prev) => ({
          ...prev,
          [key]: { status: "error", message: "Enter a Companies House number first." },
        }));
        return;
      }
      setVerifyByRow((prev) => ({ ...prev, [key]: { status: "loading" } }));
      try {
        const qs = new URLSearchParams({
          company_number: companyNumber,
          apollo_name: personName,
        });
        const res = await fetch(`/api/officers?${qs}`, {
          headers: { Accept: "application/json" },
        });
        const raw = await res.text();
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          setVerifyByRow((prev) => ({
            ...prev,
            [key]: { status: "error", message: "Invalid JSON from /api/officers" },
          }));
          return;
        }
        const d = parsed as {
          ok?: boolean;
          match?: TrustTier;
          directorName?: string | null;
          hint?: string;
          error?: string;
        };
        if (!res.ok || !d.ok) {
          setVerifyByRow((prev) => ({
            ...prev,
            [key]: { status: "error", message: d.error ?? `HTTP ${res.status}` },
          }));
          return;
        }
        const tier = d.match ?? "unverified";
        setVerifyByRow((prev) => ({
          ...prev,
          [key]: {
            status: "done",
            tier,
            directorName: d.directorName ?? null,
            hint: d.hint,
          },
        }));
      } catch {
        setVerifyByRow((prev) => ({
          ...prev,
          [key]: { status: "error", message: "Network error" },
        }));
      }
    },
    [companyNoByRow],
  );

  return (
    <div className="relative min-h-screen min-w-0 bg-transparent text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(99 102 241 / 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(99 102 241 / 0.4) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="border-b border-indigo-500/25 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/35 bg-indigo-500/[0.08] shadow-[0_0_32px_-8px_rgba(99,102,241,0.55)]">
                <Globe className="size-5 text-violet-300" aria-hidden />
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-indigo-300/80">
                  Market Mapping
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  High-volume lead surface
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  Apollo <span className="text-violet-300/95">mixed people</span> search — paginate
                  through thousands of established contacts, then run{" "}
                  <span className="text-indigo-300/95">Sovereign Verified</span> registry checks
                  against Companies House officers.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.07] px-3 py-1.5 text-xs font-medium text-violet-200/95">
              <Sparkles className="size-3.5" aria-hidden />
              Sovereign Verified
            </div>
          </div>
        </header>

        <section className="mt-10" aria-labelledby="mm-params-heading">
          <h2 id="mm-params-heading" className="sr-only">
            Filters
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
            <label className="flex flex-col gap-2 lg:col-span-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/85">
                Organization name
              </span>
              <input
                value={qOrgName}
                onChange={(e) => setQOrgName(e.target.value)}
                placeholder="e.g. Acme Logistics Ltd"
                className="rounded-xl border border-indigo-500/25 bg-black/50 px-4 py-3 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none placeholder:text-zinc-600 focus:border-violet-500/45 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_28px_-10px_rgba(99,102,241,0.55)]"
              />
            </label>
            <label className="flex flex-col gap-2 lg:col-span-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/85">
                Industry (Apollo tag IDs)
              </span>
              <input
                value={industryTagIds}
                onChange={(e) => setIndustryTagIds(e.target.value)}
                placeholder="Comma-separated ObjectIds from Apollo"
                className="rounded-xl border border-indigo-500/25 bg-black/50 px-4 py-3 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none placeholder:text-zinc-600 focus:border-violet-500/45 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_28px_-10px_rgba(99,102,241,0.55)]"
              />
            </label>
            <label className="flex flex-col gap-2 lg:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/85">
                Employee count
              </span>
              <select
                value={employeeRange}
                onChange={(e) => setEmployeeRange(e.target.value)}
                className="rounded-xl border border-indigo-500/25 bg-black/50 px-4 py-3 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none focus:border-violet-500/45 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_28px_-10px_rgba(99,102,241,0.55)]"
              >
                {EMPLOYEE_OPTIONS.map((o) => (
                  <option key={o.label} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 lg:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/85">
                Location
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="United Kingdom"
                className="rounded-xl border border-indigo-500/25 bg-black/50 px-4 py-3 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none placeholder:text-zinc-600 focus:border-violet-500/45 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_28px_-10px_rgba(99,102,241,0.55)]"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={onSearch}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-violet-400/35 bg-gradient-to-br from-violet-600 via-indigo-700 to-indigo-950 px-8 text-sm font-semibold tracking-wide text-white shadow-[0_10px_52px_-14px_rgba(99,102,241,0.75),inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Searching…
                </>
              ) : (
                "Run market map"
              )}
            </button>
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="whitespace-nowrap">Per page</span>
              <select
                value={perPage}
                disabled={loading}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-lg border border-indigo-500/30 bg-black/60 px-2 py-1.5 text-zinc-200"
              >
                {[25, 50, 75, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {error ? (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        {hint ? (
          <p className="mt-4 text-sm text-amber-200/90" role="status">
            {hint}
          </p>
        ) : null}

        <section className="mt-12" aria-labelledby="mm-results-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="mm-results-heading" className="text-lg font-semibold text-white">
                Mapped leads
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {totalEntries > 0 ? (
                  <>
                    Showing page {page} of {totalPages} ·{" "}
                    <span className="font-mono text-zinc-400">{totalEntries}</span> total entries
                  </>
                ) : (
                  "Run a search to load Apollo results."
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={goPrev}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/35 bg-black/50 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-violet-500/45 disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Prev
              </button>
              <button
                type="button"
                disabled={loading || page >= totalPages}
                onClick={goNext}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/35 bg-black/50 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-violet-500/45 disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          <div
            className="max-h-[min(70vh,720px)] overflow-auto rounded-2xl border border-indigo-500/35 bg-black/50 shadow-[0_0_0_1px_rgba(79,70,229,0.12),inset_0_1px_0_rgba(255,255,255,0.04)] [scrollbar-color:rgba(99,102,241,0.45)_rgba(0,0,0,0.3)] [scrollbar-width:thin]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <table className="min-w-[920px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-indigo-500/30 bg-zinc-950/95 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">
                    Person
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">
                    Title
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">
                    Domain
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">
                    CH No.
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">
                    Verify
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">
                    Registry
                  </th>
                </tr>
              </thead>
              <tbody>
                {people.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                      No rows yet. Adjust filters and run a market map.
                    </td>
                  </tr>
                ) : null}
                {loading && people.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                      <Loader2 className="mx-auto size-6 animate-spin text-violet-400" aria-hidden />
                    </td>
                  </tr>
                ) : null}
                {people.map((p, index) => {
                  const key = rowKey(p, index);
                  const v = verifyByRow[key] ?? { status: "idle" as const };
                  const loc = [p.city, p.country].filter(Boolean).join(", ") || "—";
                  return (
                    <tr key={key} className={`border-b border-indigo-500/15 ${rowHoverClass}`}>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-zinc-100">{p.personName}</div>
                        {p.email ? (
                          <div className="mt-0.5 text-xs text-zinc-500">{p.email}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top text-zinc-300">{p.title ?? "—"}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-zinc-200">{p.organizationName ?? "—"}</div>
                        <div className="mt-0.5 text-xs text-zinc-500">{loc}</div>
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-xs text-violet-200/90">
                        {p.organizationDomain ?? p.organizationWebsite ?? "—"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          className={`w-[7.5rem] ${inputClass}`}
                          placeholder="e.g. 12832345"
                          aria-label="Companies House company number"
                          value={companyNoByRow[key] ?? ""}
                          onChange={(e) =>
                            setCompanyNoByRow((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          disabled={v.status === "loading"}
                          onClick={() => void verifyRegistry(key, p.personName)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-200 transition hover:border-violet-400/55 hover:bg-indigo-900/60 disabled:opacity-50"
                        >
                          {v.status === "loading" ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                          ) : null}
                          Verify via Registry
                        </button>
                        {v.status === "error" ? (
                          <p className="mt-1 text-[10px] text-red-400/95">{v.message}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {v.status === "done" ? (
                          <div className="space-y-1">
                            <TrustBadge tier={v.tier} />
                            {v.directorName ? (
                              <p className="text-[10px] text-zinc-500">
                                CH: {v.directorName}
                              </p>
                            ) : null}
                            {v.hint ? (
                              <p className="text-[10px] text-amber-200/80">{v.hint}</p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
