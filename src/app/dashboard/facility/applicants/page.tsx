import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FacilityApplicantsTable } from "@/components/facility/facility-applicants-table";
import { getFacilityApplicantListData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";
import {
  APPLICATION_STATUSES,
  VERIFICATION_STATUSES,
  type ApplicationStatus,
  type VerificationStatus
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type FacilityApplicantsPageProps = {
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

function normalizeApplicationStatus(value: string) {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : undefined;
}

function normalizeVerificationStatus(value: string) {
  return VERIFICATION_STATUSES.includes(value as VerificationStatus)
    ? (value as VerificationStatus)
    : undefined;
}

function SummaryCard({
  label,
  value,
  accent = false
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border-border/70 bg-card/90 shadow-sm",
        accent && "border-[#13d9cb]/20 bg-[#13d9cb]/5"
      )}
    >
      <CardContent className="flex min-h-[6.5rem] flex-col justify-between p-4">
        <div className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyApplicationsState() {
  return (
    <Card className="border-border/70 bg-card/90 shadow-sm">
      <CardContent className="flex min-h-[24rem] items-center justify-center p-6 sm:p-10">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/20 text-[#13d9cb]">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
            No applications yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Workers who apply to your shifts will appear here.
          </p>
          <Button
            asChild
            className="mt-5 h-10 rounded-xl border-transparent bg-[#076c82] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#065a6b] hover:text-white"
          >
            <Link href="/dashboard/facility/shifts">View Open Shifts</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function FacilityApplicantsPage({
  searchParams
}: FacilityApplicantsPageProps) {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};

  const page = parsePage(firstQueryValue(resolvedSearchParams.page));
  const pageSize = parsePageSize(
    firstQueryValue(resolvedSearchParams.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const search = firstQueryValue(resolvedSearchParams.search);
  const applicationStatus = normalizeApplicationStatus(
    firstQueryValue(resolvedSearchParams.applicationStatus)
  );
  const verificationStatus = normalizeVerificationStatus(
    firstQueryValue(resolvedSearchParams.verificationStatus)
  );

  const data = await getFacilityApplicantListData(user.id, {
    page,
    pageSize,
    search,
    applicationStatus,
    verificationStatus
  });

  if (!data) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Review applications</CardTitle>
          <CardDescription>
            Complete your facility profile before reviewing applicants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/facility/profile">Go to profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const query = {
    search: search || undefined,
    applicationStatus: applicationStatus || undefined,
    verificationStatus: verificationStatus || undefined,
    pageSize: String(pageSize)
  };
  const hasApplications = data.summaryCounts.totalCount > 0;
  const reviewApplicantsHref = `/dashboard/facility/applicants?applicationStatus=PENDING&page=1&pageSize=${pageSize}`;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            Applicants
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Review and manage worker applications.
          </p>
        </div>
        {hasApplications ? (
          <Button
            asChild
            className="h-10 rounded-xl border-transparent bg-[#076c82] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#065a6b] hover:text-white"
          >
            <Link href={reviewApplicantsHref}>Review Applicants</Link>
          </Button>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          accent={data.summaryCounts.pendingReviewCount > 0}
          label="Pending Review"
          value={data.summaryCounts.pendingReviewCount}
        />
        <SummaryCard label="Approved" value={data.summaryCounts.approvedCount} />
        <SummaryCard label="Rejected" value={data.summaryCounts.rejectedCount} />
        <SummaryCard label="Total Applications" value={data.summaryCounts.totalCount} />
      </section>

      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="space-y-2 p-4 pb-3 sm:p-5 sm:pb-4">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search by worker, status, or verification.</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
          <form
            className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(11rem,0.85fr)_minmax(11rem,0.85fr)_auto]"
            method="get"
          >
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                className="h-10 border-border/70 bg-background/55 shadow-none"
                name="search"
                placeholder="Worker name or shift"
                defaultValue={search}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="applicationStatus"
              >
                Status
              </label>
              <select
                className="h-10 w-full rounded-xl border border-border/70 bg-background/55 px-3 text-sm shadow-none outline-none transition-colors focus:border-[#2bb9ff]/60 focus:ring-2 focus:ring-[#2bb9ff]/20"
                defaultValue={applicationStatus}
                id="applicationStatus"
                name="applicationStatus"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="verificationStatus"
              >
                Verification
              </label>
              <select
                className="h-10 w-full rounded-xl border border-border/70 bg-background/55 px-3 text-sm shadow-none outline-none transition-colors focus:border-[#2bb9ff]/60 focus:ring-2 focus:ring-[#2bb9ff]/20"
                defaultValue={verificationStatus}
                id="verificationStatus"
                name="verificationStatus"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_REVIEW">In review</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                className="h-10 rounded-xl border-transparent bg-[#076c82] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#065a6b] hover:text-white"
                type="submit"
              >
                Search
              </Button>
              <Button
                asChild
                className="h-10 rounded-xl border-border/70 bg-background/55 px-4 text-sm font-medium shadow-none hover:bg-accent/70 hover:text-foreground"
                variant="outline"
              >
                <Link href="/dashboard/facility/applicants">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasApplications ? (
        <FacilityApplicantsTable
          basePath="/dashboard/facility/applicants"
          page={data.page}
          pageCount={data.pageCount}
          query={query}
          rows={data.rows}
          showRoleType={false}
          showShift
        />
      ) : (
        <EmptyApplicationsState />
      )}
    </div>
  );
}
