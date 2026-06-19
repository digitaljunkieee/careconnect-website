import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight, ClipboardList, CircleCheckBig, CircleX, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/pagination-controls";
import { ApplicationActions } from "@/components/admin/application-actions";
import { getAdminApplicationListData } from "@/lib/admin-platform";
import { buildPageHref, getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

type ApplicationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstQueryValue(value: string | string[] | undefined, fallback = ""): string {
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

export default async function AdminApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(
    firstQueryValue(params.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const search = firstQueryValue(params.search);
  const status = firstQueryValue(params.status);

  const data = await getAdminApplicationListData({
    page,
    pageSize,
    search,
    status: status && status !== "ALL" ? (status as (typeof APPLICATION_STATUSES)[number]) : undefined
  });

  const query = {
    search: search || undefined,
    status: status || undefined,
    pageSize: String(pageSize)
  };
  const paginationBasePath = "/dashboard/admin/applications";

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Pending review",
            value: data.summary.pending,
            icon: Clock3
          },
          {
            label: "Approved",
            value: data.summary.accepted,
            icon: CircleCheckBig
          },
          {
            label: "Rejected",
            value: data.summary.rejected,
            icon: CircleX
          },
          {
            label: "Total applications",
            value: data.total,
            icon: ClipboardList
          }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="border-border/70">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{item.value}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-border/70">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Applicants</CardTitle>
            <CardDescription>Review worker applications and decide quickly.</CardDescription>
          </div>
          <Button asChild className="rounded-2xl" variant="outline">
            <Link href="/dashboard/admin/shifts">
              Review shifts
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(11rem,12rem)_auto]" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Worker, shift, or facility"
                defaultValue={search}
                className="h-10"
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
                    {APPLICATION_STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="rounded-2xl" type="submit">
                Filter
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/applications">Reset</Link>
              </Button>
            </div>
          </form>

          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/70">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Worker</th>
                    <th className="px-4 py-3 font-medium">Shift</th>
                    <th className="px-4 py-3 font-medium">Facility</th>
                    <th className="px-4 py-3 font-medium">Verification</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-4">
                        <div className="font-medium">{row.workerName}</div>
                        <div className="text-xs text-muted-foreground">{row.workerEmail}</div>
                      </td>
                      <td className="px-4 py-4">{row.shiftLabel}</td>
                      <td className="px-4 py-4">{row.facilityName}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">
                          {VERIFICATION_STATUS_LABELS[row.verificationStatus]}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="soft">{APPLICATION_STATUS_LABELS[row.status]}</Badge>
                      </td>
                      <td className="px-4 py-4">{formatDateTime(row.submittedAt)}</td>
                      <td className="px-4 py-4">
                        <ApplicationActions applicationId={row.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No applications match the current filters." />
          )}
        </CardContent>
      </Card>

      {data.rows.length ? (
        <PaginationControls
          nextHref={buildPageHref(
            paginationBasePath,
            query,
            Math.min(data.page + 1, data.pageCount)
          )}
          page={data.page}
          pageCount={data.pageCount}
          previousHref={buildPageHref(
            paginationBasePath,
            query,
            Math.max(data.page - 1, 1)
          )}
        />
      ) : null}
    </div>
  );
}
