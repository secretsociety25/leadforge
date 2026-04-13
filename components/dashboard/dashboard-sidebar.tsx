"use client";

import {
  CreditCard,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Megaphone,
  Radar,
  Server,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";

function tierLabel(tier: string) {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

const navClass = (active: boolean) =>
  [
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
    active
      ? "border border-violet-500/45 bg-violet-500/[0.14] text-white shadow-[0_0_28px_-6px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]"
      : "border border-transparent text-zinc-400 hover:border-indigo-500/20 hover:bg-indigo-500/[0.06] hover:text-zinc-100",
  ].join(" ");

export function DashboardSidebar({
  email,
  signedIn,
  tier,
}: {
  email: string | null;
  signedIn: boolean;
  tier: string;
}) {
  const pathname = usePathname();
  const onDashboard = pathname === "/dashboard";
  const onSignal = pathname === "/dashboard/signal-discovery";
  const onMarketMapping = pathname === "/dashboard/market-mapping";
  const onInfra = pathname === "/dashboard/infrastructure";
  const onUpload = pathname === "/dashboard/upload";
  const onLeads = pathname === "/dashboard/leads";

  return (
    <aside className="z-40 flex w-full flex-col border-b border-indigo-500/20 bg-black/92 px-4 py-5 shadow-[inset_-1px_0_0_rgba(99,102,241,0.12)] backdrop-blur-xl md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r md:border-indigo-500/20 md:py-6">
      <div className="mb-8 px-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-indigo-400/70">
          LeadForge
        </p>
        <p className="mt-1 text-lg font-bold tracking-tight text-white">Intelligence workspace</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-500/35 bg-violet-500/[0.08] px-3 py-1 shadow-[0_0_20px_-8px_rgba(139,92,246,0.45)]">
          <Sparkles className="size-3.5 text-violet-300" aria-hidden />
          <span className="text-xs font-semibold text-violet-100/95">{tierLabel(tier)}</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Main">
        <Link href="/dashboard" className={navClass(onDashboard)} scroll={false}>
          <LayoutDashboard className="size-4 shrink-0 opacity-90" aria-hidden />
          Dashboard
        </Link>
        <Link href="/dashboard/signal-discovery" className={navClass(onSignal)} scroll={false}>
          <Radar className="size-4 shrink-0 opacity-90" aria-hidden />
          Signal Discovery
        </Link>
        <Link href="/dashboard/market-mapping" className={navClass(onMarketMapping)} scroll={false}>
          <Globe className="size-4 shrink-0 opacity-90" aria-hidden />
          Market Mapping
        </Link>
        <Link href="/dashboard/infrastructure" className={navClass(onInfra)} scroll={false}>
          <Server className="size-4 shrink-0 opacity-90" aria-hidden />
          Infrastructure
        </Link>
        <Link href="/dashboard/upload" className={navClass(onUpload)} scroll={false}>
          <Upload className="size-4 shrink-0 opacity-90" aria-hidden />
          Upload
        </Link>
        <Link href="/dashboard/leads" className={navClass(onLeads)} scroll={false}>
          <Users className="size-4 shrink-0 opacity-90" aria-hidden />
          Leads
        </Link>
        <Link href="/dashboard#campaigns" className={navClass(false)} scroll={false}>
          <Megaphone className="size-4 shrink-0 opacity-90" aria-hidden />
          Campaigns
        </Link>
        <Link href="/pricing" className={navClass(pathname === "/pricing")}>
          <CreditCard className="size-4 shrink-0 opacity-90" aria-hidden />
          Billing
        </Link>
      </nav>

      <div className="mt-6 rounded-xl border border-indigo-500/25 bg-indigo-950/[0.15] p-3 shadow-[0_0_32px_-12px_rgba(99,102,241,0.35)]">
        <p className="text-xs font-medium text-zinc-400">Plans & limits</p>
        <Link
          href="/pricing"
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-violet-300 hover:text-violet-200"
        >
          View pricing
          <ExternalLink className="size-3.5 opacity-70" aria-hidden />
        </Link>
      </div>

      <div className="mt-auto border-t border-indigo-500/20 pt-4">
        {signedIn && email ? (
          <>
            <p className="truncate px-1 text-xs text-zinc-500" title={email}>
              {email}
            </p>
            <LogoutButton />
          </>
        ) : (
          <a
            href="/login?next=/dashboard"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
          >
            Sign in
          </a>
        )}
      </div>
    </aside>
  );
}
