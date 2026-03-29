import type { Metadata } from "next";

import { LeadsFactoryClient } from "@/components/dashboard/leads-factory-client";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Leads — LeadForge",
  description: "Generate and export personalized cold emails.",
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

  return <LeadsFactoryClient initialLeads={leads ?? []} />;
}
