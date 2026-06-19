import Link from "next/link";
import { headers } from "next/headers";
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
import { PaginationControls } from "@/components/pagination-controls";
import { getAdminComplianceReportData } from "@/lib/admin-platform";
import { formatDateTime } from "@/lib/format";
import {
  buildPageHref,
  getResponsivePageSize,
  paginateItems,
  parsePage
} from "@/lib/pagination";

type ComplianceReportPageProps = {
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

export default async function AdminComplianceReportPage({
  searchParams
}: ComplianceReportPageProps) {
  const params = (await searchParams) ?? {};
  const dateFrom = firstQueryValue(params.dateFrom);
  const dateTo = firstQueryValue(params.dateTo);
  const pageSize = getResponsivePageSize((await headers()).get("user-agent"));
  const documentsPage = parsePage(firstQueryValue(params.documentsPage));
  const activityPage = parsePage(firstQueryValue(params.activityPage));

  const data = await getAdminComplianceReportData({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  });

  const expiringDocuments = paginateItems(data.expiringDocuments, documentsPage, pageSize);
  const workerActivity = paginateItems(data.workerActivity, activityPage, pageSize);
  const basePath = "/dashboard/admin/reports/compliance";
  const query = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    documentsPage: String(expiringDocuments.page),
    activityPage: String(workerActivity.page),
    pageSize: String(pageSize)
  };

  const exportParams = new URLSearchParams();
  if (dateFrom) exportParams.set("dateFrom", dateFrom);
  if (dateTo) exportParams.set("dateTo", dateTo);
  exportParams.set("format", "csv");

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Compliance report</CardTitle>
              <CardDescription>
                Review expiring documents and worker activity over a date range.
              </CardDescription>
            </div>
            <Button asChild className="rounded-2xl" variant="outline">
              <Link href={`/api/admin/reports/compliance?${exportParams.toString()}`}>Download CSV</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-6" method="get">
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
                Update report
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/reports/compliance">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Expiring documents</CardTitle>
            <CardDescription>Documents that expire within the selected date range.</CardDescription>
          </CardHeader>
          <CardContent>
            {expiringDocuments.rows.length ? (
              <>
                <div className="overflow-hidden rounded-3xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Worker</th>
                        <th className="px-4 py-3 font-medium">Document</th>
                        <th className="px-4 py-3 font-medium">Expires At</th>
                        <th className="px-4 py-3 font-medium">Days Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringDocuments.rows.map((document) => (
                        <tr key={`${document.workerName}-${document.documentName}`} className="border-t border-border/60">
                          <td className="px-4 py-4">
                            <div className="font-medium">{document.workerName}</div>
                            <div className="text-xs text-muted-foreground">{document.workerEmail}</div>
                          </td>
                          <td className="px-4 py-4">{document.documentName}</td>
                          <td className="px-4 py-4">{formatDateTime(document.expiresAt)}</td>
                          <td className="px-4 py-4">
                            <Badge variant={document.daysRemaining <= 7 ? "destructive" : "outline"}>
                              {document.daysRemaining} days
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  className="mt-4"
                  nextHref={buildPageHref(
                    basePath,
                    query,
                    Math.min(expiringDocuments.page + 1, expiringDocuments.pageCount),
                    "documentsPage"
                  )}
                  page={expiringDocuments.page}
                  pageCount={expiringDocuments.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    query,
                    Math.max(expiringDocuments.page - 1, 1),
                    "documentsPage"
                  )}
                />
              </>
            ) : (
              <EmptyState label="No expiring documents were found in the selected range. Try widening the date range to review more records." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Worker activity</CardTitle>
            <CardDescription>Application and assignment activity within the selected range.</CardDescription>
          </CardHeader>
          <CardContent>
            {workerActivity.rows.length ? (
              <>
                <div className="space-y-3">
                  {workerActivity.rows.map((entry) => (
                    <div key={`${entry.workerName}-${entry.workerEmail}`} className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-medium">{entry.workerName}</div>
                          <div className="text-sm text-muted-foreground">{entry.workerEmail}</div>
                        </div>
                        <Badge variant="soft">
                          {entry.applications} applications / {entry.assignments} assignments
                        </Badge>
                      </div>
                      <div className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Last activity {formatDateTime(entry.lastActivityAt)}
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationControls
                  className="mt-4"
                  nextHref={buildPageHref(
                    basePath,
                    query,
                    Math.min(workerActivity.page + 1, workerActivity.pageCount),
                    "activityPage"
                  )}
                  page={workerActivity.page}
                  pageCount={workerActivity.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    query,
                    Math.max(workerActivity.page - 1, 1),
                    "activityPage"
                  )}
                />
              </>
            ) : (
              <EmptyState label="No worker activity records were found in the selected range. Try widening the date range to review more records." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
