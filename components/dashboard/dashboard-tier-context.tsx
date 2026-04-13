"use client";

import { createContext, useContext } from "react";

export type DashboardTierState = {
  email: string | null;
  signedIn: boolean;
  tier: string;
};

const DashboardTierContext = createContext<DashboardTierState | null>(null);

export function DashboardTierProvider({
  value,
  children,
}: {
  value: DashboardTierState;
  children: React.ReactNode;
}) {
  return <DashboardTierContext.Provider value={value}>{children}</DashboardTierContext.Provider>;
}

export function useDashboardTier(): DashboardTierState {
  const ctx = useContext(DashboardTierContext);
  if (!ctx) {
    return { email: null, signedIn: false, tier: "free" };
  }
  return ctx;
}
