import type { Metadata } from "next";
import Link from "next/link";

import { PricingPlans } from "@/app/pricing/pricing-plans";
import { LogoutButton } from "@/components/logout-button";
import { AED_MONTHLY_MAJOR, ANNUAL_MONTHS_CHARGED } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "LeadForge tiers from The Intercept to The Sovereign — High-Value Signals, L3 depth, and enterprise-grade intelligence.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — LeadForge by MTDFIX",
    description:
      "Sovereign-grade outbound intelligence: Starter, Pro, and Enterprise. Retainers that match the work.",
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
          "radial-gradient(100% 70% at 50% -20%, rgba(120, 80, 200, 0.2), transparent 50%), #09090b",
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
          <h1 style={{ fontSize: "2.35rem", margin: "0 0 0.85rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Intelligence retainers for serious outbound
          </h1>
          <p
            style={{
              margin: "0 0 1rem",
              color: "rgba(250,250,250,0.62)",
              maxWidth: 620,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.65,
              fontSize: "1.05rem",
            }}
          >
            <strong style={{ color: "#f4f4f5" }}>The Sovereign Guru stack</strong> — map High-Value
            Signals, run depth where it matters, and keep the “how” behind the curtain. Pricing
            matches the leverage, not the busywork.
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
            Pro · The Infiltrator — Priority L3 queue when the runway gets crowded
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
              {AED_MONTHLY_MAJOR.starter.toLocaleString("en-US")} AED
            </strong>{" "}
            ·{" "}
            <strong style={{ color: "#fafafa" }}>
              {AED_MONTHLY_MAJOR.pro.toLocaleString("en-US")} AED
            </strong>{" "}
            ·{" "}
            <strong style={{ color: "#fafafa" }}>12,000+ AED</strong> / month list (UAE) · USD list
            approximates for GBP/EUR. Annual = {ANNUAL_MONTHS_CHARGED} months charged (two on us). Pay
            in <strong style={{ color: "#fafafa" }}>AED</strong>,{" "}
            <strong style={{ color: "#fafafa" }}>GBP</strong>, or{" "}
            <strong style={{ color: "#fafafa" }}>EUR</strong> at checkout (Ziina). Enterprise opens
            via inquiry.
          </p>
        </header>

        <PricingPlans checkout={checkout} />
      </div>
    </main>
  );
}
