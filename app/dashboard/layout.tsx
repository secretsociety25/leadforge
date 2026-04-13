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
      className="isolate min-h-screen bg-zinc-950 font-sans text-zinc-50 antialiased"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -20%, rgba(120, 80, 200, 0.14), transparent 55%), rgb(9 9 11)",
      }}
    >
      <DashboardSidebar email={email} signedIn={signedIn} tier={tier} />
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden md:pl-64">{children}</div>
    </div>
  );
}
