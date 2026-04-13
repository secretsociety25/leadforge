import { NextResponse } from "next/server";

import { classifyOrgNameMatch } from "@/lib/apollo-org-match";
import { readApolloApiKeyFromEnv } from "@/lib/apollo-api-key";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ApolloOrg = {
  name?: string;
  website_url?: string | null;
  primary_domain?: string | null;
};

type ApolloSearchResponse = {
  organizations?: ApolloOrg[];
};

/** Only Apollo `website_url` — no inferred domains (per product requirement). */
function websiteUrlOnly(org: ApolloOrg): string | null {
  const w = org.website_url?.trim();
  return w || null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const companyName =
    typeof body === "object" &&
    body !== null &&
    "companyName" in body &&
    typeof (body as { companyName: unknown }).companyName === "string"
      ? (body as { companyName: string }).companyName.trim()
      : "";

  if (!companyName) {
    return NextResponse.json(
      { ok: false, error: "MISSING_COMPANY_NAME" },
      { status: 400 },
    );
  }

  const apiKey = readApolloApiKeyFromEnv();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "APOLLO_API_KEY_NOT_CONFIGURED",
        websiteUrl: null,
        apolloOrganizationName: null,
        matchStatus: "unverified" as const,
        hint: "Set APOLLO_API_KEY (or APOLLO_IO_API_KEY) in the server environment.",
      },
      { status: 503 },
    );
  }

  const res = await fetch("https://api.apollo.io/api/v1/mixed_companies/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      q_organization_name: companyName,
      page: 1,
      per_page: 5,
    }),
    cache: "no-store",
  });

  const rawText = await res.text().catch(() => "");
  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "APOLLO_REQUEST_FAILED",
        status: res.status,
        websiteUrl: null,
        apolloOrganizationName: null,
        matchStatus: "unverified" as const,
        details: rawText.slice(0, 400),
      },
      { status: 502 },
    );
  }

  let data: ApolloSearchResponse;
  try {
    data = JSON.parse(rawText) as ApolloSearchResponse;
  } catch {
    return NextResponse.json(
      { ok: false, error: "APOLLO_INVALID_JSON", websiteUrl: null, matchStatus: "unverified" },
      { status: 502 },
    );
  }

  const orgs = data.organizations ?? [];
  const first = orgs[0];
  if (!first) {
    return NextResponse.json({
      ok: true,
      websiteUrl: null,
      apolloOrganizationName: null,
      matchStatus: "not_found" as const,
    });
  }

  const apolloOrgName = first.name?.trim() ?? null;
  const websiteUrl = websiteUrlOnly(first);

  if (!websiteUrl) {
    return NextResponse.json({
      ok: true,
      websiteUrl: null,
      apolloOrganizationName: apolloOrgName,
      matchStatus: "not_found" as const,
    });
  }

  const matchStatus = apolloOrgName
    ? classifyOrgNameMatch(companyName, apolloOrgName)
    : "unverified";

  return NextResponse.json({
    ok: true,
    websiteUrl,
    apolloOrganizationName: apolloOrgName,
    matchStatus,
  });
}
