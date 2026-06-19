import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ChevronRight, ClipboardList, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FacilityCreateShiftDialog } from "@/components/facility/create-shift-dialog";
import { SHIFT_STATUS_LABELS } from "@/lib/constants";
import { getFacilityDashboardData } from "@/lib/facility-portal";
import { formatDate } from "@/lib/format";
import { requireSessionUser } from "@/lib/auth-helpers";
import { parsePage } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type FacilityDashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const UPCOMING_SHIFT_PAGE_SIZE = 5;

const QUICK_ACTIONS = [
  {
    href: "/dashboard/facility/applicants",
    label: "Review Applications",
    icon: ClipboardList
  },
  {
    href: "/dashboard/facility/shifts",
    label: "View Shifts",
    icon: CalendarDays
  },
  {
    href: "/dashboard/facility/profile",
    label: "Update Profile",
    icon: Settings
  }
] as const;

function firstQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function DashboardMetric({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[96px] flex-col justify-between rounded-2xl border border-border/50 bg-card/85 px-4 py-3 shadow-sm",
        accent && "border-[#13d9cb]/20 bg-[#13d9cb]/5"
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="text-[1.55rem] font-semibold tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  href
}: {
  children: string;
  disabled: boolean;
  href: string;
}) {
  const className =
    "h-9 rounded-xl border-border/70 bg-background/55 px-3 text-sm font-medium shadow-none hover:bg-accent/70 hover:text-foreground";

  if (disabled) {
    return (
      <Button className={className} disabled variant="outline">
        {children}
      </Button>
    );
  }

  return (
    <Button asChild className={className} variant="outline">
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export default async function FacilityDashboardPage({
  searchParams
}: FacilityDashboardPageProps) {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const upcomingPage = parsePage(firstQueryValue(resolvedSearchParams.upcomingPage));

  const data = await getFacilityDashboardData(user.id, {
    upcomingPage,
    upcomingPageSize: UPCOMING_SHIFT_PAGE_SIZE
  });

  if (!data) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Complete your facility profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Finish your facility profile to start posting shifts and reviewing applicants.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard/facility/profile">Complete profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dashboardName = data.companyName.trim() || "NextCorp";
  const upcomingHref = (nextPage: number) =>
    nextPage > 1
      ? `/dashboard/facility?upcomingPage=${nextPage}`
      : "/dashboard/facility";

  return (
    <div className="space-y-5">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.85rem]">
                Welcome back, {dashboardName}
              </h1>
              <p className="text-sm text-muted-foreground">Today&apos;s staffing overview.</p>
            </div>

            <FacilityCreateShiftDialog
              openShiftsCount={data.openShiftsCount}
              pendingApplicationsCount={data.pendingApplicationsCount}
              profileCompletionPercent={data.profileCompletionPercent}
              triggerLabel="Create Shift"
              triggerSize="sm"
              triggerVariant="outline"
              triggerClassName="h-10 rounded-xl border-transparent bg-[#076c82] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#065a6b] hover:text-white"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric label="Live shifts" value={String(data.openShiftsCount)} />
            <DashboardMetric
              accent={data.pendingApplicationsCount > 0}
              label="Pending reviews"
              value={String(data.pendingApplicationsCount)}
            />
            <DashboardMetric
              label="Filled this week"
              value={String(data.filledThisWeekCount)}
            />
            <DashboardMetric
              label="Profile completion"
              value={`${data.profileCompletionPercent}%`}
            />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-5 xl:items-start xl:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.55fr)]">
        <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
            <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            {data.upcomingShifts.length ? (
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40">
                <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(5.75rem,0.82fr)_minmax(4.5rem,0.5fr)_minmax(5rem,0.45fr)] border-b border-border/60 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-4">
                  <div>Role</div>
                  <div>Date</div>
                  <div>Rate</div>
                  <div>Status</div>
                </div>

                <div className="divide-y divide-border/40">
                  {data.upcomingShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="grid grid-cols-[minmax(0,1.5fr)_minmax(5.75rem,0.82fr)_minmax(4.5rem,0.5fr)_minmax(5rem,0.45fr)] items-center px-3 py-4 text-[13px] transition-colors hover:bg-accent/35 sm:px-4 sm:text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{shift.roleRequired}</p>
                      </div>
                      <div className="min-w-0 whitespace-nowrap text-foreground/80">
                        {formatDate(shift.date)}
                      </div>
                      <div className="min-w-0 whitespace-nowrap text-foreground/80">
                        {shift.hourlyRateLabel}
                      </div>
                      <div className="min-w-0 whitespace-nowrap">
                        <Badge
                          variant="soft"
                          className="h-6 rounded-full px-2 text-[11px] font-semibold tracking-[0.12em]"
                        >
                          {SHIFT_STATUS_LABELS[shift.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-background/40 px-5 py-10 text-center">
                <p className="text-sm font-medium text-foreground">No shifts yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Create a shift to start receiving applications.
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-border/60 pt-4">
              <div>
                <PaginationButton
                  disabled={data.upcomingShiftsPage <= 1}
                  href={upcomingHref(Math.max(data.upcomingShiftsPage - 1, 1))}
                >
                  Previous
                </PaginationButton>
              </div>

              <div className="justify-self-center text-xs font-medium text-muted-foreground sm:text-sm">
                Page {data.upcomingShiftsPage} of {data.upcomingShiftsPageCount}
              </div>

              <div className="justify-self-end">
                <PaginationButton
                  disabled={data.upcomingShiftsPage >= data.upcomingShiftsPageCount}
                  href={upcomingHref(Math.min(data.upcomingShiftsPage + 1, data.upcomingShiftsPageCount))}
                >
                  Next
                </PaginationButton>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit self-start border-border/70 bg-card/88 shadow-sm">
          <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  className="group flex h-11 items-center justify-between rounded-xl border border-border/60 bg-background/55 px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-border/80 hover:bg-accent/35 hover:text-foreground"
                  href={action.href}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card/80 text-[#13d9cb]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{action.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
