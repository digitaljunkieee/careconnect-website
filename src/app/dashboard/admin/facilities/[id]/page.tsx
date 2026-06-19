import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/pagination-controls";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/format";
import { SHIFT_STATUS_LABELS, WORKER_ROLE_TYPE_LABELS } from "@/lib/constants";
import { getAdminFacilityDetailData } from "@/lib/admin-data";
import {
  buildPageHref,
  getResponsivePageSize,
  paginateItems,
  parsePage
} from "@/lib/pagination";

type FacilityDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function firstQueryValue(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default async function AdminFacilityDetailPage({
  params,
  searchParams
}: FacilityDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const data = await getAdminFacilityDetailData(id);

  if (!data) {
    notFound();
  }

  const pageSize = getResponsivePageSize((await headers()).get("user-agent"));
  const workersPage = parsePage(firstQueryValue(resolvedSearchParams.workersPage));
  const applicationsPage = parsePage(firstQueryValue(resolvedSearchParams.applicationsPage));
  const shiftsPage = parsePage(firstQueryValue(resolvedSearchParams.shiftsPage));
  const workers = paginateItems(data.workersUsed, workersPage, pageSize);
  const applications = paginateItems(data.applications, applicationsPage, pageSize);
  const shifts = paginateItems(data.shifts, shiftsPage, pageSize);
  const basePath = `/dashboard/admin/facilities/${id}`;
  const buildSharedQuery = (
    nextWorkersPage: number,
    nextApplicationsPage: number,
    nextShiftsPage: number
  ) => ({
    workersPage: String(nextWorkersPage),
    applicationsPage: String(nextApplicationsPage),
    shiftsPage: String(nextShiftsPage),
    pageSize: String(pageSize)
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden border-border/70">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.14),transparent_24%),linear-gradient(135deg,rgba(40,20,0,0.96),rgba(146,64,14,0.88))] p-6 text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Badge className="rounded-full bg-white/15 text-white" variant="outline">
                  Facility detail
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
                  {data.company.companyName}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                  Review company information, staffing coverage, and the shift history that
                  sits behind this facility account.
                </p>
              </div>
              <Button asChild className="rounded-2xl bg-white text-stone-900 hover:bg-white/90">
                <Link href="/dashboard/admin/facilities">Back to facilities</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="soft" className="rounded-full">
                {data.company.isActive ? "Active" : "Inactive"}
              </Badge>
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">{data.stats.totalShifts}</CardTitle>
            <CardDescription>Total shifts on file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-3xl border border-border/60 bg-muted/35 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Filled shifts
              </div>
              <div className="mt-2 text-sm font-medium">{data.stats.filledShifts}</div>
            </div>
            <div className="rounded-3xl border border-border/60 bg-muted/35 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Open shifts
              </div>
              <div className="mt-2 text-sm font-medium">{data.stats.openShifts}</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workers">Workers Used</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Facility account and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Address</div>
                  <div className="mt-1 font-medium">{data.company.address || "Not provided"}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Contact Number</div>
                  <div className="mt-1 font-medium">{data.company.contactNumber || "Not provided"}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Contact Person</div>
                  <div className="mt-1 font-medium">{data.company.contactPerson}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Email</div>
                  <div className="mt-1 font-medium">{data.company.email}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Shift and application totals for this facility.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {[
                  ["Total Shifts", data.stats.totalShifts.toString()],
                  ["Filled Shifts", data.stats.filledShifts.toString()],
                  ["Open Shifts", data.stats.openShifts.toString()],
                  ["Applications", data.stats.totalApplications.toString()]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-border/60 bg-background/70 p-4"
                  >
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {label}
                    </div>
                    <div className="mt-2 text-lg font-semibold">{value}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Workers Used</CardTitle>
              <CardDescription>Assigned workers and how often they have supported this facility.</CardDescription>
            </CardHeader>
            <CardContent>
              {workers.rows.length ? (
                <div className="overflow-hidden rounded-3xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Worker</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Assignments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.rows.map((worker) => (
                        <tr key={worker.id} className="border-t border-border/60">
                          <td className="px-4 py-4">{worker.workerName}</td>
                          <td className="px-4 py-4">{WORKER_ROLE_TYPE_LABELS[worker.roleType]}</td>
                          <td className="px-4 py-4">{worker.assignmentCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState label="No workers have been assigned to this facility yet. Post a shift to start building a coverage history." />
              )}
              {workers.rows.length ? (
                <PaginationControls
                  className="mt-4"
                  nextHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      Math.min(workers.page + 1, workers.pageCount),
                      applications.page,
                      shifts.page
                    ),
                    Math.min(workers.page + 1, workers.pageCount),
                    "workersPage"
                  )}
                  page={workers.page}
                  pageCount={workers.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      Math.max(workers.page - 1, 1),
                      applications.page,
                      shifts.page
                    ),
                    Math.max(workers.page - 1, 1),
                    "workersPage"
                  )}
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Applications Received</CardTitle>
              <CardDescription>Applications attached to shifts at this facility.</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.rows.length ? (
                <div className="overflow-hidden rounded-3xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Worker</th>
                        <th className="px-4 py-3 font-medium">Shift</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.rows.map((application) => (
                        <tr key={application.id} className="border-t border-border/60">
                          <td className="px-4 py-4">{application.workerName}</td>
                          <td className="px-4 py-4">{application.shiftLabel}</td>
                          <td className="px-4 py-4">
                            <Badge variant="outline">{application.status}</Badge>
                          </td>
                          <td className="px-4 py-4">{formatDateTime(application.submittedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState label="This facility has not received any applications yet." />
              )}
              {applications.rows.length ? (
                <PaginationControls
                  className="mt-4"
                  nextHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      workers.page,
                      Math.min(applications.page + 1, applications.pageCount),
                      shifts.page
                    ),
                    Math.min(applications.page + 1, applications.pageCount),
                    "applicationsPage"
                  )}
                  page={applications.page}
                  pageCount={applications.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      workers.page,
                      Math.max(applications.page - 1, 1),
                      shifts.page
                    ),
                    Math.max(applications.page - 1, 1),
                    "applicationsPage"
                  )}
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Shifts</CardTitle>
              <CardDescription>Shift records connected to this facility.</CardDescription>
            </CardHeader>
            <CardContent>
              {shifts.rows.length ? (
                <div className="overflow-hidden rounded-3xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Role Required</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.rows.map((shift) => (
                        <tr key={shift.id} className="border-t border-border/60">
                          <td className="px-4 py-4">{shift.date}</td>
                          <td className="px-4 py-4">{shift.roleRequired}</td>
                          <td className="px-4 py-4">
                            <Badge variant="outline">{SHIFT_STATUS_LABELS[shift.status]}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState label="No shift records have been added for this facility yet." />
              )}
              {shifts.rows.length ? (
                <PaginationControls
                  className="mt-4"
                  nextHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      workers.page,
                      applications.page,
                      Math.min(shifts.page + 1, shifts.pageCount)
                    ),
                    Math.min(shifts.page + 1, shifts.pageCount),
                    "shiftsPage"
                  )}
                  page={shifts.page}
                  pageCount={shifts.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      workers.page,
                      applications.page,
                      Math.max(shifts.page - 1, 1)
                    ),
                    Math.max(shifts.page - 1, 1),
                    "shiftsPage"
                  )}
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
