import type { Metadata } from "next";
import Link from "next/link";

import { PricingPlans } from "@/app/pricing/pricing-plans";
import { LogoutButton } from "@/components/logout-button";
import { ANNUAL_MONTHS_CHARGED } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Starter, Pro, and Enterprise plans for B2B lead generation.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — LeadForge by MTDFIX",
    description: "Starter, Pro, and Enterprise plans for B2B lead generation.",
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
            Plans
          </p>
          <h1 style={{ fontSize: "2.25rem", margin: "0 0 0.75rem", fontWeight: 650 }}>
            Simple tiers. Serious pipeline.
          </h1>
          <p
            style={{
              margin: 0,
              color: "rgba(250,250,250,0.55)",
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#fafafa" }}>Starter $49</strong>,{" "}
            <strong style={{ color: "#fafafa" }}>Pro $99</strong>,{" "}
            <strong style={{ color: "#fafafa" }}>Enterprise $249</strong> / month USD list.
            Pay in <strong style={{ color: "#fafafa" }}>AED</strong>,{" "}
            <strong style={{ color: "#fafafa" }}>GBP</strong>, or{" "}
            <strong style={{ color: "#fafafa" }}>EUR</strong>. Annual = {ANNUAL_MONTHS_CHARGED}{" "}
            months billed. Checkout via Ziina.
          </p>
        </header>

        <PricingPlans checkout={checkout} />
      </div>
    </main>
  );
}
