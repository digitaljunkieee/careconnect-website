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

export default async function WorkerSearchPage({ searchParams }: SearchPageProps) {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const q = firstQueryValue(params.q);
  const data = await getDashboardSearchData("WORKER", user.id, q);

  return (
    <DashboardSearchResultsShell
      title="Search"
      description="Search your shifts, applications, assignments, and profile details."
      placeholder="Search by facility, role, date, status, or profile detail"
      query={q}
      searchPath="/dashboard/worker/search"
      sections={data.sections}
    />
  );
}
