import type { Metadata } from "next";
import Link from "next/link";

import { PricingPlans } from "@/app/pricing/pricing-plans";
import { LogoutButton } from "@/components/logout-button";
import { ANNUAL_MONTHS_CHARGED, GBP_MONTHLY_MAJOR } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Replace manual research with LeadForge Sovereign Intelligence — recovered labour, executive briefing dossiers, and managed ghost-node infrastructure.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — LeadForge by MTDFIX",
    description:
      "Recovered labour, synthetic SDR throughput, and sovereign-grade intelligence: Starter, Pro, and Sovereign.",
    url: "/pricing",
  },
};

const isZiinaTestMode = process.env.NODE_ENV === "development";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.checkout;
  const checkout =
    raw === "success" || raw === "cancel" || raw === "failed" ? raw : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background:
          "radial-gradient(120% 85% at 50% -18%, rgba(99, 102, 241, 0.22), transparent 58%), radial-gradient(95% 65% at 100% 0%, rgba(139, 92, 246, 0.14), transparent 52%), #000000",
        color: "#fafafa",
        padding: "2rem 1.25rem 3rem",
      }}
    >
      {isZiinaTestMode ? (
        <div
          role="status"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            margin: "-2rem -1.25rem 0",
            marginBottom: 0,
            padding: "0.55rem 1rem",
            textAlign: "center",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#0f172a",
            background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
            borderBottom: "1px solid rgba(180, 83, 9, 0.5)",
            boxShadow: "0 4px 24px rgba(245, 158, 11, 0.15)",
          }}
        >
          Test mode — Ziina sandbox only; no live charges
        </div>
      ) : null}

      <div style={{ maxWidth: 1040, margin: "0 auto", paddingTop: isZiinaTestMode ? "1rem" : 0 }}>
        <nav
          style={{
            marginBottom: "2rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <Link
            href="/"
            style={{ color: "rgba(250,250,250,0.65)", fontSize: "0.9rem" }}
          >
            ← Home
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {user?.email ? (
              <>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(250,250,250,0.45)",
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={user.email}
                >
                  {user.email}
                </span>
                <Link
                  href="/dashboard"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#a78bfa",
                  }}
                >
                  Dashboard
                </Link>
                <LogoutButton className="mt-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10" />
              </>
            ) : (
              <a
                href="/login?next=/pricing"
                style={{ fontSize: "0.85rem", fontWeight: 600, color: "#a78bfa" }}
              >
                Sign in
              </a>
            )}
          </div>
        </nav>

        <header style={{ textAlign: "center", marginBottom: "2rem" }}>
          {isZiinaTestMode ? (
            <p
              style={{
                margin: "0 auto 1.25rem",
                maxWidth: 560,
                padding: "0.85rem 1.1rem",
                borderRadius: 12,
                border: "1px solid rgba(234, 179, 8, 0.4)",
                background:
                  "linear-gradient(145deg, rgba(234, 179, 8, 0.14), rgba(120, 80, 20, 0.2))",
                color: "#fde68a",
                fontSize: "0.88rem",
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: "#fef08a", fontSize: "0.82rem", letterSpacing: "0.04em" }}>
                Test mode checkout
              </strong>
              <span style={{ display: "block", marginTop: "0.4rem", color: "#fde68a" }}>
                This app sends <code style={{ color: "#fef9c3" }}>test: true</code> to Ziina in
                development. Use sandbox cards only; switch to live keys and{" "}
                <code style={{ color: "#fef9c3" }}>test: false</code> for production.
              </span>
            </p>
          ) : null}
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(250,250,250,0.4)",
              margin: "0 0 0.75rem",
            }}
          >
            Pricing
          </p>
          <h1
            style={{
              fontSize: "2.35rem",
              margin: "0 0 0.85rem",
              fontWeight: 750,
              letterSpacing: "-0.02em",
              lineHeight: 1.12,
            }}
          >
            Replace your first 30 hours of manual research every week with{" "}
            <span style={{ color: "#c7d2fe", textShadow: "0 0 40px rgba(99, 102, 241, 0.35)" }}>
              LeadForge Sovereign Intelligence
            </span>
            .
          </h1>
          <p
            style={{
              margin: "0 0 1rem",
              color: "rgba(250,250,250,0.62)",
              maxWidth: 720,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.65,
              fontSize: "1.05rem",
            }}
          >
            LeadForge is a <strong style={{ color: "#f4f4f5" }}>Synthetic SDR</strong>: it recovers
            labour by automating research, mapping signals, and producing{" "}
            <strong style={{ color: "#f4f4f5" }}>Executive Briefing Dossiers</strong> at scale — so
            your team spends time on conversations, not tab-switching.
          </p>
          <p
            style={{
              margin: "0 0 1.25rem",
              padding: "0.65rem 1rem",
              borderRadius: 999,
              display: "inline-block",
              background: "rgba(124, 58, 237, 0.18)",
              border: "1px solid rgba(167, 139, 250, 0.35)",
              color: "#e9d5ff",
              fontSize: "0.82rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            Best value: Pro · The Synthetic SDR — recover £2k+ / month in labour cost
          </p>
          <p
            style={{
              margin: "-0.75rem auto 1.25rem",
              maxWidth: 720,
              fontSize: "0.78rem",
              lineHeight: 1.5,
              color: "rgba(250,250,250,0.5)",
            }}
          >
            Calculation: 45m research time saved per lead @ £22/hr avg UK SDR rate.
          </p>
          <p
            style={{
              margin: 0,
              color: "rgba(250,250,250,0.5)",
              maxWidth: 600,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
              fontSize: "0.9rem",
            }}
          >
            <strong style={{ color: "#fafafa" }}>
              £{GBP_MONTHLY_MAJOR.starter.toLocaleString("en-GB")}
            </strong>{" "}
            ·{" "}
            <strong style={{ color: "#fafafa" }}>
              £{GBP_MONTHLY_MAJOR.pro.toLocaleString("en-GB")}
            </strong>{" "}
            ·{" "}
            <strong style={{ color: "#fafafa" }}>
              £{GBP_MONTHLY_MAJOR.enterprise.toLocaleString("en-GB")}+
            </strong>{" "}
            / mo. list (GBP). Annual = {ANNUAL_MONTHS_CHARGED} months charged (two on us). Checkout is
            in <strong style={{ color: "#fafafa" }}>GBP (£)</strong> (Ziina). Enterprise opens via
            private briefing.
          </p>
        </header>

        <section
          aria-label="Recovered labour anchor comparison"
          style={{
            margin: "0 auto 2.25rem",
            maxWidth: 980,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.15rem",
          }}
        >
          <div
            style={{
              borderRadius: 18,
              padding: "1.35rem 1.25rem",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(250,250,250,0.45)",
              }}
            >
              Anchor comparison
            </p>
            <h2 style={{ margin: "0.55rem 0 0.75rem", fontSize: "1.05rem", fontWeight: 750 }}>
              Junior UK SDR
              <span style={{ color: "rgba(250,250,250,0.55)", fontWeight: 650 }}> — £3,500/mo</span>
            </h2>
            <ul style={{ margin: 0, paddingLeft: "1.05rem", color: "rgba(250,250,250,0.78)", lineHeight: 1.6 }}>
              <li>Salary + NI + benefits</li>
              <li>Tools sprawl (Apollo, LinkedIn, enrichment) + seat costs</li>
              <li>Management overhead + ramp time + quality variance</li>
              <li>
                Output: manual research for ~<strong style={{ color: "#fafafa" }}>100</strong> leads/week
              </li>
              <li>
                Churn risk: <strong style={{ color: "#fca5a5" }}>High</strong>
              </li>
            </ul>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: "1.35rem 1.25rem",
              border: "1px solid rgba(165, 180, 252, 0.45)",
              background:
                "linear-gradient(165deg, rgba(67, 56, 202, 0.28) 0%, rgba(79, 70, 229, 0.12) 38%, rgba(9,9,11,0.5) 100%)",
              boxShadow: [
                "0 0 0 1px rgba(129, 140, 248, 0.25)",
                "inset 0 1px 0 0 rgba(199, 210, 254, 0.14)",
                "0 0 56px -6px rgba(99, 102, 241, 0.55)",
              ].join(", "),
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(199, 210, 254, 0.92)",
              }}
            >
              LeadForge Pro
            </p>
            <h2 style={{ margin: "0.55rem 0 0.75rem", fontSize: "1.05rem", fontWeight: 750 }}>
              The Synthetic SDR
              <span style={{ color: "rgba(250,250,250,0.55)", fontWeight: 650 }}> — £1,250/mo</span>
            </h2>
            <ul style={{ margin: 0, paddingLeft: "1.05rem", color: "rgba(250,250,250,0.86)", lineHeight: 1.6 }}>
              <li>Flat Monthly Fee (No NI/HR)</li>
              <li>Unified Signal &amp; Infra Stack</li>
              <li>Immediate Deployment (Zero Ramp)</li>
              <li>
                <strong style={{ color: "#fafafa" }}>3,500</strong> Exec Briefings / Month
              </li>
              <li>
                Stability Score: <strong style={{ color: "#bbf7d0" }}>100%</strong> (No Churn)
              </li>
            </ul>
            <p
              style={{
                margin: "0.85rem 0 0",
                fontSize: "0.78rem",
                lineHeight: 1.5,
                color: "rgba(250,250,250,0.55)",
              }}
            >
              Calculation: 45m research time saved per lead @ £22/hr avg UK SDR rate.
            </p>
          </div>
        </section>

        <PricingPlans checkout={checkout} />
      </div>
    </main>
  );
}
