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
import { FacilityApplicantsTable } from "@/components/facility/facility-applicants-table";
import { getShiftApplicantsData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";

type FacilityShiftApplicantsPageProps = {
  params: Promise<{ shiftId: string }>;
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

export default async function FacilityShiftApplicantsPage({
  params,
  searchParams
}: FacilityShiftApplicantsPageProps) {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const { shiftId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const page = parsePage(firstQueryValue(resolvedSearchParams.page));
  const pageSize = parsePageSize(
    firstQueryValue(resolvedSearchParams.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const applicationStatus = firstQueryValue(resolvedSearchParams.applicationStatus);
  const verificationStatus = firstQueryValue(resolvedSearchParams.verificationStatus);

  const data = await getShiftApplicantsData(user.id, shiftId, {
    page,
    pageSize,
    applicationStatus: applicationStatus || undefined,
    verificationStatus:
      verificationStatus === "PENDING" ||
      verificationStatus === "IN_REVIEW" ||
      verificationStatus === "VERIFIED" ||
      verificationStatus === "REJECTED"
        ? verificationStatus
        : undefined
  });

  if (!data) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Review applications</CardTitle>
          <CardDescription>
            We could not find this shift or you do not have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/dashboard/facility/shifts">Back to shifts</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <Badge variant="soft" className="w-fit rounded-full">
            Shift overview
          </Badge>
          <CardTitle className="mt-2">{data.shift.roleRequired}</CardTitle>
          <CardDescription>
            {data.shift.date} - {data.shift.startTime} - {data.shift.endTime}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Review applications</CardTitle>
          <CardDescription>
            Review by application status and worker verification status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-4" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
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
            <div className="flex items-end gap-3 lg:col-span-2">
              <Button className="rounded-2xl" type="submit">
                Search applications
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href={`/dashboard/facility/shifts/${shiftId}/applications`}>
                  Reset
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <FacilityApplicantsTable
        basePath={`/dashboard/facility/shifts/${shiftId}/applications`}
        page={data.page}
        pageCount={data.pageCount}
        query={{
          applicationStatus: applicationStatus || undefined,
          verificationStatus: verificationStatus || undefined,
          pageSize: String(pageSize)
        }}
        rows={data.rows}
      />
    </div>
  );
}
