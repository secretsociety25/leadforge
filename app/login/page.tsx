import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to LeadForge — personalised B2B outbound and dashboard.",
};

function LoginFormFallback() {
  return (
    <div className="flex min-h-[320px] w-full max-w-[420px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/50 px-8 py-16 text-sm text-zinc-500">
      Loading…
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-10%,rgba(120,80,200,0.2),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(91,33,182,0.12),transparent_45%)]"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">LeadForge</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Sign in or create an account to open the dashboard and billing.
        </p>
      </div>

      <div className="relative z-10 mt-10 w-full max-w-lg">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="relative z-10 mt-10 max-w-md text-center text-xs text-zinc-600">
        New here? Use <strong className="text-zinc-500">Create account</strong> above, or{" "}
        <Link href="/register" className="text-violet-400 hover:underline">
          open registration
        </Link>
        .
      </p>
    </main>
  );
}
