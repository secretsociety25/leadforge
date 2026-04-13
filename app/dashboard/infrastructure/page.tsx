import type { Metadata } from "next";

import { InfrastructureClient } from "@/components/dashboard/infrastructure-client";

export const metadata: Metadata = {
  title: "Infrastructure",
  description:
    "LeadForge Infrastructure — managed sending nodes, domain isolation, and reputation state.",
};

export default function InfrastructurePage() {
  return <InfrastructureClient />;
}
