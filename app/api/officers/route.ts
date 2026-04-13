import { NextResponse } from "next/server";

import { classifyPersonNameMatch } from "@/lib/apollo-person-match";
import { fetchPrimaryDirectorName } from "@/lib/companies-house-officers";
import {
  COMPANIES_HOUSE_USER_AGENT,
  companiesHouseBasicAuthHeader,
  readCompaniesHouseApiKeyFromEnv,
} from "@/lib/companies-house-api-key";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COMPANY_NO_RE = /^[A-Za-z0-9]{6,12}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyNumber = (url.searchParams.get("company_number") ?? "").trim();
  const apolloName = (url.searchParams.get("apollo_name") ?? "").trim();

  if (!companyNumber) {
    return NextResponse.json(
      { ok: false, error: "MISSING_COMPANY_NUMBER" },
      { status: 400 },
    );
  }
  if (!COMPANY_NO_RE.test(companyNumber)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_COMPANY_NUMBER" },
      { status: 400 },
    );
  }
  if (!apolloName) {
    return NextResponse.json(
      { ok: false, error: "MISSING_APOLLO_NAME" },
      { status: 400 },
    );
  }

  const apiKey = readCompaniesHouseApiKeyFromEnv();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing COMPANIES_HOUSE_API_KEY" },
      { status: 500 },
    );
  }

  const authHeader = companiesHouseBasicAuthHeader(apiKey);
  const directorName = await fetchPrimaryDirectorName(
    companyNumber,
    authHeader,
    COMPANIES_HOUSE_USER_AGENT,
  );

  if (!directorName) {
    return NextResponse.json({
      ok: true,
      companyNumber,
      directorName: null,
      apolloName,
      match: "unverified" as const,
      hint: "No active director-class officer returned from Companies House.",
    });
  }

  const match = classifyPersonNameMatch(directorName, apolloName);

  return NextResponse.json({
    ok: true,
    companyNumber,
    directorName,
    apolloName,
    match,
  });
}
