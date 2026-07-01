import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight, Activity, ShieldCheck, CalendarDays, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/pagination-controls";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { getAdminActivityLogData } from "@/lib/admin-platform";
import { buildPageHref, getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";
import { formatDateTime } from "@/lib/format";

type ActivityLogPageProps = {
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

const ranges = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" }
] as const;

export default async function AdminActivityLogPage({ searchParams }: ActivityLogPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(
    firstQueryValue(params.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const range = firstQueryValue(params.range, "7d") as "today" | "7d" | "30d";

  const data = await getAdminActivityLogData({
    page,
    pageSize,
    range
  });

  const query = {
    range: range || undefined,
    pageSize: String(pageSize)
  };
  const paginationBasePath = "/dashboard/admin/activity-log";

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total events",
            value: data.summary.total,
            icon: Activity
          },
          {
            label: "Verifications",
            value: data.summary.verifications,
            icon: ShieldCheck
          },
          {
            label: "Shifts",
            value: data.summary.shifts,
            icon: CalendarDays
          },
          {
            label: "Applications",
            value: data.summary.applications,
            icon: Receipt
          },
          {
            label: "Payments",
            value: data.summary.payments,
            icon: Receipt
          }
        ].map((item) => {
          const Icon = item.icon;

          return <AdminStatCard key={item.label} label={item.label} value={item.value} icon={Icon} />;
        })}
      </section>

      <Card className="border-border/70">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Activity log</CardTitle>
            <CardDescription>Every important admin event in one place.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {ranges.map((item) => (
              <Button
                key={item.value}
                asChild
                className="rounded-2xl"
                variant={range === item.value ? "default" : "outline"}
                size="sm"
              >
                <Link
                  href={buildPageHref(
                    paginationBasePath,
                    {
                      pageSize: String(pageSize),
                      range: item.value
                    },
                    1
                  )}
                >
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.rows.length ? (
            data.rows.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-border/70 bg-background/70 p-4 transition-colors hover:bg-[#13d9cb]/8"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.actionLabel}</Badge>
                      <Badge variant="secondary">{item.entityLabel}</Badge>
                    </div>
                    <div className="mt-3 font-medium">{item.detail}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.actorName} - {formatDateTime(item.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.href ? (
                      <Button asChild className="rounded-2xl" size="sm" variant="outline">
                        <Link href={item.href}>
                          Open
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState label="No activity matches this range yet." />
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
