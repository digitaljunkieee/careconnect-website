import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/pagination-controls";
import { ASSIGNMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getWorkerAssignmentsData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import {
  buildPageHref,
  getResponsivePageSize,
  paginateItems,
  parsePage
} from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock3, Sparkles } from "lucide-react";

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

function getStatusToneClassName(status: string) {
  switch (status) {
    case "UPCOMING":
      return "border-[#2bb9ff]/20 bg-[#2bb9ff]/12 text-[#2bb9ff]";
    case "COMPLETED":
      return "border-[#13d9cb]/20 bg-[#13d9cb]/12 text-[#13d9cb]";
    case "CANCELLED":
      return "border-rose-500/20 bg-rose-500/12 text-rose-200";
    default:
      return "border-white/10 bg-white/8 text-white/70";
  }
}

function MetricCard({
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
        "rounded-[24px] border border-white/10 bg-white/5 p-4",
        accent && "border-[#13d9cb]/20 bg-[linear-gradient(135deg,rgba(7,108,130,0.32),rgba(19,217,203,0.08))]"
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  );
}

function SectionEmpty({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[17rem] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#13d9cb]/10 text-[#13d9cb]">
          <Sparkles className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
            {title}
          </h3>
          <p className="text-sm leading-6 text-white/65">{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

function AssignmentCard({
  facilityName,
  date,
  hours,
  status,
  featured = false
}: {
  facilityName: string;
  date: string;
  hours: string;
  status: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2bb9ff]/25 hover:bg-white/8",
        featured && "border-[#13d9cb]/20 bg-[linear-gradient(135deg,rgba(7,108,130,0.26),rgba(19,217,203,0.08))]"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {featured ? (
              <div className="rounded-full border border-[#13d9cb]/20 bg-[#13d9cb]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#13d9cb]">
                Next up
              </div>
            ) : null}
            <Badge
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                getStatusToneClassName(status)
              )}
            >
              {ASSIGNMENT_STATUS_LABELS[status as keyof typeof ASSIGNMENT_STATUS_LABELS]}
            </Badge>
          </div>

          <div>
            <div className="font-semibold text-white">{facilityName}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:min-w-[14rem]">
          <div className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <CalendarDays className="h-4 w-4 text-[#2bb9ff]" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <Clock3 className="h-4 w-4 text-[#13d9cb]" />
            <span>{hours}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignmentSection({
  title,
  description,
  rows,
  page,
  pageCount,
  basePath,
  pageParam,
  pageSize,
  totalCount,
  emptyTitle,
  emptyDescription,
  emptyAction,
  featuredFirst = false
}: {
  title: string;
  description: string;
  rows: Array<{
    id: string;
    facilityName: string;
    date: string;
    hours: string;
    status: string;
  }>;
  page: number;
  pageCount: number;
  basePath: string;
  pageParam: "upcomingPage" | "completedPage";
  pageSize: string;
  totalCount: number;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
  featuredFirst?: boolean;
}) {
  return (
    <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              {title}
            </div>
            <CardDescription className="mt-2 text-white/65">{description}</CardDescription>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            {totalCount}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
        {rows.length ? (
          <div className="space-y-3">
            {rows.map((row, index) => (
              <AssignmentCard
                key={row.id}
                date={row.date}
                facilityName={row.facilityName}
                featured={featuredFirst && index === 0}
                hours={row.hours}
                status={row.status}
              />
            ))}
          </div>
        ) : (
          <SectionEmpty
            action={emptyAction}
            description={emptyDescription}
            title={emptyTitle}
          />
        )}

        {rows.length ? (
          <PaginationControls
            className="bg-white/5"
            nextHref={buildPageHref(
              basePath,
              {
                upcomingPage:
                  pageParam === "upcomingPage"
                    ? String(Math.min(page + 1, pageCount))
                    : undefined,
                completedPage:
                  pageParam === "completedPage"
                    ? String(Math.min(page + 1, pageCount))
                    : undefined,
                pageSize
              },
              Math.min(page + 1, pageCount),
              pageParam
            )}
            page={page}
            pageCount={pageCount}
            previousHref={buildPageHref(
              basePath,
              {
                upcomingPage:
                  pageParam === "upcomingPage"
                    ? String(Math.max(page - 1, 1))
                    : undefined,
                completedPage:
                  pageParam === "completedPage"
                    ? String(Math.max(page - 1, 1))
                    : undefined,
                pageSize
              },
              Math.max(page - 1, 1),
              pageParam
            )}
          />
        ) : null}
      </CardContent>
    </Card>
  );
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
      <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="text-2xl text-white">Assignments</CardTitle>
          <CardDescription className="text-white/65">
            Create your worker profile before viewing assignments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <Button asChild className="rounded-2xl bg-[#076c82] text-white hover:bg-[#13d9cb]">
            <Link href="/dashboard/worker/profile">Complete profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const upcoming = paginateItems(data.upcoming, upcomingPage, pageSize);
  const completed = paginateItems(data.completed, completedPage, pageSize);
  const basePath = "/dashboard/worker/assignments";
  const totalAssignments = data.upcoming.length + data.completed.length;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(43,185,255,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(19,217,203,0.16),transparent_22%),linear-gradient(135deg,rgba(4,14,38,0.98),rgba(7,23,53,0.96))] p-6 text-white shadow-[0_30px_80px_rgba(4,14,38,0.24)] sm:p-8">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {totalAssignments} {totalAssignments === 1 ? "Assignment" : "Assignments"}
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {data.upcoming.length} Upcoming
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {data.completed.length} Completed
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              My assignments
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              Track shifts you have already accepted and keep an eye on what is next.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard accent label="Upcoming" value={String(data.upcoming.length)} />
        <MetricCard label="Completed" value={String(data.completed.length)} />
        <MetricCard label="Total" value={String(totalAssignments)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AssignmentSection
          basePath={basePath}
          description="Shifts you have accepted and are expected to attend."
          emptyAction={
            <Button asChild className="rounded-2xl bg-[#076c82] text-white hover:bg-[#13d9cb]">
              <Link href="/dashboard/worker/shifts">Browse shifts</Link>
            </Button>
          }
          emptyDescription="You do not have any upcoming assignments yet. Browse open shifts to find your next booking."
          emptyTitle="No upcoming assignments"
          featuredFirst
          page={upcoming.page}
          pageCount={upcoming.pageCount}
          pageParam="upcomingPage"
          pageSize={String(pageSize)}
          rows={upcoming.rows}
          title="Upcoming assignments"
          totalCount={data.upcoming.length}
        />

        <AssignmentSection
          basePath={basePath}
          description="Past shifts already marked complete."
          emptyDescription="You do not have any completed assignments yet. Completed shifts will appear here once they are closed."
          emptyTitle="No completed assignments"
          page={completed.page}
          pageCount={completed.pageCount}
          pageParam="completedPage"
          pageSize={String(pageSize)}
          rows={completed.rows}
          title="Completed assignments"
          totalCount={data.completed.length}
        />
      </div>
    </div>
  );
}
