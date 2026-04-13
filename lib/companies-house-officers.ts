/**
 * Companies House: list officers for a company, pick a primary director name from the register.
 */

type OfficerListItem = {
  name?: string;
  officer_role?: string;
  resigned_on?: string;
};

type OfficersListResponse = {
  items?: OfficerListItem[];
};

export async function fetchPrimaryDirectorName(
  companyNumber: string,
  authHeader: string,
  userAgent: string,
): Promise<string | null> {
  const url = new URL(
    `https://api.company-information.service.gov.uk/company/${encodeURIComponent(companyNumber)}/officers`,
  );
  url.searchParams.set("items_per_page", "100");

  const res = await fetch(url, {
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as OfficersListResponse;
  const items = data.items ?? [];
  const active = items.filter((o) => !o.resigned_on && o.name);

  const personDirector = active.find((o) => o.officer_role === "director");
  if (personDirector?.name) return personDirector.name.trim();

  const anyDirector = active.find(
    (o) =>
      typeof o.officer_role === "string" &&
      o.officer_role.toLowerCase().includes("director") &&
      o.name,
  );
  return anyDirector?.name?.trim() ?? null;
}
