import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getDashboardSearchData } from "@/lib/dashboard-search";
import { DashboardSearchResultsShell } from "@/components/dashboard/search-results-shell";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstQueryValue(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default async function FacilitySearchPage({ searchParams }: SearchPageProps) {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const q = firstQueryValue(params.q);
  const data = await getDashboardSearchData("FACILITY", user.id, q);

  return (
    <DashboardSearchResultsShell
      title="Search"
      description="Search shifts, applicants, and facility profile details."
      placeholder="Search by role, applicant name, date, status, or contact detail"
      query={q}
      searchPath="/dashboard/facility/search"
      sections={data.sections}
    />
  );
}
