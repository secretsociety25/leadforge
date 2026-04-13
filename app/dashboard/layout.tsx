import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTierProvider } from "@/components/dashboard/dashboard-tier-context";
import { DASHBOARD_DUAL_RADIAL_STYLE } from "@/components/dashboard/dashboard-dual-gradient";

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
    <DashboardTierProvider value={{ email, signedIn, tier }}>
      <div
        className="isolate min-h-screen bg-black font-sans text-white antialiased"
        style={DASHBOARD_DUAL_RADIAL_STYLE}
      >
        <DashboardSidebar email={email} signedIn={signedIn} tier={tier} />
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden md:pl-64">{children}</div>
      </div>
    </DashboardTierProvider>
  );
}
