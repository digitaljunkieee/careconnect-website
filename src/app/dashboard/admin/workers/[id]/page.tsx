import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ExternalLink, UserRound } from "lucide-react";
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
import {
  VERIFICATION_STATUS_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  WORKER_ROLE_TYPE_LABELS
} from "@/lib/constants";
import { getAdminWorkerDetailData } from "@/lib/admin-data";
import {
  buildPageHref,
  getResponsivePageSize,
  paginateItems,
  parsePage
} from "@/lib/pagination";

type WorkerDetailPageProps = {
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

function firstQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default async function AdminWorkerDetailPage({
  params,
  searchParams
}: WorkerDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const data = await getAdminWorkerDetailData(id);

  if (!data) {
    notFound();
  }

  const pageSize = getResponsivePageSize((await headers()).get("user-agent"));
  const documentsPage = parsePage(firstQueryValue(resolvedSearchParams.documentsPage));
  const logsPage = parsePage(firstQueryValue(resolvedSearchParams.logsPage));
  const upcomingPage = parsePage(firstQueryValue(resolvedSearchParams.upcomingPage));
  const completedPage = parsePage(firstQueryValue(resolvedSearchParams.completedPage));
  const applicationsPage = parsePage(firstQueryValue(resolvedSearchParams.applicationsPage));
  const documents = paginateItems(data.profile.documents, documentsPage, pageSize);
  const logs = paginateItems(data.verification.logs, logsPage, pageSize);
  const upcomingAssignments = paginateItems(
    data.assignments.upcoming,
    upcomingPage,
    pageSize
  );
  const completedAssignments = paginateItems(
    data.assignments.completed,
    completedPage,
    pageSize
  );
  const applications = paginateItems(data.applications, applicationsPage, pageSize);
  const basePath = `/dashboard/admin/workers/${id}`;
  const buildSharedQuery = (
    nextDocumentsPage: number,
    nextLogsPage: number,
    nextUpcomingPage: number,
    nextCompletedPage: number,
    nextApplicationsPage: number
  ) => ({
    documentsPage: String(nextDocumentsPage),
    logsPage: String(nextLogsPage),
    upcomingPage: String(nextUpcomingPage),
    completedPage: String(nextCompletedPage),
    applicationsPage: String(nextApplicationsPage),
    pageSize: String(pageSize)
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden border-border/70">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),transparent_24%),linear-gradient(135deg,rgba(4,47,46,0.95),rgba(15,118,110,0.88))] p-6 text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Badge className="rounded-full bg-white/15 text-white" variant="outline">
                  Worker detail
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
                  {data.user.fullName || data.user.email}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                  Review the worker profile, verification history, assignments, and
                  submitted applications in one place.
                </p>
              </div>
              <Button asChild className="rounded-2xl bg-white text-slate-900 hover:bg-white/90">
                <Link href="/dashboard/admin/workers">Back to workers</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="soft" className="rounded-full">
                {VERIFICATION_STATUS_LABELS[data.profile.verificationStatus]}
              </Badge>
              <UserRound className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">{WORKER_ROLE_TYPE_LABELS[data.profile.roleType]}</CardTitle>
            <CardDescription>{WORKER_ROLE_TYPE_LABELS[data.profile.roleType]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-3xl border border-border/60 bg-muted/35 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Profile status
              </div>
              <div className="mt-2 text-sm font-medium">
                {data.profile.isVerified ? "Verified and ready for shifts." : "Verification still pending."}
              </div>
            </div>
            <div className="rounded-3xl border border-border/60 bg-muted/35 p-4 text-sm text-muted-foreground">
              Registered {formatDateTime(data.user.registrationDate)}
            </div>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Primary account details for this worker.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Name</div>
                  <div className="mt-1 font-medium">{data.user.fullName || "Unknown"}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Email</div>
                  <div className="mt-1 font-medium">{data.user.email}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Phone</div>
                  <div className="mt-1 font-medium">{data.user.phone || "Not provided"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Worker profile data captured during registration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">NI Number</div>
                  <div className="mt-1 font-medium">{data.profile.niNumber || "Not provided"}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Share Code</div>
                  <div className="mt-1 font-medium">{data.profile.shareCode || "Not provided"}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Phone</div>
                  <div className="mt-1 font-medium">{data.profile.phone || "Not provided"}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Uploaded compliance documents and expiry details.</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.rows.length ? (
                <div className="overflow-hidden rounded-3xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Document</th>
                        <th className="px-4 py-3 font-medium">Uploaded</th>
                        <th className="px-4 py-3 font-medium">Expires</th>
                        <th className="px-4 py-3 font-medium">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.rows.map((document, index) => (
                        <tr key={`${document.name ?? "doc"}-${index}`} className="border-t border-border/60">
                          <td className="px-4 py-4 font-medium">{document.name ?? "Document"}</td>
                          <td className="px-4 py-4">{document.uploadedAt ? formatDateTime(document.uploadedAt) : "Unknown"}</td>
                          <td className="px-4 py-4">{document.expiresAt ? formatDateTime(document.expiresAt) : "No expiry date"}</td>
                          <td className="px-4 py-4">
                            {document.secureUrl ? (
                              <Button asChild className="rounded-2xl" size="sm" variant="outline">
                                <a href={document.secureUrl} rel="noreferrer" target="_blank">
                                  Open
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            ) : (
                              "Unavailable"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState label="This worker has not uploaded any documents yet." />
              )}
              {documents.rows.length ? (
                <PaginationControls
                  className="mt-4"
                  nextHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      Math.min(documents.page + 1, documents.pageCount),
                      logs.page,
                      upcomingAssignments.page,
                      completedAssignments.page,
                      applications.page
                    ),
                    Math.min(documents.page + 1, documents.pageCount),
                    "documentsPage"
                  )}
                  page={documents.page}
                  pageCount={documents.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      Math.max(documents.page - 1, 1),
                      logs.page,
                      upcomingAssignments.page,
                      completedAssignments.page,
                      applications.page
                    ),
                    Math.max(documents.page - 1, 1),
                    "documentsPage"
                  )}
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Verification Timeline</CardTitle>
              <CardDescription>Latest verification logs and admin decisions.</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.rows.length ? (
                <div className="space-y-4">
                  {logs.rows.map((log) => (
                    <div key={log.id} className="rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-medium">{log.documentName}</div>
                          <div className="text-sm text-muted-foreground">
                            Submitted {formatDateTime(log.submittedAt)}
                          </div>
                        </div>
                        <Badge variant="outline">{VERIFICATION_STATUS_LABELS[log.status]}</Badge>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
                          {log.reportUrl ? (
                            <Link href={log.reportUrl} target="_blank" rel="noreferrer">
                              View report
                            </Link>
                          ) : (
                            "No report link available."
                          )}
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
                          {log.adminNotes || "No admin notes have been added."}
                        </div>
                      </div>
                      {log.decisionAt ? (
                        <div className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Decision {formatDateTime(log.decisionAt)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState label="No verification decisions have been recorded for this worker yet." />
              )}
              {logs.rows.length ? (
                <PaginationControls
                  className="mt-4"
                  nextHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      documents.page,
                      Math.min(logs.page + 1, logs.pageCount),
                      upcomingAssignments.page,
                      completedAssignments.page,
                      applications.page
                    ),
                    Math.min(logs.page + 1, logs.pageCount),
                    "logsPage"
                  )}
                  page={logs.page}
                  pageCount={logs.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      documents.page,
                      Math.max(logs.page - 1, 1),
                      upcomingAssignments.page,
                      completedAssignments.page,
                      applications.page
                    ),
                    Math.max(logs.page - 1, 1),
                    "logsPage"
                  )}
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>Scheduled shifts the worker is currently assigned to.</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAssignments.rows.length ? (
                  <div className="space-y-3">
                    {upcomingAssignments.rows.map((assignment) => (
                      <div key={assignment.id} className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <div className="font-medium">{assignment.facilityName}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.date} - {assignment.hours}
                        </div>
                        <Badge className="mt-3" variant="outline">
                          {
                            ASSIGNMENT_STATUS_LABELS[
                              assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                            ]
                          }
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState label="No upcoming assignments are scheduled for this worker." />
                )}
                {upcomingAssignments.rows.length ? (
                  <PaginationControls
                    className="mt-4"
                    nextHref={buildPageHref(
                      basePath,
                      buildSharedQuery(
                        documents.page,
                        logs.page,
                        Math.min(upcomingAssignments.page + 1, upcomingAssignments.pageCount),
                        completedAssignments.page,
                        applications.page
                      ),
                      Math.min(upcomingAssignments.page + 1, upcomingAssignments.pageCount),
                      "upcomingPage"
                    )}
                    page={upcomingAssignments.page}
                    pageCount={upcomingAssignments.pageCount}
                    previousHref={buildPageHref(
                      basePath,
                      buildSharedQuery(
                        documents.page,
                        logs.page,
                        Math.max(upcomingAssignments.page - 1, 1),
                        completedAssignments.page,
                        applications.page
                      ),
                      Math.max(upcomingAssignments.page - 1, 1),
                      "upcomingPage"
                    )}
                  />
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Completed Assignments</CardTitle>
                <CardDescription>Historical shifts this worker has completed.</CardDescription>
              </CardHeader>
              <CardContent>
                {completedAssignments.rows.length ? (
                  <div className="space-y-3">
                    {completedAssignments.rows.map((assignment) => (
                      <div key={assignment.id} className="rounded-3xl border border-border/60 bg-background/70 p-4">
                        <div className="font-medium">{assignment.facilityName}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.date} - {assignment.hours}
                        </div>
                        <Badge className="mt-3" variant="secondary">
                          {
                            ASSIGNMENT_STATUS_LABELS[
                              assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                            ]
                          }
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState label="No completed assignments have been recorded for this worker yet." />
                )}
                {completedAssignments.rows.length ? (
                  <PaginationControls
                    className="mt-4"
                    nextHref={buildPageHref(
                      basePath,
                      buildSharedQuery(
                        documents.page,
                        logs.page,
                        upcomingAssignments.page,
                        Math.min(completedAssignments.page + 1, completedAssignments.pageCount),
                        applications.page
                      ),
                      Math.min(completedAssignments.page + 1, completedAssignments.pageCount),
                      "completedPage"
                    )}
                    page={completedAssignments.page}
                    pageCount={completedAssignments.pageCount}
                    previousHref={buildPageHref(
                      basePath,
                      buildSharedQuery(
                        documents.page,
                        logs.page,
                        upcomingAssignments.page,
                        Math.max(completedAssignments.page - 1, 1),
                        applications.page
                      ),
                      Math.max(completedAssignments.page - 1, 1),
                      "completedPage"
                    )}
                  />
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Submitted Applications</CardTitle>
              <CardDescription>Applications submitted by this worker across all facilities.</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.rows.length ? (
                <div className="overflow-hidden rounded-3xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Facility</th>
                        <th className="px-4 py-3 font-medium">Shift</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.rows.map((application) => (
                        <tr key={application.id} className="border-t border-border/60">
                          <td className="px-4 py-4">{application.facilityName}</td>
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
                <EmptyState label="This worker has not submitted any applications yet." />
              )}
              {applications.rows.length ? (
                <PaginationControls
                  className="mt-4"
                  nextHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      documents.page,
                      logs.page,
                      upcomingAssignments.page,
                      completedAssignments.page,
                      Math.min(applications.page + 1, applications.pageCount)
                    ),
                    Math.min(applications.page + 1, applications.pageCount),
                    "applicationsPage"
                  )}
                  page={applications.page}
                  pageCount={applications.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      documents.page,
                      logs.page,
                      upcomingAssignments.page,
                      completedAssignments.page,
                      Math.max(applications.page - 1, 1)
                    ),
                    Math.max(applications.page - 1, 1),
                    "applicationsPage"
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
