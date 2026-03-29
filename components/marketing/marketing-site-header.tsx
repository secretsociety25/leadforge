import Link from "next/link";

type Highlight = "pricing" | "partners";

type Props = {
  /** Highlights the current marketing section in the nav */
  highlight?: Highlight;
};

export function MarketingSiteHeader({ highlight }: Props) {
  const nav = (key: Highlight, label: string, href: string) => (
    <Link
      href={href}
      prefetch={false}
      className={
        highlight === key ? "lf-marketing-nav lf-marketing-nav-emphasis" : "lf-marketing-nav"
      }
    >
      {label}
    </Link>
  );

  return (
    <header className="relative z-50 mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <Link
        href="/"
        className="text-sm font-semibold tracking-tight text-zinc-100 transition hover:text-white"
      >
        LeadForge <span className="font-normal text-zinc-500">by MTDFIX</span>
      </Link>
      <nav
        className="relative z-50 flex flex-wrap items-center gap-2 text-sm sm:justify-end sm:gap-2"
        aria-label="Primary"
      >
        {nav("pricing", "Pricing", "/pricing")}
        {nav("partners", "Partners", "/partners")}
        <a href="/login" className="lf-marketing-nav">
          Sign in
        </a>
        <Link href="/dashboard" prefetch={false} className="lf-marketing-nav lf-marketing-nav-emphasis">
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
