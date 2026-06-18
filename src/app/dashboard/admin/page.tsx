import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Banknote,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/admin-data";

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  if (!data) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.24fr_0.86fr]">
        <Card className="overflow-hidden border-border/70">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(var(--brand-sky-rgb),0.2),transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(var(--brand-cyan-rgb),0.12),transparent_20%),linear-gradient(135deg,rgba(var(--brand-navy-rgb),0.96),rgba(7,108,130,0.9))] p-6 text-white sm:p-8">
            <Badge className="rounded-full bg-white/15 text-white" variant="outline">
              Operations overview
            </Badge>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              CareConnect operations overview
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              Monitor verification, shift coverage, and payments from one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-2xl bg-white text-slate-900 hover:bg-white/90">
                <Link href="/dashboard/admin/verifications">Review verifications</Link>
              </Button>
              <Button
                asChild
                className="rounded-2xl border-white/20 text-white hover:bg-white/10"
                variant="outline"
              >
                <Link href="/dashboard/admin/shifts">Review shifts</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(19,217,203,0.07),rgba(43,185,255,0.03))]">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="soft" className="rounded-full">
                Pending
              </Badge>
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">{data.stats.pendingPayments}</CardTitle>
            <CardDescription>Payments waiting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              {data.stats.openShifts} live shifts are currently awaiting assignment.
            </div>
            <div className="flex gap-3">
              <Button asChild className="flex-1 rounded-2xl">
                <Link href="/dashboard/admin/shifts">Review shifts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card id="verification" className="border-border/70">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Verification queue</CardTitle>
                <CardDescription className="mt-2">
                  Worker documents waiting on review and decision.
                </CardDescription>
              </div>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/verifications">
                  Review verifications
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.pendingVerificationQueue.length ? (
              data.pendingVerificationQueue.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-medium">{item.workerName}</div>
                      <div className="text-sm text-muted-foreground">
                        Submitted {formatDateTime(item.submittedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{VERIFICATION_STATUS_LABELS[item.verificationStatus]}</Badge>
                      <Badge variant="secondary">{item.documentCount} docs</Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="No workers are waiting for verification review right now." />
            )}
          </CardContent>
        </Card>

      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Applications waiting</CardTitle>
                <CardDescription>
                  The latest worker applications across live shifts.
                </CardDescription>
              </div>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/applications">
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentApplications.length ? (
              <div className="overflow-hidden rounded-3xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Worker</th>
                      <th className="px-4 py-3 font-medium">Facility</th>
                      <th className="px-4 py-3 font-medium">Shift</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentApplications.map((application) => (
                      <tr key={application.id} className="border-t border-border/60">
                        <td className="px-4 py-4">
                          <div className="font-medium">{application.workerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(application.submittedAt)}
                          </div>
                        </td>
                        <td className="px-4 py-4">{application.facilityName}</td>
                        <td className="px-4 py-4">{application.shiftLabel}</td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">{application.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState label="No applications have been submitted yet. They will appear here as workers apply to live shifts." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
