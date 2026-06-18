import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/format";
import { ASSIGNMENT_STATUS_LABELS, SHIFT_STATUS_LABELS } from "@/lib/constants";
import { ShiftActions } from "@/components/admin/shift-actions";
import { getAdminShiftDetailData } from "@/lib/admin-platform";

type ShiftDetailPageProps = {
  params: Promise<{ id: string }>;
};

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default async function AdminShiftDetailPage({
  params
}: ShiftDetailPageProps) {
  const { id } = await params;
  const data = await getAdminShiftDetailData(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden border-border/70">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),transparent_24%),linear-gradient(135deg,rgba(3,7,18,0.95),rgba(15,118,110,0.88))] p-6 text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Badge className="rounded-full bg-white/15 text-white" variant="outline">
                  Shift detail
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
                  {data.shift.roleRequired}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                  Review shift information, assigned worker, and the related application
                  trail before taking an action.
                </p>
              </div>
              <Button asChild className="rounded-2xl bg-white text-slate-900 hover:bg-white/90">
                <Link href="/dashboard/admin/shifts">Back to shifts</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="soft" className="rounded-full">
                {SHIFT_STATUS_LABELS[data.shift.status]}
              </Badge>
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">{data.shift.facilityName}</CardTitle>
            <CardDescription>{data.shift.hourlyRateLabel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-3xl border border-border/60 bg-muted/35 p-4 text-sm text-muted-foreground">
              Shift date: {formatDateTime(data.shift.date)}
            </div>
            <div className="rounded-3xl border border-border/60 bg-muted/35 p-4 text-sm text-muted-foreground">
              Applications: {data.shift.applicationCount}
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <ShiftActions shiftId={data.shift.id} status={data.shift.status} workers={data.workers} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Shift Overview</CardTitle>
                <CardDescription>Core schedule details and notes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Date</div>
                  <div className="mt-1 font-medium">{formatDateTime(data.shift.date)}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Time</div>
                  <div className="mt-1 font-medium">
                    {data.shift.startTime} - {data.shift.endTime}
                  </div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Role</div>
                  <div className="mt-1 font-medium">{data.shift.roleRequired}</div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Notes</div>
                  <div className="mt-1 font-medium">{data.shift.notes || "No notes added."}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
                <CardDescription>Worker currently attached to this shift.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.assignment ? (
                    <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-4">
                      <div className="font-medium">{data.assignment.workerName}</div>
                      <div className="text-sm text-muted-foreground">{data.assignment.workerEmail}</div>
                    <Badge variant="outline">
                      {
                        ASSIGNMENT_STATUS_LABELS[
                          data.assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                        ]
                      }
                    </Badge>
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Assigned {formatDateTime(data.assignment.assignedAt)}
                    </div>
                  </div>
                ) : (
                  <EmptyState label="This shift has not been assigned to a worker yet." />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Worker applications submitted for this shift.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.applications.length ? (
                <div className="overflow-hidden rounded-3xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Worker</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.applications.map((application) => (
                        <tr key={application.id} className="border-t border-border/60">
                          <td className="px-4 py-4">{application.workerName}</td>
                          <td className="px-4 py-4">{application.workerEmail}</td>
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
                  <EmptyState label="No workers have applied for this shift yet." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
