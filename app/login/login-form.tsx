"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { applyAffiliateReferralWithCodeAction } from "@/app/actions/affiliate";
import { syncPublicUserFromAuthAction } from "@/app/actions/auth-profile";
import { AFFILIATE_REF_COOKIE } from "@/lib/affiliate/constants";
import { createClient } from "@/lib/supabase";

type Mode = "signin" | "signup";

function readAffiliateRefFromBrowser(): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split("; ");
  for (const p of parts) {
    if (p.startsWith(`${AFFILIATE_REF_COOKIE}=`)) {
      const v = p.slice(AFFILIATE_REF_COOKIE.length + 1);
      try {
        return decodeURIComponent(v);
      } catch {
        return v;
      }
    }
  }
  return null;
}

function clearAffiliateRefCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AFFILIATE_REF_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

const SOFT_SYNC = "Profile sync unavailable";

function safeNext(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

/** Matches NEXT_PUBLIC_APP_URL in production (https://www.mtdfix.co.uk). Used for email-confirm redirects. */
function getPublicSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/**
 * Refresh server components, then hard-navigate so middleware sees auth cookies
 * (tiny delay helps @supabase/ssr persist cookies before the next document request).
 */
function completeLoginRedirect(router: ReturnType<typeof useRouter>, path: string) {
  router.refresh();
  window.setTimeout(() => {
    window.location.assign(path);
  }, 75);
}

async function syncProfileWithRetry(): Promise<{ ok: boolean; error?: string; softFail?: boolean }> {
  let r = await syncPublicUserFromAuthAction();
  if (r.ok) return { ok: true };
  if (r.error?.includes(SOFT_SYNC)) return { ok: true, softFail: true };
  await new Promise((res) => setTimeout(res, 400));
  r = await syncPublicUserFromAuthAction();
  if (r.ok) return { ok: true };
  if (r.error?.includes(SOFT_SYNC)) return { ok: true, softFail: true };
  return { ok: false, error: r.error };
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get("next"));

  const initialMode = useMemo((): Mode => {
    return searchParams.get("mode") === "signup" ? "signup" : "signin";
  }, [searchParams]);

  const urlAuthError = useMemo(() => {
    const code = searchParams.get("error");
    if (!code) return null;
    const raw = searchParams.get("error_description");
    const desc = raw
      ? decodeURIComponent(raw.replace(/\+/g, " "))
      : null;
    if (code === "auth_callback" && desc) return desc;
    if (desc) return `${code}: ${desc}`;
    return code;
  }, [searchParams]);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const displayError = error ?? urlAuthError;

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setInfo(null);
      setLoading(true);

      let supabase: ReturnType<typeof createClient>;
      try {
        supabase = createClient();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Supabase is not configured.");
        setLoading(false);
        return;
      }

      try {
        if (mode === "signin") {
          const { error: authErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (authErr) {
            setError(authErr.message);
            return;
          }

          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            setError(
              "Your session was not saved. Allow cookies for this site (or relax tracking protection for this domain) and try again.",
            );
            return;
          }

          const refResultSignin = await applyAffiliateReferralWithCodeAction(readAffiliateRefFromBrowser());
          if (refResultSignin.ok && refResultSignin.data.applied) {
            clearAffiliateRefCookie();
          }

          const sync = await syncProfileWithRetry();
          if (!sync.ok) {
            const msg = sync.error ?? "";
            if (msg.includes("Not signed in")) {
              completeLoginRedirect(router, nextPath);
              return;
            }
            // Client session exists; don’t block sign-in on server-only profile sync failures.
            console.warn("[login] profile sync after sign-in:", msg);
          }

          completeLoginRedirect(router, nextPath);
          return;
        }

        const origin = getPublicSiteOrigin();
        const emailRedirectTo =
          origin &&
          `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: emailRedirectTo
            ? {
                emailRedirectTo,
              }
            : undefined,
        });
        if (signUpErr) {
          setError(signUpErr.message);
          return;
        }
        if (data.user?.identities?.length === 0) {
          setError("This email is already registered. Try signing in.");
          return;
        }

        if (data.session) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            setError(
              "Account created but session was not saved. Allow cookies for this site and try signing in.",
            );
            return;
          }

          const refResultSignup = await applyAffiliateReferralWithCodeAction(readAffiliateRefFromBrowser());
          if (refResultSignup.ok && refResultSignup.data.applied) {
            clearAffiliateRefCookie();
          }

          const sync = await syncProfileWithRetry();
          if (!sync.ok) {
            const msg = sync.error ?? "";
            if (msg.includes("Not signed in")) {
              completeLoginRedirect(router, nextPath);
              return;
            }
            console.warn("[login] profile sync after sign-up:", msg);
          }

          completeLoginRedirect(router, nextPath);
          return;
        }

        setInfo(
          "Check your email to confirm your account, then sign in. If confirmation is disabled in Supabase, try signing in now.",
        );
        setMode("signin");
      } catch (err) {
        console.error("[login]", err);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, mode, nextPath, router],
  );

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-8 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.7)] backdrop-blur-sm">
      <div className="mb-8 flex rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
            setInfo(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
            mode === "signin"
              ? "bg-violet-600/25 text-white shadow-inner shadow-black/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
            setInfo(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
            mode === "signup"
              ? "bg-violet-600/25 text-white shadow-inner shadow-black/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Create account
        </button>
      </div>

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => void onSubmit(e)}
        aria-busy={loading}
      >
        <div>
          <label htmlFor="auth-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Email
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-2"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label
            htmlFor="auth-password"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Password
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 outline-none ring-violet-500/30 focus:border-violet-500/50 focus:ring-2"
            placeholder="••••••••"
          />
        </div>

        {displayError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            {displayError}
          </p>
        ) : null}
        {info ? (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100/90">
            {info}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          className="lf-marketing-primary mt-1 w-full gap-2 text-sm disabled:cursor-wait"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              Signing you in…
            </>
          ) : mode === "signin" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link href="/" className="font-medium text-violet-400 hover:text-violet-300">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
