import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedIn = Boolean(user);

  let tier = "free";
  if (user) {
    const { data: row } = await supabase
      .from("users")
      .select("tier")
      .eq("id", user.id)
      .maybeSingle();
    if (row?.tier) tier = row.tier;
  }

  return (
    <div
      className="min-h-screen bg-zinc-950 font-sans"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -20%, rgba(120, 80, 200, 0.14), transparent 55%), rgb(9 9 11)",
      }}
    >
      <DashboardSidebar
        email={user?.email ?? null}
        signedIn={signedIn}
        tier={tier}
      />
      <div className="min-h-screen w-full min-w-0 md:pl-64">{children}</div>
    </div>
  );
}
