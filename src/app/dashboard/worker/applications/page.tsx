import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  WorkerApplicationsMarketplace
} from "@/components/worker/worker-applications-marketplace";
import { getWorkerApplicationsData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getResponsivePageSize, parsePage } from "@/lib/pagination";

type WorkerApplicationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function normalizeApplicationStatus(value: string) {
  if (value === "PENDING" || value === "ACCEPTED" || value === "REJECTED") {
    return value;
  }

  return "all";
}

export default async function WorkerApplicationsPage({
  searchParams
}: WorkerApplicationsPageProps) {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(resolvedSearchParams.page));
  const pageSize = getResponsivePageSize((await headers()).get("user-agent"));
  const status = normalizeApplicationStatus(firstQueryValue(resolvedSearchParams.status));
  const search = firstQueryValue(resolvedSearchParams.search).trim();

  const data = await getWorkerApplicationsData(user.id, {
    page,
    pageSize,
    status: status === "all" ? undefined : status,
    search
  });

  if (!data) {
    return (
      <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="text-2xl text-white">My applications</CardTitle>
          <CardDescription className="text-white/65">
            Complete your worker profile before browsing application history.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <Button asChild className="rounded-2xl bg-[#076c82] text-white hover:bg-[#13d9cb]">
            <Link href="/dashboard/worker/profile">Go to profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <WorkerApplicationsMarketplace
      basePath="/dashboard/worker/applications"
      page={data.page}
      pageCount={data.pageCount}
      query={{
        pageSize: String(pageSize),
        search,
        status
      }}
      rows={data.rows}
      statusCounts={data.statusCounts}
      totalCount={data.total}
    />
  );
}
