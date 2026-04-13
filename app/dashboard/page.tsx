import type { Metadata } from "next";

import { L3ResearchTerminal } from "@/components/dashboard/l3-research-terminal";

export const metadata: Metadata = {
  title: "L3 Research Terminal",
  description:
    "LeadForge L3 Engine — Prospeo ingestion, Psychographic Manifold Synthesis traces, and psychographic scoring.",
};

export default function DashboardPage() {
  return (
    <div className="min-w-0 bg-black min-h-screen text-white">
      <L3ResearchTerminal />
    </div>
  );
}
