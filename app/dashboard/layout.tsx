import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

/**
 * No Supabase calls here — `getUser()` can hang when the project URL is wrong or offline.
 * Restore session + tier from Supabase when auth is re-enabled for production.
 *
 * Global styles come from `app/layout.tsx` (imports `./globals.css` once for the whole app).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const email = null;
  const signedIn = false;
  const tier = "free";

  return (
    <div
      className="isolate min-h-screen bg-black font-sans text-white antialiased"
      style={{
        background:
          "radial-gradient(120% 85% at 50% -18%, rgba(99, 102, 241, 0.22), transparent 58%), radial-gradient(95% 65% at 100% 0%, rgba(139, 92, 246, 0.14), transparent 52%), #000000",
      }}
    >
      <DashboardSidebar email={email} signedIn={signedIn} tier={tier} />
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden md:pl-64">{children}</div>
    </div>
  );
}
