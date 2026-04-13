import type { Metadata } from "next";

import { L3ResearchTerminal } from "@/components/dashboard/l3-research-terminal";

export const metadata: Metadata = {
  title: "L3 Research Terminal",
  description:
    "LeadForge L3 Research Engine — Prospeo ingestion, neural research traces, and psychographic scoring.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-full min-w-0 bg-black">
      <L3ResearchTerminal />
    </div>
  );
}
