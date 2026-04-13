import { NextResponse } from "next/server";

import { fetchPrimaryDirectorName } from "@/lib/companies-house-officers";
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

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns the string if it is a valid calendar date in YYYY-MM-DD form. */
function parseIsoDateParam(value: string | null): string | null {
  if (value == null || !ISO_DATE_RE.test(value)) return null;
  const ms = Date.parse(`${value}T12:00:00.000Z`);
  if (!Number.isFinite(ms)) return null;
  return value;
}

const MAX_RANGE_DAYS = 731;

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

  const todayUtc = isoDateOnly(new Date());
  const fromParam = parseIsoDateParam(url.searchParams.get("from"));
  const toParam = parseIsoDateParam(url.searchParams.get("to"));

  let incorporated_from: string;
  let incorporated_to: string;
  let usedCustomRange: boolean;

  if (fromParam && toParam) {
    let from = fromParam;
    let to = toParam;
    if (from > to) {
      const t = from;
      from = to;
      to = t;
    }
    if (to > todayUtc) {
      to = todayUtc;
    }
    if (from > to) {
      from = to;
    }
    const startMs = Date.parse(`${from}T00:00:00.000Z`);
    const endMs = Date.parse(`${to}T00:00:00.000Z`);
    const spanDays = Math.floor((endMs - startMs) / 86_400_000) + 1;
    if (spanDays > MAX_RANGE_DAYS) {
      return NextResponse.json(
        {
          ok: false,
          error: "DISCOVERY_DATE_RANGE_TOO_LARGE",
          hint: `Choose a window of at most ${MAX_RANGE_DAYS} days.`,
        },
        { status: 400 },
      );
    }
    incorporated_from = from;
    incorporated_to = to;
    usedCustomRange = true;
  } else {
    const now = new Date();
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    incorporated_from = isoDateOnly(since);
    incorporated_to = isoDateOnly(now);
    if (incorporated_to > todayUtc) {
      incorporated_to = todayUtc;
    }
    usedCustomRange = false;
  }

  const windowStartMs = Date.parse(`${incorporated_from}T00:00:00.000Z`);
  const windowEndMs = Date.parse(`${incorporated_to}T00:00:00.000Z`);
  const windowDaysInclusive = Math.max(
    1,
    Math.floor((windowEndMs - windowStartMs) / 86_400_000) + 1,
  );

  const upstream = new URL(
    "https://api.company-information.service.gov.uk/advanced-search/companies",
  );

  // Query CH for the incorporation window; client-side filter matches the same calendar bounds.
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
  const filterStartMs = Date.parse(`${incorporated_from}T00:00:00.000Z`);
  const filterEndMs = Date.parse(`${incorporated_to}T23:59:59.999Z`);

  const baseCompanies = rawItems
    .map((item) => ({
      companyName: item.company_name ?? "",
      companyNumber: item.company_number ?? "",
      creationDate: item.date_of_creation ?? "",
    }))
    .filter((c) => c.companyName && c.companyNumber && c.creationDate)
    .filter((c) => {
      const t = Date.parse(c.creationDate);
      return Number.isFinite(t) && t >= filterStartMs && t <= filterEndMs;
    });

  const companies: Array<{
    companyName: string;
    companyNumber: string;
    creationDate: string;
    directorName: string | null;
  }> = [];

  for (const c of baseCompanies) {
    const directorName = await fetchPrimaryDirectorName(
      c.companyNumber,
      authHeader,
      COMPANIES_HOUSE_USER_AGENT,
    );
    companies.push({ ...c, directorName });
    await new Promise((r) => setTimeout(r, 110));
  }

  return NextResponse.json({
    ok: true,
    windowDays: windowDaysInclusive,
    dateRangeCustom: usedCustomRange,
    incorporatedFrom: incorporated_from,
    incorporatedTo: incorporated_to,
    /** Raw hit count before date-window filter (helps debug empty tables). */
    upstreamItemCount: rawItems.length,
    companies,
  });
}

