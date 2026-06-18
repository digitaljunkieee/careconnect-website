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
import { Input } from "@/components/ui/input";
import { WorkerShiftBoardTable } from "@/components/worker/worker-shift-board-table";
import { getWorkerProfileData, getWorkerShiftBoardData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { parsePage, parsePageSize } from "@/lib/pagination";

type WorkerShiftBoardPageProps = {
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

export default async function WorkerShiftBoardPage({
  searchParams
}: WorkerShiftBoardPageProps) {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};

  const page = parsePage(firstQueryValue(resolvedSearchParams.page));
  const pageSize = parsePageSize(firstQueryValue(resolvedSearchParams.pageSize), 10);
  const query = {
    search: firstQueryValue(resolvedSearchParams.search),
    role: firstQueryValue(resolvedSearchParams.role),
    dateFrom: firstQueryValue(resolvedSearchParams.dateFrom),
    dateTo: firstQueryValue(resolvedSearchParams.dateTo),
    minRate: firstQueryValue(resolvedSearchParams.minRate),
    maxRate: firstQueryValue(resolvedSearchParams.maxRate)
  };

  const [profile, board] = await Promise.all([
    getWorkerProfileData(user.id),
    getWorkerShiftBoardData(user.id, {
      ...query,
      page,
      pageSize,
      minRate: query.minRate ? Number(query.minRate) : undefined,
      maxRate: query.maxRate ? Number(query.maxRate) : undefined
    })
  ]);

  if (!profile || !board) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Find shifts</CardTitle>
          <CardDescription>
            Create your worker profile before browsing shifts.
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

  const canApply = profile.verificationStatus === "VERIFIED" && profile.isVerified;

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Find shifts</CardTitle>
          <CardDescription>
            Search by role, date range, and hourly rate to narrow the shifts you see.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-6" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Facility, notes, role"
                defaultValue={query.search}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="role">
                Role
              </label>
              <Input id="role" name="role" placeholder="Support" defaultValue={query.role} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dateFrom">
                Date from
              </label>
              <Input id="dateFrom" name="dateFrom" type="date" defaultValue={query.dateFrom} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dateTo">
                Date to
              </label>
              <Input id="dateTo" name="dateTo" type="date" defaultValue={query.dateTo} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="minRate">
                  Min rate
                </label>
                <Input
                  id="minRate"
                  name="minRate"
                  min={0}
                  placeholder="15"
                  step="0.01"
                  type="number"
                  defaultValue={query.minRate}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="maxRate">
                  Max rate
                </label>
                <Input
                  id="maxRate"
                  name="maxRate"
                  min={0}
                  placeholder="30"
                  step="0.01"
                  type="number"
                  defaultValue={query.maxRate}
                />
              </div>
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Apply filters
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/worker/shifts">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {canApply ? null : (
        <Card className="border-border/70">
          <CardContent className="py-6 text-sm text-muted-foreground">
            You can browse live shifts now, but you need a verified profile before Apply becomes available.
          </CardContent>
        </Card>
      )}

      <WorkerShiftBoardTable
        basePath="/dashboard/worker/shifts"
        canApply={canApply}
        page={board.page}
        pageCount={board.pageCount}
        query={{
          search: query.search || undefined,
          role: query.role || undefined,
          dateFrom: query.dateFrom || undefined,
          dateTo: query.dateTo || undefined,
          minRate: query.minRate || undefined,
          maxRate: query.maxRate || undefined,
          pageSize: String(pageSize)
        }}
        rows={board.rows}
      />
    </div>
  );
}
