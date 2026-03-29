import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function MarketingNav({
  signedIn,
}: {
  signedIn: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-white transition hover:text-violet-200"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-black text-white shadow-lg shadow-violet-900/40">
            L
          </span>
          LeadForge
        </Link>
        <nav
          className="flex items-center gap-1 sm:gap-2"
          aria-label="Marketing"
        >
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Login
          </Link>
          {signedIn ? (
            <Link
              href="/dashboard"
              className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500"
            >
              Dashboard
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500"
            >
              Get started
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
