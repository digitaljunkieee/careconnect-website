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
import { FacilityShiftsTable } from "@/components/facility/facility-shifts-table";
import {
  getFacilityProfileData,
  getFacilityShiftListData
} from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { parsePage, parsePageSize } from "@/lib/pagination";
import type { ShiftStatus } from "@/lib/constants";

type FacilityShiftsPageProps = {
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

function normalizeStatus(value: string) {
  if (value === "OPEN" || value === "CLOSED" || value === "FILLED") {
    return value as ShiftStatus;
  }

  return undefined;
}

export default async function FacilityShiftsPage({
  searchParams
}: FacilityShiftsPageProps) {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};

  const page = parsePage(firstQueryValue(resolvedSearchParams.page));
  const pageSize = parsePageSize(firstQueryValue(resolvedSearchParams.pageSize), 10);
  const status = normalizeStatus(firstQueryValue(resolvedSearchParams.status));
  const search = firstQueryValue(resolvedSearchParams.search);

  const [profile, data] = await Promise.all([
    getFacilityProfileData(user.id),
    getFacilityShiftListData(user.id, {
      page,
      pageSize,
      status,
      search
    })
  ]);

  if (!profile || !data) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Manage shifts</CardTitle>
          <CardDescription>
            Complete your facility profile before posting or managing shifts.
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

  const tabHref = (nextStatus?: ShiftStatus) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (nextStatus) params.set("status", nextStatus);
    if (pageSize) params.set("pageSize", String(pageSize));
    return params.toString() ? `/dashboard/facility/shifts?${params.toString()}` : "/dashboard/facility/shifts";
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Manage shifts</CardTitle>
              <CardDescription className="mt-2">
                Create, update, and review shifts from one place.
              </CardDescription>
            </div>
            <Button asChild className="rounded-2xl">
              <Link href="/dashboard/facility/shifts/create">Create shift</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full" variant={!status ? "default" : "outline"} size="sm">
              <Link href={tabHref(undefined)}>All</Link>
            </Button>
            <Button asChild className="rounded-full" variant={status === "OPEN" ? "default" : "outline"} size="sm">
              <Link href={tabHref("OPEN")}>Live</Link>
            </Button>
            <Button asChild className="rounded-full" variant={status === "CLOSED" ? "default" : "outline"} size="sm">
              <Link href={tabHref("CLOSED")}>Closed</Link>
            </Button>
            <Button asChild className="rounded-full" variant={status === "FILLED" ? "default" : "outline"} size="sm">
              <Link href={tabHref("FILLED")}>Filled</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            {status ? <input name="status" type="hidden" value={status} /> : null}
            <div className="space-y-2 sm:min-w-[20rem]">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Role required or notes"
                defaultValue={search}
              />
            </div>
            <Button className="rounded-2xl" type="submit">
              Apply filter
            </Button>
            <Button asChild className="rounded-2xl" variant="outline">
              <Link href="/dashboard/facility/shifts">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <FacilityShiftsTable
        basePath="/dashboard/facility/shifts"
        page={data.page}
        pageCount={data.pageCount}
        query={{
          search: search || undefined,
          status: status || undefined,
          pageSize: String(pageSize)
        }}
        rows={data.rows}
      />
    </div>
  );
}
