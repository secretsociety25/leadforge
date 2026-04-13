import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const linkClass =
  "text-zinc-400 transition hover:text-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500/50";

export async function SiteFooter() {
  let signedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  } catch {
    // Missing env during build or local tooling — show footer without Dashboard link
  }

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="shrink-0">
            <p className="text-sm font-semibold tracking-tight text-zinc-100">LeadForge</p>
            <p className="mt-0.5 text-xs text-zinc-500">by MTDFIX</p>
          </div>
          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:justify-end"
            aria-label="Footer"
          >
            <Link href="/" prefetch={false} className={linkClass}>
              Home
            </Link>
            <Link href="/pricing" prefetch={false} className={linkClass}>
              Pricing
            </Link>
            <Link href="/partners" prefetch={false} className={linkClass}>
              Partners
            </Link>
            <Link href="/compliance-security" prefetch={false} className={linkClass}>
              Compliance &amp; Security
            </Link>
            {signedIn ? (
              <Link href="/dashboard" prefetch={false} className={linkClass}>
                Dashboard
              </Link>
            ) : null}
          </nav>
        </div>
        <p className="mt-8 border-t border-zinc-800/60 pt-8 text-center text-xs text-zinc-600 sm:text-left">
          © {year} MTDFIX Services Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
