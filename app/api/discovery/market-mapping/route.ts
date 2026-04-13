import { NextResponse } from "next/server";

import { readApolloApiKeyFromEnv } from "@/lib/apollo-api-key";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APOLLO_MIXED_PEOPLE_URL = "https://api.apollo.io/api/v1/mixed_people/api_search";

type ApolloOrg = {
  id?: string;
  name?: string;
  primary_domain?: string | null;
  website_url?: string | null;
  industry?: string | null;
  estimated_num_employees?: number | null;
  /** Sometimes present for UK orgs in enrichment payloads */
  raw_address?: string | null;
};

type ApolloPerson = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  title?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  city?: string | null;
  country?: string | null;
  organization_id?: string | null;
  organization?: ApolloOrg | null;
};

type ApolloMixedPeopleResponse = {
  people?: ApolloPerson[];
  pagination?: {
    page?: number;
    per_page?: number;
    total_entries?: number;
    total_pages?: number;
  };
};

function displayPersonName(p: ApolloPerson): string {
  const full = p.name?.trim();
  if (full) return full;
  const fn = p.first_name?.trim() ?? "";
  const ln = p.last_name?.trim() ?? "";
  const joined = `${fn} ${ln}`.trim();
  return joined || "—";
}

function normalisePeople(raw: ApolloPerson[]) {
  return raw.map((p) => {
    const org = p.organization ?? null;
    return {
      id: p.id ?? "",
      personName: displayPersonName(p),
      title: p.title?.trim() ?? null,
      email: p.email?.trim() ?? null,
      linkedinUrl: p.linkedin_url?.trim() ?? null,
      city: p.city?.trim() ?? null,
      country: p.country?.trim() ?? null,
      organizationId: p.organization_id ?? org?.id ?? null,
      organizationName: org?.name?.trim() ?? null,
      organizationDomain: org?.primary_domain?.trim() ?? null,
      organizationWebsite: org?.website_url?.trim() ?? null,
      industryLabel: org?.industry?.trim() ?? null,
      estimatedEmployees: org?.estimated_num_employees ?? null,
    };
  });
}

function parseStringArray(v: unknown): string[] | undefined {
  if (v == null) return undefined;
  if (Array.isArray(v)) {
    const out = v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
    return out.length ? out : undefined;
  }
  if (typeof v === "string") {
    const out = v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return out.length ? out : undefined;
  }
  return undefined;
}

function parseIndustryTagIds(v: unknown): string[] | undefined {
  const raw = parseStringArray(v);
  if (!raw) return undefined;
  const ids = raw.filter((s) => s.length >= 8);
  return ids.length ? ids : undefined;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const apiKey = readApolloApiKeyFromEnv();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "APOLLO_API_KEY_NOT_CONFIGURED",
        hint: "Set APOLLO_API_KEY (or APOLLO_IO_API_KEY) in the server environment.",
      },
      { status: 503 },
    );
  }

  const page = Math.min(Math.max(Number(body.page ?? 1), 1), 500);
  const perPage = Math.min(Math.max(Number(body.per_page ?? 25), 1), 100);

  const q_organization_name =
    typeof body.q_organization_name === "string" ? body.q_organization_name.trim() : "";
  const organization_industry_tag_ids = parseIndustryTagIds(body.organization_industry_tag_ids);
  const organization_num_employees_ranges = parseStringArray(body.organization_num_employees_ranges);
  const person_locations = parseStringArray(body.person_locations);

  const apolloBody: Record<string, unknown> = {
    page,
    per_page: perPage,
  };

  if (q_organization_name) apolloBody.q_organization_name = q_organization_name;
  if (organization_industry_tag_ids?.length) {
    apolloBody.organization_industry_tag_ids = organization_industry_tag_ids;
  }
  if (organization_num_employees_ranges?.length) {
    apolloBody.organization_num_employees_ranges = organization_num_employees_ranges;
  }
  if (person_locations?.length) {
    apolloBody.person_locations = person_locations;
  }

  const res = await fetch(APOLLO_MIXED_PEOPLE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(apolloBody),
    cache: "no-store",
  });

  const rawText = await res.text().catch(() => "");
  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "APOLLO_REQUEST_FAILED",
        status: res.status,
        details: rawText.slice(0, 600),
      },
      { status: 502 },
    );
  }

  let data: ApolloMixedPeopleResponse;
  try {
    data = JSON.parse(rawText) as ApolloMixedPeopleResponse;
  } catch {
    return NextResponse.json({ ok: false, error: "APOLLO_INVALID_JSON" }, { status: 502 });
  }

  const peopleRaw = data.people ?? [];
  const people = normalisePeople(peopleRaw);
  const pag = data.pagination ?? {};

  return NextResponse.json({
    ok: true,
    people,
    pagination: {
      page: pag.page ?? page,
      per_page: pag.per_page ?? perPage,
      total_entries: pag.total_entries ?? people.length,
      total_pages: pag.total_pages ?? 1,
    },
    filtersApplied: {
      q_organization_name: q_organization_name || null,
      organization_industry_tag_ids: organization_industry_tag_ids ?? [],
      organization_num_employees_ranges: organization_num_employees_ranges ?? [],
      person_locations: person_locations ?? [],
    },
  });
}
