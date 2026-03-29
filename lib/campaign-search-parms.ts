import type { Json } from "@/lib/database.types";

export type CampaignTargeting = {
  targetJobTitle: string;
  industry: string;
  location: string;
};

export function campaignTargetingFromJson(sp: Json | null): Partial<CampaignTargeting> {
  if (!sp || typeof sp !== "object" || Array.isArray(sp)) return {};
  const o = sp as Record<string, unknown>;
  return {
    targetJobTitle: typeof o.targetJobTitle === "string" ? o.targetJobTitle : undefined,
    industry: typeof o.industry === "string" ? o.industry : undefined,
    location: typeof o.location === "string" ? o.location : undefined,
  };
}

export function toCampaignSearchJson(input: CampaignTargeting): Json {
  return {
    targetJobTitle: input.targetJobTitle.trim(),
    industry: input.industry.trim(),
    location: input.location.trim(),
  };
}
