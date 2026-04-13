import { NextResponse } from "next/server";

import {
  COMPANIES_HOUSE_USER_AGENT,
  companiesHouseBasicAuthHeader,
  readCompaniesHouseApiKeyFromEnv,
} from "@/lib/companies-house-api-key";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lightweight check: confirms the server reads an API key and whether Companies House
 * accepts it on a minimal REST endpoint (does not expose the key).
 */
export async function GET() {
  const apiKey = readCompaniesHouseApiKeyFromEnv();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "No COMPANIES_HOUSE_API_KEY (or CH_API_KEY) found in environment.",
      },
      { status: 500 },
    );
  }

  const authHeader = companiesHouseBasicAuthHeader(apiKey);
  const probeUrl = new URL("https://api.company-information.service.gov.uk/search/companies");
  probeUrl.searchParams.set("q", "test");
  probeUrl.searchParams.set("items_per_page", "1");

  const probe = await fetch(probeUrl, {
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
      "User-Agent": COMPANIES_HOUSE_USER_AGENT,
    },
    cache: "no-store",
  });

  const bodySnippet = (await probe.text()).slice(0, 200);

  return NextResponse.json({
    ok: probe.ok,
    configured: true,
    keyLength: apiKey.length,
    searchCompaniesHttpStatus: probe.status,
    interpretation:
      probe.status === 401
        ? "Companies House rejected the key — create a new REST API key (not Streaming) at developer.company-information.service.gov.uk and restart next dev."
        : probe.ok
          ? "Key is accepted on /search/companies. If /api/discovery still fails, advanced search may be restricted for your application."
          : `Unexpected status ${probe.status} — see Companies House developer status pages.`,
    bodyPreview: probe.ok ? undefined : bodySnippet,
  });
}
