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
import { getAdminPaymentListData } from "@/lib/admin-platform";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

type PaymentsPageProps = {
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

export default async function AdminPaymentsPage({
  searchParams
}: PaymentsPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(firstQueryValue(params.pageSize), 10);
  const search = firstQueryValue(params.search);
  const status = firstQueryValue(params.status);
  const dateFrom = firstQueryValue(params.dateFrom);
  const dateTo = firstQueryValue(params.dateTo);

  const data = await getAdminPaymentListData({
    page,
    pageSize,
    search,
    status: status && status !== "ALL" ? (status as (typeof PAYMENT_STATUSES)[number]) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  });

  const exportParams = new URLSearchParams();
  if (search) exportParams.set("search", search);
  if (status) exportParams.set("status", status);
  if (dateFrom) exportParams.set("dateFrom", dateFrom);
  if (dateTo) exportParams.set("dateTo", dateTo);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.total}</CardTitle>
            <CardDescription>Total payments</CardDescription>
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>
                Track payment records, statuses, and export the filtered list as CSV.
              </CardDescription>
            </div>
            <Button asChild className="rounded-2xl" variant="outline">
              <Link href={`/api/admin/payments/export?${exportParams.toString()}`}>
                Export CSV
              </Link>
            </Button>
          </div>
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
                placeholder="Payment reference, shift, facility"
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
                {PAYMENT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {PAYMENT_STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dateFrom">
                Date from
              </label>
              <Input id="dateFrom" name="dateFrom" type="date" defaultValue={dateFrom} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dateTo">
                Date to
              </label>
              <Input id="dateTo" name="dateTo" type="date" defaultValue={dateTo} />
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Apply filters
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/payments">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
          <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            {data.rows.length
              ? "The filtered dataset is ready for review or export."
              : "No payments match the current filters. Broaden the date range or clear the search field."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Payment Reference</th>
                    <th className="px-4 py-3 font-medium">Shift</th>
                    <th className="px-4 py-3 font-medium">Facility</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Payment Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-4 font-mono text-xs">{row.stripeSessionId}</td>
                      <td className="px-4 py-4">{row.shiftLabel}</td>
                      <td className="px-4 py-4">{row.facilityName}</td>
                      <td className="px-4 py-4">{row.amountLabel}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">{PAYMENT_STATUS_LABELS[row.status]}</Badge>
                      </td>
                      <td className="px-4 py-4">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No payments match the current filters. Broaden the date range or clear the search field." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
