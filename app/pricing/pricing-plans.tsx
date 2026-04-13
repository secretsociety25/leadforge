"use client";

import { useCallback, useState } from "react";

import { createZiinaPaymentAction } from "@/app/actions/billing";
import type { UserTier } from "@/lib/database.types";
import {
  ANNUAL_MONTHS_CHARGED,
  formatTierMoney,
  GBP_MONTHLY_MAJOR,
  PAID_TIER_DISPLAY,
  PAID_TIERS,
  type PaidTier,
} from "@/lib/plans";

const ENTERPRISE_INQUIRY_HREF =
  "mailto:hello@mtdfix.co.uk?subject=LeadForge%20Enterprise%20%E2%80%94%20Request%20Private%20Briefing";

const TIERS = PAID_TIERS;

type CheckoutBanner = "success" | "cancel" | "failed" | null;

type SubscribePhase = "idle" | "creating" | "redirecting";

function normalizeClientError(e: unknown): string {
  if (e instanceof Error) {
    const m = e.message;
    const digest =
      e && typeof e === "object" && "digest" in e && typeof (e as { digest: unknown }).digest === "string"
        ? (e as { digest: string }).digest
        : "";
    if (
      m.includes("NEXT_REDIRECT") ||
      m === "NEXT_REDIRECT" ||
      digest.startsWith("NEXT_REDIRECT")
    ) {
      return "You need to be signed in — we’re sending you to the sign-in page. After signing in, return here and tap Subscribe again.";
    }
    return m || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export function PricingPlans({ checkout }: { checkout: CheckoutBanner }) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<PaidTier | null>(null);
  const [subscribePhase, setSubscribePhase] = useState<SubscribePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [successHint, setSuccessHint] = useState<string | null>(null);

  const onSubscribe = useCallback(
    async (tier: PaidTier) => {
      setError(null);
      setSuccessHint(null);
      setLoadingTier(tier);
      setSubscribePhase("creating");
      let redirected = false;
      try {
        const result = await createZiinaPaymentAction(tier as UserTier, isAnnual);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        if (result.data?.redirectUrl) {
          setSubscribePhase("redirecting");
          setSuccessHint("Opening Ziina’s secure checkout in this window…");
          redirected = true;
          window.location.assign(result.data.redirectUrl);
          return;
        }
        setError(
          "Checkout was created but no payment link was returned. Please try again or contact support.",
        );
      } catch (e) {
        setError(normalizeClientError(e));
      } finally {
        if (!redirected) {
          setLoadingTier(null);
          setSubscribePhase("idle");
          setSuccessHint(null);
        }
      }
    },
    [isAnnual],
  );

  const border = "1px solid rgba(255,255,255,0.1)";
  const muted = "rgba(250,250,250,0.55)";
  const checkoutBusy = loadingTier !== null;

  return (
    <>
      {checkout ? (
        <div
          role="status"
          style={{
            textAlign: "center",
            padding: "1rem 1.15rem",
            borderRadius: 12,
            border:
              checkout === "success"
                ? "1px solid rgba(74, 222, 128, 0.35)"
                : checkout === "failed"
                  ? "1px solid rgba(248, 113, 113, 0.4)"
                  : "1px solid rgba(234, 179, 8, 0.35)",
            background:
              checkout === "success"
                ? "rgba(22, 101, 52, 0.25)"
                : checkout === "failed"
                  ? "rgba(127, 29, 29, 0.35)"
                  : "rgba(120, 80, 20, 0.25)",
            marginBottom: "1.5rem",
            fontSize: "0.95rem",
            lineHeight: 1.55,
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <strong
            style={{
              display: "block",
              marginBottom: "0.35rem",
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color:
                checkout === "success"
                  ? "#bbf7d0"
                  : checkout === "failed"
                    ? "#fecaca"
                    : "#fde68a",
            }}
          >
            {checkout === "success"
              ? "Payment received"
              : checkout === "failed"
                ? "Something went wrong"
                : "Checkout canceled"}
          </strong>
          <span
            style={{
              color:
                checkout === "success"
                  ? "#d1fae5"
                  : checkout === "failed"
                    ? "#fecaca"
                    : "#fef9c3",
            }}
          >
            {checkout === "success"
              ? "Thank you. Your plan will update automatically once Ziina confirms the payment (usually within a minute). You can return to the dashboard anytime."
              : checkout === "cancel"
                ? "You left checkout before paying. When you’re ready, choose a plan below and tap Subscribe again."
                : "Ziina couldn’t complete the payment. Check your card details or try another method, then subscribe again."}
          </span>
        </div>
      ) : null}

      {successHint && loadingTier ? (
        <p
          role="status"
          aria-live="polite"
          style={{
            textAlign: "center",
            padding: "0.75rem 1rem",
            borderRadius: 10,
            border: "1px solid rgba(167, 139, 250, 0.35)",
            background: "rgba(91, 33, 182, 0.2)",
            color: "#e9d5ff",
            marginBottom: "1.25rem",
            fontSize: "0.9rem",
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {successHint}
        </p>
      ) : null}

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.35rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            borderRadius: 999,
            padding: 4,
            background: "rgba(255,255,255,0.06)",
            border,
          }}
        >
          <button
            type="button"
            disabled={checkoutBusy}
            onClick={() => setIsAnnual(false)}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "0.5rem 1.1rem",
              cursor: checkoutBusy ? "not-allowed" : "pointer",
              opacity: checkoutBusy ? 0.55 : 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              background: !isAnnual ? "rgba(167, 139, 250, 0.25)" : "transparent",
              color: !isAnnual ? "#fafafa" : muted,
            }}
          >
            Monthly
          </button>
          <button
            type="button"
            disabled={checkoutBusy}
            onClick={() => setIsAnnual(true)}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "0.5rem 1.1rem",
              cursor: checkoutBusy ? "not-allowed" : "pointer",
              opacity: checkoutBusy ? 0.55 : 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              background: isAnnual ? "rgba(167, 139, 250, 0.25)" : "transparent",
              color: isAnnual ? "#fafafa" : muted,
            }}
          >
            Annual
          </button>
        </div>
        <span style={{ fontSize: "0.8rem", color: isAnnual ? "rgba(134, 239, 172, 0.9)" : muted }}>
          {isAnnual
            ? `Pay for ${ANNUAL_MONTHS_CHARGED} months — two months on us`
            : "Billed monthly — GBP (£)"}
        </span>
      </section>

      {error ? (
        <div
          role="alert"
          style={{
            marginBottom: "1.25rem",
            padding: "1.1rem 1.2rem",
            borderRadius: 12,
            border: "1px solid rgba(248, 113, 113, 0.4)",
            background: "linear-gradient(145deg, rgba(127, 29, 29, 0.45), rgba(69, 10, 10, 0.35))",
            color: "#fecaca",
            fontSize: "0.9rem",
            lineHeight: 1.55,
            maxWidth: 540,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
          }}
        >
          <strong style={{ display: "block", marginBottom: "0.4rem", color: "#fca5a5" }}>
            Couldn’t start checkout
          </strong>
          <span style={{ color: "#fecaca" }}>{error}</span>
          {/ziina|payment|network|fetch|api key|configured/i.test(error) ? (
            <div
              style={{
                marginTop: "0.65rem",
                paddingTop: "0.65rem",
                borderTop: "1px solid rgba(248, 113, 113, 0.2)",
                fontSize: "0.82rem",
                color: "rgba(254, 202, 202, 0.92)",
              }}
            >
              Check <code style={{ color: "#fde68a" }}>ZIINA_API_KEY</code> on the server and that
              this app can reach Ziina. In test mode, payments still run through Ziina’s sandbox —
              no live charges.
            </div>
          ) : null}
          {error.toLowerCase().includes("sign in") ? (
            <div style={{ marginTop: "0.75rem" }}>
              <a
                href="/login"
                style={{
                  color: "#e9d5ff",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Go to sign in
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      <p
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          color: muted,
          marginBottom: "1.25rem",
        }}
      >
        <a href="/login" style={{ color: "#c4b5fd" }}>
          Sign in
        </a>{" "}
        before subscribing — checkout requires an authenticated session.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {TIERS.map((tier) => {
          const def = PAID_TIER_DISPLAY[tier];
          const busy = loadingTier === tier;
          const isPopular = tier === "pro";
          const label =
            tier === "enterprise"
              ? "Request Private Briefing"
              : busy && subscribePhase === "creating"
                ? "Preparing checkout…"
                : busy && subscribePhase === "redirecting"
                  ? "Redirecting to Ziina…"
                  : "Subscribe";
          const localized = formatTierMoney(tier, isAnnual);
          const monthlyGbp = GBP_MONTHLY_MAJOR[tier];
          const annualGbp = monthlyGbp * ANNUAL_MONTHS_CHARGED;
          const fmtGbp = (n: number) => `£${n.toLocaleString("en-GB")}`;
          const listCaption =
            tier === "enterprise"
              ? isAnnual
                ? `${fmtGbp(annualGbp)}+ / yr list`
                : `${fmtGbp(monthlyGbp)}+ / mo. list`
              : isAnnual
                ? `${fmtGbp(annualGbp)} / yr list`
                : `${fmtGbp(monthlyGbp)} / mo. list`;

          return (
            <article
              key={tier}
              style={{
                position: "relative",
                border: isPopular
                  ? "1px solid rgba(165, 180, 252, 0.45)"
                  : border,
                borderRadius: 18,
                padding: isPopular ? "2.35rem 1.5rem 1.5rem" : "1.6rem 1.5rem 1.5rem",
                background: isPopular
                  ? "linear-gradient(165deg, rgba(67, 56, 202, 0.28) 0%, rgba(79, 70, 229, 0.12) 38%, rgba(9,9,11,0.5) 100%)"
                  : "rgba(255,255,255,0.03)",
                boxShadow: isPopular
                  ? [
                      "0 0 0 1px rgba(129, 140, 248, 0.25)",
                      "inset 0 1px 0 0 rgba(199, 210, 254, 0.14)",
                      "0 0 56px -6px rgba(99, 102, 241, 0.55)",
                      "0 0 100px -20px rgba(129, 140, 248, 0.42)",
                      "0 24px 56px -14px rgba(0, 0, 0, 0.6)",
                    ].join(", ")
                  : "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {isPopular ? (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 14,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#e9d5ff",
                    background: "rgba(124, 58, 237, 0.45)",
                    border: "1px solid rgba(196, 181, 253, 0.4)",
                    padding: "0.28rem 0.65rem",
                    borderRadius: 999,
                  }}
                >
                  High-signal · Pro
                </span>
              ) : null}
              <header>
                <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.35rem", fontWeight: 700 }}>
                  {def.name}
                </h2>
                <p
                  style={{
                    margin: "0 0 0.35rem",
                    fontSize: "0.78rem",
                    color: "rgba(250,250,250,0.42)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {listCaption}
                </p>
                <p
                  style={{
                    margin: "0 0 0.45rem",
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    color: "#fafafa",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {localized}
                  <span style={{ fontWeight: 500, fontSize: "0.82rem", color: muted }}>
                    {isAnnual ? " / yr" : " / mo."}
                  </span>
                </p>
                <p
                  style={{
                    margin: "0 0 0.6rem",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: isPopular
                      ? "rgba(199, 210, 254, 0.98)"
                      : "rgba(167, 243, 208, 0.95)",
                    letterSpacing: "0.01em",
                    textShadow: isPopular
                      ? "0 0 24px rgba(129, 140, 248, 0.45), 0 0 2px rgba(99, 102, 241, 0.35)"
                      : "none",
                  }}
                >
                  {def.leadVolumeLabel}
                </p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(250,250,250,0.62)", lineHeight: 1.55 }}>
                  {def.description}
                </p>
              </header>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.1rem",
                  fontSize: "0.875rem",
                  color: "rgba(250,250,250,0.78)",
                  flex: 1,
                }}
              >
                {def.highlights.map((h) => (
                  <li key={h} style={{ marginBottom: "0.35rem" }}>
                    {h}
                  </li>
                ))}
              </ul>
              {tier === "enterprise" ? (
                <a
                  href={ENTERPRISE_INQUIRY_HREF}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem 1rem",
                    borderRadius: 11,
                    border: "1px solid rgba(250, 250, 250, 0.22)",
                    background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95) 0%, rgba(39, 39, 42, 0.85) 100%)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
                    color: "#fafafa",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  <span>{label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled={loadingTier !== null}
                  aria-busy={busy}
                  onClick={() => onSubscribe(tier)}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem 1rem",
                    borderRadius: 11,
                    border: isPopular ? "1px solid rgba(196, 181, 253, 0.35)" : "none",
                    background: busy
                      ? "rgba(255,255,255,0.12)"
                      : isPopular
                        ? "linear-gradient(145deg, #8b5cf6 0%, #6d28d9 45%, #5b21b6 100%)"
                        : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                    boxShadow: busy
                      ? "none"
                      : isPopular
                        ? "0 4px 28px rgba(99, 102, 241, 0.5), 0 0 40px -6px rgba(129, 140, 248, 0.5), inset 0 1px 0 rgba(255,255,255,0.14)"
                        : "0 4px 16px rgba(91, 33, 182, 0.25)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: busy ? "wait" : "pointer",
                    fontSize: "0.9rem",
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {busy ? (
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      aria-hidden
                      style={{ flexShrink: 0 }}
                    >
                      <title>Loading</title>
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                      />
                      <g>
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 12 12"
                          to="360 12 12"
                          dur="0.75s"
                          repeatCount="indefinite"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="15.7 47.1"
                        />
                      </g>
                    </svg>
                  ) : null}
                  <span>{label}</span>
                </button>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
