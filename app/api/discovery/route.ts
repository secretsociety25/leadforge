import { NextResponse } from "next/server";

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
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing COMPANIES_HOUSE_API_KEY" },
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

  const auth = Buffer.from(`${apiKey}:`).toString("base64");

  const res = await fetch(upstream, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
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
    return NextResponse.json(
      {
        ok: false,
        error: mappedError,
        status,
        details: body.slice(0, 600),
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

