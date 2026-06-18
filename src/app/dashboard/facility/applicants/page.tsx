import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FacilityApplicantsTable } from "@/components/facility/facility-applicants-table";
import { getFacilityApplicantListData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { parsePage, parsePageSize } from "@/lib/pagination";
import {
  APPLICATION_STATUSES,
  VERIFICATION_STATUSES,
  type ApplicationStatus,
  type VerificationStatus
} from "@/lib/constants";

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

export default async function FacilityApplicantsPage({
  searchParams
}: FacilityApplicantsPageProps) {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};

  const page = parsePage(firstQueryValue(resolvedSearchParams.page));
  const pageSize = parsePageSize(firstQueryValue(resolvedSearchParams.pageSize), 10);
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

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Applicants</CardTitle>
              <CardDescription className="mt-2">
                Review workers across every shift and decide quickly.
              </CardDescription>
            </div>
            <Button asChild className="rounded-2xl" variant="outline">
              <Link href="/dashboard/facility/shifts">Manage shifts</Link>
            </Button>
          </div>

          <form className="grid gap-4 xl:grid-cols-4" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Worker name or shift"
                defaultValue={search}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="applicationStatus">
                Application status
              </label>
              <select
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
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
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="verificationStatus">
                Verification status
              </label>
              <select
                className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
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
            <div className="flex items-end gap-3">
              <Button className="rounded-2xl" type="submit">
                Search applications
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/facility/applicants">Reset</Link>
              </Button>
            </div>
          </form>
        </CardHeader>
      </Card>

      <FacilityApplicantsTable
        basePath="/dashboard/facility/applicants"
        page={data.page}
        pageCount={data.pageCount}
        query={query}
        rows={data.rows}
        showShift
      />
    </div>
  );
}
