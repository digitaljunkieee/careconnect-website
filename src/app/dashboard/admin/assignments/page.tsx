import { headers } from "next/headers";
import { ArrowUpRight, CalendarDays, Users, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/pagination-controls";
import { AssignWorkerDialog } from "@/components/admin/assign-worker-dialog";
import { getAdminShiftListData } from "@/lib/admin-platform";
import { buildPageHref, getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";
import { SHIFT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

type AssignmentsPageProps = {
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

export default async function AdminAssignmentsPage({ searchParams }: AssignmentsPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(
    firstQueryValue(params.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );

  const data = await getAdminShiftListData({
    page,
    pageSize,
    search: firstQueryValue(params.search),
    status: "OPEN"
  });

  const query = {
    search: firstQueryValue(params.search) || undefined,
    pageSize: String(pageSize),
    status: "OPEN"
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Open shifts",
            value: data.total,
            icon: CalendarDays
          },
          {
            label: "Verified workers",
            value: data.workers.length,
            icon: UserCheck
          },
          {
            label: "Assignments ready",
            value: data.rows.length,
            icon: Users
          },
          {
            label: "Current page",
            value: data.page,
            icon: ArrowUpRight
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

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Open shifts</CardTitle>
              <CardDescription>
                Pick a verified worker and assign them directly from the row.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {data.rows.length ? (
              <div className="overflow-hidden rounded-3xl border border-border/70">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Facility</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Applicants</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row) => (
                      <tr key={row.id} className="border-t border-border/60">
                        <td className="px-4 py-4 font-medium">{row.facilityName}</td>
                        <td className="px-4 py-4">{row.roleRequired}</td>
                        <td className="px-4 py-4">{formatDateTime(row.date)}</td>
                        <td className="px-4 py-4">{row.applicationCount}</td>
                        <td className="px-4 py-4">
                          <Badge variant="soft">{SHIFT_STATUS_LABELS[row.status]}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <AssignWorkerDialog shiftId={row.id} workers={data.workers} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState label="No open shifts match the current search." />
            )}

            {data.rows.length ? (
              <PaginationControls
                className="mt-4"
                nextHref={buildPageHref(
                  "/dashboard/admin/assignments",
                  query,
                  Math.min(data.page + 1, data.pageCount)
                )}
                page={data.page}
                pageCount={data.pageCount}
                previousHref={buildPageHref(
                  "/dashboard/admin/assignments",
                  query,
                  Math.max(data.page - 1, 1)
                )}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Verified workers</CardTitle>
            <CardDescription>
              Workers available for manual assignment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.workers.length ? (
              data.workers.slice(0, 10).map((worker) => (
                <div key={worker.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <div className="font-medium">{worker.name}</div>
                  <div className="text-sm text-muted-foreground">{worker.email}</div>
                </div>
              ))
            ) : (
              <EmptyState label="No verified workers are available yet." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
