"use client";

import { Lock, Plus, Server } from "lucide-react";
import { useState } from "react";

import { useDashboardTier } from "@/components/dashboard/dashboard-tier-context";

type NodeState = "warming" | "active" | "isolated";

type SendingNode = {
  id: string;
  domain: string;
  state: NodeState;
  /** true = healthy / green glow */
  healthy: boolean;
  detail: string;
};

const NODES: SendingNode[] = [
  { id: "1", domain: "outreach.meridian.io", state: "active", healthy: true, detail: "Deliverability nominal" },
  { id: "2", domain: "send.northwind.systems", state: "warming", healthy: true, detail: "Reputation ramp · day 12" },
  { id: "3", domain: "mail.helixlabs.uk", state: "active", healthy: true, detail: "Primary UK corridor" },
  { id: "4", domain: "tx.cobaltfreight.co", state: "isolated", healthy: false, detail: "Quarantine — manual review" },
  { id: "5", domain: "edge.atlas-mfg.com", state: "warming", healthy: true, detail: "Secondary node · EU relay" },
];

function stateLabel(s: NodeState): string {
  if (s === "warming") return "Warming";
  if (s === "active") return "Active";
  return "Isolated";
}

/** Starter (and free) cannot provision managed isolation nodes — Pro+. */
function isProvisionLocked(tier: string): boolean {
  return tier === "starter" || tier === "free";
}

export function InfrastructureClient() {
  const { tier } = useDashboardTier();
  const locked = isProvisionLocked(tier);
  const [toast, setToast] = useState<string | null>(null);

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

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="border-b border-indigo-500/25 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/35 bg-indigo-500/[0.08] shadow-[0_0_32px_-8px_rgba(99,102,241,0.55)]">
                <Server className="size-5 text-violet-300" aria-hidden />
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-indigo-300/80">
                  Infrastructure
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Domain armour — sending nodes
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
                  Isolated outbound identities, reputation state, and routing health — mapped like signal
                  infrastructure, not bulk blasting.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-10" aria-labelledby="nodes-heading">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 id="nodes-heading" className="text-lg font-semibold text-white">
              Node status
            </h2>
            <div className="group relative">
              <button
                type="button"
                disabled={locked}
                title={
                  locked
                    ? "Upgrade to Pro for Managed Domain Isolation."
                    : "Provision a new managed sending node"
                }
                onClick={() => {
                  if (locked) return;
                  setToast("Provisioning queued — your analyst will confirm DNS.");
                  window.setTimeout(() => setToast(null), 3200);
                }}
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                  locked
                    ? "cursor-not-allowed border-zinc-600/50 bg-zinc-900/60 text-zinc-500"
                    : "border-violet-400/35 bg-gradient-to-br from-violet-600/90 to-indigo-900 text-white shadow-[0_6px_28px_-6px_rgba(99,102,241,0.5)] hover:brightness-110"
                }`}
              >
                {locked ? (
                  <Lock className="size-4 shrink-0 text-zinc-500" aria-hidden />
                ) : (
                  <Plus className="size-4 shrink-0" aria-hidden />
                )}
                Provision New Node
              </button>
              {locked ? (
                <p
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-[min(100vw-2rem,18rem)] -translate-x-1/2 rounded-lg border border-violet-500/30 bg-zinc-950/98 px-3 py-2 text-center text-xs text-violet-200/95 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100"
                >
                  Upgrade to Pro for Managed Domain Isolation.
                </p>
              ) : null}
            </div>
          </div>
          {locked ? (
            <p className="mb-6 max-w-lg text-xs text-zinc-500">
              <span className="font-medium text-zinc-400">Starter:</span> hover the lock on Provision
              New Node — upgrade unlocks isolated domains and managed warming.
            </p>
          ) : null}
          {toast ? (
            <p
              className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-2 text-sm text-emerald-200/95"
              role="status"
            >
              {toast}
            </p>
          ) : null}

          <ul className="grid gap-4 sm:grid-cols-2">
            {NODES.map((node) => (
              <li
                key={node.id}
                className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-black/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-medium text-violet-200/95">{node.domain}</p>
                    <p className="mt-1 text-xs text-zinc-500">{node.detail}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`relative flex h-3 w-3 rounded-full ${
                        node.healthy
                          ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]"
                          : "bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.75)]"
                      }`}
                      title={node.healthy ? "Healthy" : "Attention required"}
                    >
                      {node.healthy ? (
                        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
                      ) : null}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        node.state === "active"
                          ? "border-emerald-500/35 bg-emerald-500/[0.12] text-emerald-300/95"
                          : node.state === "warming"
                            ? "border-amber-500/35 bg-amber-500/[0.1] text-amber-200/95"
                            : "border-red-500/35 bg-red-500/[0.1] text-red-300/95"
                      }`}
                    >
                      {stateLabel(node.state)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
