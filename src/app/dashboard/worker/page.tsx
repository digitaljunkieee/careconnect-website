import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  ShieldCheck,
  ClipboardList,
  CalendarDays,
  UserRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ASSIGNMENT_STATUS_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { getWorkerDashboardData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

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
          <CardDescription>
            Add your details so you can browse shifts, complete verification,
            and track applications in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <Button asChild className="rounded-2xl">
            <Link href="/dashboard/worker/profile">Complete profile</Link>
          </Button>
          <Button asChild className="rounded-2xl" variant="outline">
            <Link href="/dashboard/worker/verification">Review verification</Link>
          </Button>
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
  const canApply = data.verificationStatus === "VERIFIED" && data.isVerified;
  const primaryHref = canApply ? "/dashboard/worker/shifts" : "/dashboard/worker/verification";
  const primaryLabel = canApply ? "Browse shifts" : "Complete verification";

  const actionCards = [
    {
      title: "Browse shifts",
      description: "Find open shifts that fit your schedule and preferred care settings.",
      href: "/dashboard/worker/shifts",
      cta: "Browse shifts",
      icon: CalendarDays
    },
    {
      title: "View applications",
      description: "Track every application and see what needs your attention next.",
      href: "/dashboard/worker/applications",
      cta: "View applications",
      icon: ClipboardList
    },
    {
      title: "Update profile",
      description: "Keep your contact and verification details current for facilities.",
      href: "/dashboard/worker/profile",
      cta: "Update profile",
      icon: UserRound
    }
  ] as const;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <Card className="overflow-hidden border-border/70">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(var(--brand-sky-rgb),0.2),transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(var(--brand-cyan-rgb),0.12),transparent_20%),linear-gradient(135deg,rgba(var(--brand-navy-rgb),0.96),rgba(7,108,130,0.9))] p-6 text-white sm:p-8">
            <Badge className="rounded-full bg-white/15 text-white" variant="outline">
              Worker overview
            </Badge>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {data.firstName || "there"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              Keep your verification, shifts, and applications in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-2xl bg-white text-slate-900 hover:bg-white/90">
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
              <Button asChild className="rounded-2xl border-white/20 text-white hover:bg-white/10" variant="outline">
                <Link href="/dashboard/worker/applications">View applications</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(19,217,203,0.07),rgba(43,185,255,0.03))]">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={verificationVariant} className="rounded-full">
                {VERIFICATION_STATUS_LABELS[data.verificationStatus]}
              </Badge>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-3xl">Verification status</CardTitle>
            <CardDescription>
              {data.isVerified
                ? "Your profile is ready for applications."
                : "Finish verification to unlock shift applications."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button asChild className="flex-1 rounded-2xl" variant="outline">
                <Link href="/dashboard/worker/verification">
                  {data.isVerified ? "Review status" : "Continue verification"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
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
            <CardTitle>Upcoming assignments</CardTitle>
            <CardDescription>Next scheduled shifts at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingAssignments.length ? (
              data.upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-medium">{assignment.facilityName}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.date} - {assignment.startTime} to {assignment.endTime}
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {ASSIGNMENT_STATUS_LABELS[
                        assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                      ]}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                No upcoming assignments yet. Browse live shifts to get started.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Next steps</CardTitle>
            <CardDescription>Keep your profile ready and stay available for new opportunities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full rounded-2xl" variant="outline">
              <Link href="/dashboard/worker/profile">Update profile</Link>
            </Button>
            <Button asChild className="w-full rounded-2xl" variant="outline">
              <Link href="/dashboard/worker/verification">Continue verification</Link>
            </Button>
            <Button asChild className="w-full rounded-2xl">
              <Link href="/dashboard/worker/shifts">Browse shifts</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
