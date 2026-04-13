import type { Metadata } from "next";

import { LeadsFactoryClient } from "@/components/dashboard/leads-factory-client";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Leads — LeadForge",
  description: "Generate and export personalized cold emails.",
};

function queryTimeout(ms: number) {
  return new Promise<never>((_, rej) => {
    setTimeout(() => rej(new Error("query timeout")), ms);
  });
}

export default async function LeadsPage() {
  let leads: Tables<"leads">[] = [];

  try {
    const supabase = await createClient();
    const { data } = await Promise.race([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      queryTimeout(5000),
    ]);
    leads = data ?? [];
  } catch {
    leads = [];
  }

  return <LeadsFactoryClient initialLeads={leads} />;
}
