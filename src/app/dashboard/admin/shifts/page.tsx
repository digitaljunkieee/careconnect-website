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
import { ShiftActions } from "@/components/admin/shift-actions";
import {
  SHIFT_STATUSES,
  SHIFT_STATUS_LABELS
} from "@/lib/constants";
import { getAdminShiftListData } from "@/lib/admin-platform";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { formatDateTime } from "@/lib/format";

type ShiftsPageProps = {
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

export default async function AdminShiftsPage({
  searchParams
}: ShiftsPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(firstQueryValue(params.pageSize), 10);
  const search = firstQueryValue(params.search);
  const status = firstQueryValue(params.status);

  const data = await getAdminShiftListData({
    page,
    pageSize,
    search,
    status: status && status !== "ALL" ? (status as (typeof SHIFT_STATUSES)[number]) : undefined
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.total}</CardTitle>
            <CardDescription>Total shifts</CardDescription>
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
          <CardTitle>Shift Oversight</CardTitle>
          <CardDescription>Track shifts, assigned workers, and operational actions.</CardDescription>
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
                placeholder="Shift ID, facility, role, worker"
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
                {SHIFT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {SHIFT_STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Apply filters
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/shifts">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Shifts</CardTitle>
          <CardDescription>
            {data.rows.length
              ? "Cancel or reassign shifts directly from the row actions."
              : "No shifts match the current filters. Try a broader search or change the status filter."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Shift ID</th>
                    <th className="px-4 py-3 font-medium">Facility</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Assigned Worker</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-4 font-mono text-xs">{row.shiftId}</td>
                      <td className="px-4 py-4">{row.facilityName}</td>
                      <td className="px-4 py-4">{formatDateTime(row.date)}</td>
                      <td className="px-4 py-4">{row.roleRequired}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">{SHIFT_STATUS_LABELS[row.status]}</Badge>
                      </td>
                      <td className="px-4 py-4">{row.assignedWorker}</td>
                      <td className="px-4 py-4">
                        <ShiftActions
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
            <EmptyState label="No shifts match the current filters. Try a broader search or change the status filter." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
