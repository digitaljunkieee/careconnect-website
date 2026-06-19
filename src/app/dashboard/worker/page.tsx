import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSIGNMENT_STATUS_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getWorkerDashboardData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

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

function SectionEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-5 py-8 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function StatusBlock({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/55 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const APPLICATION_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "soft"
> = {
  PENDING: "outline",
  ACCEPTED: "soft",
  REJECTED: "destructive",
  CANCELLED: "secondary"
};

function getAvailabilityStatus(
  isVerified: boolean,
  upcomingAssignmentsCount: number
): { label: string; variant: "soft" | "outline" | "secondary" } {
  if (!isVerified) {
    return { label: "Verification required", variant: "outline" };
  }

  if (upcomingAssignmentsCount > 0) {
    return { label: "Scheduled", variant: "secondary" };
  }

  return { label: "Open to shifts", variant: "soft" };
}

export default async function WorkerDashboardPage() {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const data = await getWorkerDashboardData(user.id);

  if (!data) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Complete your worker profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Finish your worker profile to start tracking shifts and applications.
          </p>
        </CardContent>
      </Card>
    );
  }

  const verificationVariant =
    data.verificationStatus === "VERIFIED"
      ? "soft"
      : data.verificationStatus === "IN_REVIEW"
        ? "outline"
        : data.verificationStatus === "REJECTED"
          ? "destructive"
          : "secondary";
  const availability = getAvailabilityStatus(
    data.isVerified,
    data.upcomingAssignmentsCount
  );

  return (
    <div className="space-y-5">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.85rem]">
              Welcome back, {data.firstName || "there"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Today&apos;s shifts, applications, and assignments.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric label="Open shifts" value={String(data.availableShiftsCount)} />
            <DashboardMetric label="Applications" value={String(data.totalApplicationsCount)} />
            <DashboardMetric
              label="Upcoming assignments"
              value={String(data.upcomingAssignmentsCount)}
            />
            <DashboardMetric
              label="Profile completion"
              value={`${data.profileCompletionPercent}%`}
            />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]">
        <div className="space-y-5">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
              <CardTitle className="text-lg">Available Shifts</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
              {data.availableShifts.length ? (
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40">
                  <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(7rem,0.9fr)_minmax(5.6rem,0.58fr)] border-b border-border/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <div>Role</div>
                    <div>Date</div>
                    <div>Rate</div>
                  </div>

                  <div className="divide-y divide-border/40">
                    {data.availableShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="grid grid-cols-[minmax(0,1.7fr)_minmax(7rem,0.9fr)_minmax(5.6rem,0.58fr)] items-center gap-3 px-4 py-4 text-sm transition-colors hover:bg-accent/35"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {shift.roleRequired}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {shift.facilityName} · {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                        <div className="min-w-0 whitespace-nowrap text-foreground/80">
                          {formatDate(shift.date)}
                        </div>
                        <div className="flex justify-start">
                          <Badge variant="secondary" className="rounded-full">
                            {shift.hourlyRateLabel}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <SectionEmpty>No live shifts are available right now.</SectionEmpty>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
              <CardTitle className="text-lg">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
              {data.recentApplications.length ? (
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40">
                  <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(7.5rem,0.92fr)_minmax(6.2rem,0.55fr)] border-b border-border/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <div>Role</div>
                    <div>Applied</div>
                    <div>Status</div>
                  </div>

                  <div className="divide-y divide-border/40">
                    {data.recentApplications.map((application) => (
                      <div
                        key={application.id}
                        className="grid grid-cols-[minmax(0,1.7fr)_minmax(7.5rem,0.92fr)_minmax(6.2rem,0.55fr)] items-center gap-3 px-4 py-4 text-sm transition-colors hover:bg-accent/35"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {application.roleRequired}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {application.facilityName} · {formatDate(application.shiftDate)} ·{" "}
                            {application.startTime} - {application.endTime}
                          </p>
                        </div>
                        <div className="min-w-0 whitespace-nowrap text-foreground/80">
                          {formatDate(application.appliedAt)}
                        </div>
                        <div className="flex justify-start">
                          <Badge
                            className="rounded-full"
                            variant={
                              APPLICATION_STATUS_VARIANTS[application.status] ?? "secondary"
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <SectionEmpty>You have not applied to any shifts yet.</SectionEmpty>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="h-fit self-start border-border/70 bg-card/88 shadow-sm">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
              <CardTitle className="text-lg">Worker Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
              <StatusBlock label="Verification Status">
                <Badge className="rounded-full" variant={verificationVariant}>
                  {VERIFICATION_STATUS_LABELS[data.verificationStatus]}
                </Badge>
              </StatusBlock>

              <StatusBlock label="Profile Completion">
                <div className="text-lg font-semibold tracking-tight text-foreground">
                  {data.profileCompletionPercent}% complete
                </div>
              </StatusBlock>

              <StatusBlock label="Availability Status">
                <Badge className="rounded-full" variant={availability.variant}>
                  {availability.label}
                </Badge>
              </StatusBlock>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
              <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
              {data.upcomingAssignments.length ? (
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40">
                  <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(5.75rem,0.7fr)] border-b border-border/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <div>Facility</div>
                    <div>Status</div>
                  </div>

                  <div className="divide-y divide-border/40">
                    {data.upcomingAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="grid grid-cols-[minmax(0,1.5fr)_minmax(5.75rem,0.7fr)] items-center gap-3 px-4 py-4 text-sm transition-colors hover:bg-accent/35"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {assignment.facilityName}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {assignment.date} · {assignment.startTime} - {assignment.endTime}
                          </p>
                        </div>
                        <div className="flex justify-start">
                          <Badge className="rounded-full" variant="soft">
                            {
                              ASSIGNMENT_STATUS_LABELS[
                                assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                              ]
                            }
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <SectionEmpty>No upcoming assignments yet.</SectionEmpty>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
