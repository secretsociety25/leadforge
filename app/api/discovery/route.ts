import { NextResponse } from "next/server";

import {
  COMPANIES_HOUSE_USER_AGENT,
  companiesHouseBasicAuthHeader,
  readCompaniesHouseApiKeyFromEnv,
} from "@/lib/companies-house-api-key";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CompaniesHouseAdvancedSearchResponse = {
  items?: Array<{
    company_name?: string;
    company_number?: string;
    date_of_creation?: string;
  }>;
};

function isoDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const apiKey = readCompaniesHouseApiKeyFromEnv();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing COMPANIES_HOUSE_API_KEY" },
      { status: 500 },
    );
  }
  /** Only block obvious tutorial strings — not fuzzy regex (avoids surprises). */
  const placeholderKeys = new Set(
    [
      "your_key_here",
      "your-key-here",
      "yourkeyhere",
      "changeme",
      "replace_me",
      "api_key_here",
      "xxx",
    ].map((s) => s.toLowerCase()),
  );
  if (placeholderKeys.has(apiKey.toLowerCase())) {
    return NextResponse.json(
      {
        ok: false,
        error: "COMPANIES_HOUSE_API_KEY_PLACEHOLDER",
      },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const size = Math.min(Math.max(Number(url.searchParams.get("size") ?? 20), 1), 100);

  const now = new Date();
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const incorporated_from = isoDateOnly(since);
  const incorporated_to = isoDateOnly(now);

  const upstream = new URL(
    "https://api.company-information.service.gov.uk/advanced-search/companies",
  );

  // Keep the call deterministic and cheap for demo; we filter to the last 7 days server-side
  // and again client-side as a safety net.
  upstream.searchParams.set("incorporated_from", incorporated_from);
  upstream.searchParams.set("incorporated_to", incorporated_to);
  upstream.searchParams.set("company_status", "active");
  upstream.searchParams.set("size", String(size));

  const authHeader = companiesHouseBasicAuthHeader(apiKey);

  const res = await fetch(upstream, {
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
      "User-Agent": COMPANIES_HOUSE_USER_AGENT,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const status = res.status;
    const mappedError =
      status === 401
        ? "INVALID_API_KEY"
        : status === 429
          ? "UK_GOV_RATE_LIMIT_REACHED"
          : `COMPANIES_HOUSE_ERROR_${status}`;

    /** If advanced search rejects auth, confirm whether the key works on a basic search endpoint. */
    let keyProbe: "ok" | "fail" | "skipped" = "skipped";
    if (status === 401) {
      const probeUrl = new URL("https://api.company-information.service.gov.uk/search/companies");
      probeUrl.searchParams.set("q", "a");
      probeUrl.searchParams.set("items_per_page", "1");
      const probe = await fetch(probeUrl, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "User-Agent": COMPANIES_HOUSE_USER_AGENT,
        },
        cache: "no-store",
      });
      keyProbe = probe.ok ? "ok" : "fail";
    }

    const hint401 =
      status === 401
        ? keyProbe === "ok"
          ? "Your key works on /search/companies but not on /advanced-search/companies — check your developer application has access to Advanced search, or contact Companies House support."
          : "Use a REST API key from developer.company-information.service.gov.uk (Manage applications). It must not be a Streaming API key. Ensure .env.local has COMPANIES_HOUSE_API_KEY=key with no quotes/spaces, then restart next dev."
        : undefined;

    return NextResponse.json(
      {
        ok: false,
        error: mappedError,
        status,
        details: body.slice(0, 600),
        ...(hint401 ? { hint: hint401, keyProbe } : {}),
      },
      { status },
    );
  }

  const data = (await res.json()) as CompaniesHouseAdvancedSearchResponse;
  const rawItems = data.items ?? [];
  const cutoff = since.getTime();

  const companies = rawItems
    .map((item) => ({
      companyName: item.company_name ?? "",
      companyNumber: item.company_number ?? "",
      creationDate: item.date_of_creation ?? "",
    }))
    .filter((c) => c.companyName && c.companyNumber && c.creationDate)
    .filter((c) => {
      const t = Date.parse(c.creationDate);
      return Number.isFinite(t) && t >= cutoff;
    });

  return NextResponse.json({
    ok: true,
    windowDays: 7,
    incorporatedFrom: incorporated_from,
    incorporatedTo: incorporated_to,
    companies,
  });
}

