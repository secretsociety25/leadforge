import type { Metadata } from "next";

import { SignalDiscoveryClient } from "@/components/dashboard/signal-discovery-client";

export const metadata: Metadata = {
  title: "Signal Discovery",
  description:
    "LeadForge Signal Discovery — sovereign market mapping, territory selection, and high-signal account synthesis.",
};

export default function SignalDiscoveryPage() {
  return <SignalDiscoveryClient />;
}
