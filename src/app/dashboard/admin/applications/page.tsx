import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAdminApplicationListData } from "@/lib/admin-platform";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

type ApplicationsPageProps = {
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default async function AdminApplicationsPage({
  searchParams
}: ApplicationsPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(firstQueryValue(params.pageSize), 10);
  const search = firstQueryValue(params.search);
  const status = firstQueryValue(params.status);

  const data = await getAdminApplicationListData({
    page,
    pageSize,
    search,
    status: status && status !== "ALL" ? (status as (typeof APPLICATION_STATUSES)[number]) : undefined
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.total}</CardTitle>
            <CardDescription>Total applications</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.page}</CardTitle>
            <CardDescription>Current page</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.pageCount}</CardTitle>
            <CardDescription>Total pages</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Application Monitoring</CardTitle>
          <CardDescription>Search through submitted applications and status changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-6" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Worker, facility, or shift"
                defaultValue={search}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
                defaultValue={status || "ALL"}
                id="status"
                name="status"
              >
                <option value="ALL">All</option>
                {APPLICATION_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Apply filters
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/applications">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            {data.rows.length
              ? "The current filters are showing application records."
              : "No applications match the current filters. Try widening the search or changing the status filter."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Worker</th>
                    <th className="px-4 py-3 font-medium">Facility</th>
                    <th className="px-4 py-3 font-medium">Shift</th>
                    <th className="px-4 py-3 font-medium">Application Status</th>
                    <th className="px-4 py-3 font-medium">Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-4">
                        <div className="font-medium">{row.workerName}</div>
                        <div className="text-xs text-muted-foreground">{row.workerEmail}</div>
                      </td>
                      <td className="px-4 py-4">{row.facilityName}</td>
                      <td className="px-4 py-4">{row.shiftLabel}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">{row.status}</Badge>
                      </td>
                      <td className="px-4 py-4">{formatDateTime(row.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No applications match the current filters. Try widening the search or changing the status filter." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
