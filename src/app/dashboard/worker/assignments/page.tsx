import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PaginationControls } from "@/components/pagination-controls";
import { ASSIGNMENT_STATUS_LABELS } from "@/lib/constants";
import { getWorkerAssignmentsData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/format";
import {
  buildPageHref,
  getResponsivePageSize,
  paginateItems,
  parsePage
} from "@/lib/pagination";

type WorkerAssignmentsPageProps = {
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

export default async function WorkerAssignmentsPage({
  searchParams
}: WorkerAssignmentsPageProps) {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const pageSize = getResponsivePageSize((await headers()).get("user-agent"));
  const upcomingPage = parsePage(firstQueryValue(params.upcomingPage));
  const completedPage = parsePage(firstQueryValue(params.completedPage));
  const data = await getWorkerAssignmentsData(user.id);

  if (!data) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>
            Create your worker profile before viewing assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/worker/profile">Complete profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const upcoming = paginateItems(data.upcoming, upcomingPage, pageSize);
  const completed = paginateItems(data.completed, completedPage, pageSize);
  const basePath = "/dashboard/worker/assignments";
  const buildSharedQuery = (nextUpcomingPage: number, nextCompletedPage: number) => ({
    upcomingPage: String(nextUpcomingPage),
    completedPage: String(nextCompletedPage),
    pageSize: String(pageSize)
  });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
          <CardDescription>Shifts you have accepted and are expected to attend.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.rows.length ? (
                  upcoming.rows.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.facilityName}
                      </TableCell>
                      <TableCell>{formatDate(assignment.date)}</TableCell>
                      <TableCell>{assignment.hours}</TableCell>
                      <TableCell>
                        <Badge variant="soft">
                          {
                            ASSIGNMENT_STATUS_LABELS[
                              assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                            ]
                          }
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                      <TableCell className="py-10 text-center text-muted-foreground" colSpan={4}>
                      You do not have any upcoming assignments yet. Browse open shifts to find your next booking.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {upcoming.rows.length ? (
            <PaginationControls
              className="mt-4"
              nextHref={buildPageHref(
                basePath,
                buildSharedQuery(
                  Math.min(upcoming.page + 1, upcoming.pageCount),
                  completed.page
                ),
                Math.min(upcoming.page + 1, upcoming.pageCount),
                "upcomingPage"
              )}
              page={upcoming.page}
              pageCount={upcoming.pageCount}
              previousHref={buildPageHref(
                basePath,
                buildSharedQuery(Math.max(upcoming.page - 1, 1), completed.page),
                Math.max(upcoming.page - 1, 1),
                "upcomingPage"
              )}
            />
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Completed Assignments</CardTitle>
          <CardDescription>Past shifts already marked complete.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completed.rows.length ? (
                  completed.rows.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.facilityName}
                      </TableCell>
                      <TableCell>{formatDate(assignment.date)}</TableCell>
                      <TableCell>{assignment.hours}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {
                            ASSIGNMENT_STATUS_LABELS[
                              assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                            ]
                          }
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                      <TableCell className="py-10 text-center text-muted-foreground" colSpan={4}>
                      You do not have any completed assignments yet. Completed shifts will appear here once they are closed.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {completed.rows.length ? (
            <PaginationControls
              className="mt-4"
              nextHref={buildPageHref(
                basePath,
                buildSharedQuery(upcoming.page, Math.min(completed.page + 1, completed.pageCount)),
                Math.min(completed.page + 1, completed.pageCount),
                "completedPage"
              )}
              page={completed.page}
              pageCount={completed.pageCount}
              previousHref={buildPageHref(
                basePath,
                buildSharedQuery(upcoming.page, Math.max(completed.page - 1, 1)),
                Math.max(completed.page - 1, 1),
                "completedPage"
              )}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
