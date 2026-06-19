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
import { WorkerApplicationsTable } from "@/components/worker/worker-applications-table";
import { getWorkerApplicationsData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";

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

export default async function WorkerApplicationsPage({
  searchParams
}: WorkerApplicationsPageProps) {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};

  const page = parsePage(firstQueryValue(resolvedSearchParams.page));
  const pageSize = parsePageSize(
    firstQueryValue(resolvedSearchParams.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const status = firstQueryValue(resolvedSearchParams.status);

  const data = await getWorkerApplicationsData(user.id, {
    page,
    pageSize,
    status: status || undefined
  });

  if (!data) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            Create your worker profile before viewing application history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/worker/profile">Complete profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Your applications</CardTitle>
          <CardDescription>
            Narrow the history by application status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2 sm:min-w-[16rem]">
              <label className="text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                defaultValue={status}
                id="status"
                name="status"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <Button className="rounded-2xl" type="submit">
              Apply filter
            </Button>
            <Button asChild className="rounded-2xl" variant="outline">
              <Link href="/dashboard/worker/applications">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <WorkerApplicationsTable
        basePath="/dashboard/worker/applications"
        page={data.page}
        pageCount={data.pageCount}
        query={{
          status: status || undefined,
          pageSize: String(pageSize)
        }}
        rows={data.rows}
      />
    </div>
  );
}
