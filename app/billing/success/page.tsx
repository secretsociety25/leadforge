import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment successful — LeadForge",
};

export default function BillingSuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        background: "#f8fafc",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.35rem", marginBottom: "0.75rem" }}>
          Payment successful
        </h1>
        <p style={{ color: "#475569", marginBottom: "1.5rem", lineHeight: 1.5 }}>
          Your account will be upgraded shortly after Ziina confirms the payment.
        </p>
        <Link href="/pricing" style={{ color: "#2563eb", fontSize: "0.9rem" }}>
          Back to pricing
        </Link>
      </div>
    </main>
  );
}
