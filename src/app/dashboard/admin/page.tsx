import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Activity,
  Building2,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getAdminActivityLogData } from "@/lib/admin-platform";

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

const statCards = [
  {
    label: "Total workers",
    icon: Users
  },
  {
    label: "Verified workers",
    icon: ShieldCheck
  },
  {
    label: "Pending verifications",
    icon: ClipboardList
  },
  {
    label: "Facilities",
    icon: Building2
  },
  {
    label: "Open shifts",
    icon: CalendarDays
  },
  {
    label: "Filled shifts",
    icon: CalendarDays
  },
  {
    label: "Applications today",
    icon: Activity
  }
] as const;

export default async function AdminDashboardPage() {
  const [data, recentActivity] = await Promise.all([
    getAdminDashboardData(),
    getAdminActivityLogData({ page: 1, pageSize: 6, range: "7d" })
  ]);

  if (!data) {
    redirect("/login");
  }

  const pendingWorkerReviews = data.pendingVerificationQueue.length;
  const recentFacilitySignups = data.recentFacilityRegistrations.length;
  const applicationsToday = data.stats.applicationsToday;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Admin dashboard
                </div>
                <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome back, admin
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Monitor workers, facilities, verifications, shifts, and assignments from one
                  place.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-2xl">
                  <Link href="/dashboard/admin/shifts">
                    Review shifts
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild className="rounded-2xl" variant="outline">
                  <Link href="/dashboard/admin/verifications">Review verifications</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Open shifts", data.stats.openShifts],
                ["Pending reviews", data.stats.pendingVerifications],
                ["Applications today", applicationsToday]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-border/70 bg-background/70 px-4 py-3"
                >
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle>Pending items</CardTitle>
            <CardDescription>What needs attention right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Pending worker reviews",
                value: pendingWorkerReviews,
                href: "/dashboard/admin/verifications"
              },
              {
                label: "Recent facility signups",
                value: recentFacilitySignups,
                href: "/dashboard/admin/facilities"
              },
              {
                label: "Open shifts",
                value: data.stats.openShifts,
                href: "/dashboard/admin/shifts"
              },
              {
                label: "Pending payments",
                value: data.stats.pendingPayments,
                href: "/dashboard/admin/payments"
              }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/70 px-4 py-3 transition-colors hover:bg-[#13d9cb]/8"
              >
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">View details</div>
                </div>
                <div className="text-2xl font-semibold text-primary">{item.value}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {statCards.map((card) => {
          const value =
            card.label === "Total workers"
              ? data.stats.totalWorkers
              : card.label === "Verified workers"
                ? data.stats.verifiedWorkers
                : card.label === "Pending verifications"
                  ? data.stats.pendingVerifications
                  : card.label === "Facilities"
                    ? data.stats.totalFacilities
                    : card.label === "Open shifts"
                      ? data.stats.openShifts
                      : card.label === "Filled shifts"
                        ? data.stats.filledShifts
                        : applicationsToday;
          const Icon = card.icon;

          return (
            <Card key={card.label} className="border-border/70">
              <CardContent className="flex h-full items-start justify-between gap-3 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {card.label}
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{value}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>The latest operational events across the platform.</CardDescription>
            </div>
            <Button asChild className="rounded-2xl" variant="outline" size="sm">
              <Link href="/dashboard/admin/activity-log">
                Activity log
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.rows.length ? (
              recentActivity.rows.map((item) => (
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
                      <div className="mt-3 text-sm font-medium">{item.detail}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.actorName} - {formatDateTime(item.createdAt)}
                      </div>
                    </div>
                    {item.href ? (
                      <Button asChild className="rounded-2xl" size="sm" variant="outline">
                        <Link href={item.href}>Open</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="No activity yet. Events will appear here as the platform is used." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle>Recent queue</CardTitle>
            <CardDescription>Pending items that need a decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.pendingVerificationQueue.length ? (
              data.pendingVerificationQueue.map((item) => (
                <div key={item.id} className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.workerName}</div>
                      <div className="text-sm text-muted-foreground">
                        Submitted {formatDateTime(item.submittedAt)}
                      </div>
                    </div>
                    <Badge variant="outline">{item.documentCount} docs</Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="No worker reviews are waiting right now." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
