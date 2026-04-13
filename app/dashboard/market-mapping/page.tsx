import type { Metadata } from "next";

import { MarketMappingClient } from "@/components/dashboard/market-mapping-client";

export const metadata: Metadata = {
  title: "Market Mapping",
  description:
    "LeadForge Market Mapping — high-volume Apollo lead search with Companies House officer verification.",
};

export default function MarketMappingPage() {
  return <MarketMappingClient />;
}
