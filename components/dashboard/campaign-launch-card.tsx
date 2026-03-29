"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { createCampaignAction, runCampaignAction } from "@/app/actions/campaigns";
import { toCampaignSearchJson } from "@/lib/campaign-search-parms";

export function CampaignLaunchCard({
  atCampaignLimit,
}: {
  atCampaignLimit: boolean;
}) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onGenerate = useCallback(async () => {
    setError(null);
    setSuccess(null);
    if (atCampaignLimit) {
      setError("Campaign limit reached for your tier. Upgrade under Billing.");
      return;
    }
    if (!jobTitle.trim() || !industry.trim() || !location.trim()) {
      setError("Enter target job title, industry, and location.");
      return;
    }
    setLoading(true);
    try {
      const created = await createCampaignAction({
        searchParms: toCampaignSearchJson({
          targetJobTitle: jobTitle,
          industry,
          location,
        }),
        status: "draft",
      });
      if (!created.ok) {
        setError(created.error);
        return;
      }
      const run = await runCampaignAction(created.data.id);
      if (!run.ok) {
        setError(run.error);
        return;
      }
      setSuccess("Campaign saved and generation queued.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [atCampaignLimit, industry, jobTitle, location, router]);

  return (
    <section
      id="campaigns"
      className="scroll-mt-28 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-zinc-900/95 via-zinc-950 to-zinc-950 p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.08),0_24px_64px_-32px_rgba(0,0,0,0.85)] sm:p-8"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300/90">
            New campaign
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Launch your next list</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Define who you want to reach. We&apos;ll create the campaign and queue lead generation —
            full automation hooks in next.
          </p>
        </div>
        <div className="hidden rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-violet-200 sm:block">
          <Sparkles className="size-8" aria-hidden />
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Target job title
          </span>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. VP of Sales"
            autoComplete="off"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none ring-2 ring-transparent transition focus:border-violet-500/50 focus:ring-violet-500/20"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Industry
          </span>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. B2B SaaS"
            autoComplete="off"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none ring-2 ring-transparent transition focus:border-violet-500/50 focus:ring-violet-500/20"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Location
          </span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. UAE · Remote UK"
            autoComplete="off"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none ring-2 ring-transparent transition focus:border-violet-500/50 focus:ring-violet-500/20"
          />
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="mt-5 text-sm font-medium text-emerald-400">
          {success}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void onGenerate()}
          disabled={loading || atCampaignLimit}
          className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
          {loading ? "Working…" : "Generate leads"}
        </button>
        {atCampaignLimit ? (
          <span className="text-sm text-amber-200/90">Upgrade on Billing to add more campaigns.</span>
        ) : (
          <span className="text-sm text-zinc-500">Creates a draft campaign and queues a generation run.</span>
        )}
      </div>
    </section>
  );
}
