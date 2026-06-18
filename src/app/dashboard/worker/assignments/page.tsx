import Link from "next/link";
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
import { ASSIGNMENT_STATUS_LABELS } from "@/lib/constants";
import { getWorkerAssignmentsData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/format";

export default async function WorkerAssignmentsPage() {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

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
                {data.upcoming.length ? (
                  data.upcoming.map((assignment) => (
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
                {data.completed.length ? (
                  data.completed.map((assignment) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
