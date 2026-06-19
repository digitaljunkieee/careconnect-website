import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminWorkersTable } from "@/components/admin/admin-workers-table";
import { VERIFICATION_STATUSES, VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { getAdminWorkerListData } from "@/lib/admin-data";
import { getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";

type WorkersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstQueryValue(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default async function AdminWorkersPage({ searchParams }: WorkersPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(
    firstQueryValue(params.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const search = firstQueryValue(params.search);
  const verificationStatus = firstQueryValue(params.verificationStatus);
  const activityStatus = firstQueryValue(params.activityStatus);

  const data = await getAdminWorkerListData({
    page,
    pageSize,
    search,
    verificationStatus:
      verificationStatus && verificationStatus !== "ALL"
        ? (verificationStatus as (typeof VERIFICATION_STATUSES)[number])
        : undefined,
    activityStatus:
      activityStatus && activityStatus !== "ALL"
        ? (activityStatus as "ACTIVE" | "INACTIVE")
        : undefined
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader className="space-y-2">
          <CardTitle>Workers</CardTitle>
          <CardDescription>Search worker accounts and keep their status current.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(11rem,12rem)_minmax(11rem,12rem)_auto]"
            method="get"
          >
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Worker name, email, or phone"
                defaultValue={search}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="verificationStatus">
                Verification
              </label>
              <select
                id="verificationStatus"
                name="verificationStatus"
                defaultValue={verificationStatus || "ALL"}
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
              >
                <option value="ALL">All</option>
                {VERIFICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {VERIFICATION_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="activityStatus">
                Status
              </label>
              <select
                id="activityStatus"
                name="activityStatus"
                defaultValue={activityStatus || "ALL"}
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="rounded-2xl" type="submit">
                Filter
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/workers">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AdminWorkersTable
        basePath="/dashboard/admin/workers"
        page={data.page}
        pageCount={data.pageCount}
        query={{
          search: search || undefined,
          verificationStatus: verificationStatus || undefined,
          activityStatus: activityStatus || undefined,
          pageSize: String(pageSize)
        }}
        rows={data.rows}
      />
    </div>
  );
}
