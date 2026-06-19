import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight, CalendarDays, CheckCircle2, CircleSlash, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/pagination-controls";
import { ShiftActions } from "@/components/admin/shift-actions";
import { SHIFT_STATUSES, SHIFT_STATUS_LABELS } from "@/lib/constants";
import { getAdminShiftListData } from "@/lib/admin-platform";
import { buildPageHref, getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";
import { formatDateTime } from "@/lib/format";

type ShiftsPageProps = {
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

export default async function AdminShiftsPage({ searchParams }: ShiftsPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(
    firstQueryValue(params.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const search = firstQueryValue(params.search);
  const status = firstQueryValue(params.status);

  const data = await getAdminShiftListData({
    page,
    pageSize,
    search,
    status: status && status !== "ALL" ? (status as (typeof SHIFT_STATUSES)[number]) : undefined
  });

  const query = {
    search: search || undefined,
    status: status || undefined,
    pageSize: String(pageSize)
  };
  const paginationBasePath = "/dashboard/admin/shifts";

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Open", data.summary.open, CalendarDays],
          ["Filled", data.summary.filled, CheckCircle2],
          ["Closed", data.summary.closed, CircleSlash],
          ["Total", data.total, DollarSign]
        ].map(([label, value, icon]) => {
          const Icon = icon as typeof CalendarDays;

          return (
            <Card key={label as string} className="border-border/70">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {label as string}
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{value as number}</div>
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
            <CardTitle>Shifts</CardTitle>
            <CardDescription>Track live coverage, applicants, and shift status.</CardDescription>
          </div>
          <Button asChild className="rounded-2xl" variant="outline">
            <Link href="/dashboard/admin/assignments">
              Manual assignment
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(11rem,12rem)_auto]"
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
                placeholder="Shift, facility, or role"
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
                {SHIFT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {SHIFT_STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="rounded-2xl" type="submit">
                Filter
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/shifts">Reset</Link>
              </Button>
            </div>
          </form>

          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/70">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Applicants</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-4">
                        <div className="font-medium">{row.roleRequired}</div>
                        <div className="text-xs text-muted-foreground">{row.facilityName}</div>
                      </td>
                      <td className="px-4 py-4">{formatDateTime(row.date)}</td>
                      <td className="px-4 py-4">{row.hourlyRateLabel}</td>
                      <td className="px-4 py-4">
                        <Badge variant="soft">{SHIFT_STATUS_LABELS[row.status]}</Badge>
                      </td>
                      <td className="px-4 py-4">{row.applicationCount}</td>
                      <td className="px-4 py-4">
                        <ShiftActions
                          applicationCount={row.applicationCount}
                          shiftId={row.id}
                          status={row.status}
                          workers={data.workers}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No shifts match the current filters." />
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
