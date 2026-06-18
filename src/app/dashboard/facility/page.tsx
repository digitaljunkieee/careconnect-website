import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseMedical,
  Users,
  UserRound
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
import { formatDate } from "@/lib/format";
import { SHIFT_STATUS_LABELS } from "@/lib/constants";
import { getFacilityDashboardData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function FacilityDashboardPage() {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const data = await getFacilityDashboardData(user.id);

  if (!data) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Complete your facility profile</CardTitle>
          <CardDescription>
            Complete your facility profile to start posting shifts and reviewing applicants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/facility/profile">Complete profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const actionCards = [
    {
      title: "Create a shift",
      description: "Post a new shift with the role, rate, and time you need covered.",
      href: "/dashboard/facility/shifts/create",
      cta: "Create shift",
      icon: BriefcaseMedical
    },
    {
      title: "Review applications",
      description: "See who has applied and move the right worker forward quickly.",
      href: "/dashboard/facility/applicants",
      cta: "Review applications",
      icon: Users
    },
    {
      title: "Update profile",
      description: "Keep your facility details current for shift coordination.",
      href: "/dashboard/facility/profile",
      cta: "Update profile",
      icon: UserRound
    }
  ] as const;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="overflow-hidden border-border/70">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(var(--brand-sky-rgb),0.22),transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(var(--brand-cyan-rgb),0.14),transparent_20%),linear-gradient(135deg,rgba(var(--brand-navy-rgb),0.95),rgba(7,108,130,0.92))] p-6 text-white sm:p-8">
            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {data.companyName}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              Manage live shifts, review applicants, and keep bookings moving in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-2xl bg-white text-slate-900 hover:bg-white/90">
                <Link href="/dashboard/facility/shifts/create">Create shift</Link>
              </Button>
              <Button
                asChild
                className="rounded-2xl border-white/20 text-white hover:bg-white/10"
                variant="outline"
              >
                <Link href="/dashboard/facility/shifts">Manage shifts</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(19,217,203,0.07),rgba(43,185,255,0.03))]">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="soft" className="rounded-full">
                Applications
              </Badge>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">Pending review</CardTitle>
            <CardDescription>
              {data.pendingApplicationsCount} applications waiting for a decision.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              {data.openShiftsCount} live shifts are currently open for applications.
            </div>
            <div className="flex gap-3">
              <Button asChild className="flex-1 rounded-2xl">
                <Link href="/dashboard/facility/applicants">Review applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {actionCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border-border/70">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="soft" className="rounded-full">
                    Next step
                  </Badge>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full rounded-2xl" variant="outline">
                  <Link href={card.href}>
                    {card.cta}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Upcoming shifts</CardTitle>
            <CardDescription>Recent shift activity at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingShifts.length ? (
              data.upcomingShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium">{shift.roleRequired}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(shift.date)} • {shift.hourlyRateLabel}
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {SHIFT_STATUS_LABELS[shift.status]}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                No shifts yet. Create a new shift to start receiving applications.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump straight into common facility tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full rounded-2xl">
              <Link href="/dashboard/facility/shifts/create">Create a shift</Link>
            </Button>
            <Button asChild className="w-full rounded-2xl" variant="outline">
              <Link href="/dashboard/facility/shifts">Manage existing shifts</Link>
            </Button>
            <Button asChild className="w-full rounded-2xl" variant="outline">
              <Link href="/dashboard/facility/applicants">Review applicants</Link>
            </Button>
            <Button asChild className="w-full rounded-2xl" variant="outline">
              <Link href="/dashboard/facility/profile">Update facility profile</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
