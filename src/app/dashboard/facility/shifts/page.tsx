import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FacilityCreateShiftDialog } from "@/components/facility/create-shift-dialog";
import { FacilityShiftsTable } from "@/components/facility/facility-shifts-table";
import { getFacilityShiftListData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";
import type { ShiftStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
  const pageSize = parsePageSize(
    firstQueryValue(resolvedSearchParams.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const status = normalizeStatus(firstQueryValue(resolvedSearchParams.status));
  const search = firstQueryValue(resolvedSearchParams.search);

  const data = await getFacilityShiftListData(user.id, {
    page,
    pageSize,
    status,
    search
  });

  if (!data) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Shifts</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete your facility profile before posting or managing shifts.
        </p>
        <Button asChild className="mt-5 rounded-xl" variant="outline">
          <Link href="/dashboard/facility/profile">Go to profile</Link>
        </Button>
      </div>
    );
  }

  const tabHref = (nextStatus?: ShiftStatus) => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (nextStatus) params.set("status", nextStatus);
    if (pageSize) params.set("pageSize", String(pageSize));

    return params.toString()
      ? `/dashboard/facility/shifts?${params.toString()}`
      : "/dashboard/facility/shifts";
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.85rem]">
            Shifts
          </h1>
          <p className="text-sm text-muted-foreground">Track shifts and applicants.</p>
        </div>
        <FacilityCreateShiftDialog
          triggerClassName="h-10 rounded-xl border-transparent bg-[#076c82] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#065a6b] hover:text-white"
        />
      </section>

      <section className="space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className={cn("h-9 rounded-full px-4", !status && "bg-[#076c82] text-white hover:bg-[#065a6b] hover:text-white")}
            variant={!status ? "default" : "outline"}
            size="sm"
          >
            <Link href={tabHref(undefined)}>All</Link>
          </Button>
          <Button
            asChild
            className={cn("h-9 rounded-full px-4", status === "OPEN" && "bg-[#076c82] text-white hover:bg-[#065a6b] hover:text-white")}
            variant={status === "OPEN" ? "default" : "outline"}
            size="sm"
          >
            <Link href={tabHref("OPEN")}>Live</Link>
          </Button>
          <Button
            asChild
            className={cn("h-9 rounded-full px-4", status === "CLOSED" && "bg-[#076c82] text-white hover:bg-[#065a6b] hover:text-white")}
            variant={status === "CLOSED" ? "default" : "outline"}
            size="sm"
          >
            <Link href={tabHref("CLOSED")}>Closed</Link>
          </Button>
          <Button
            asChild
            className={cn("h-9 rounded-full px-4", status === "FILLED" && "bg-[#076c82] text-white hover:bg-[#065a6b] hover:text-white")}
            variant={status === "FILLED" ? "default" : "outline"}
            size="sm"
          >
            <Link href={tabHref("FILLED")}>Filled</Link>
          </Button>
        </div>

        <form
          className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/55 p-2.5 sm:flex-row sm:items-center"
          method="get"
        >
          <input name="page" type="hidden" value="1" />
          <input name="pageSize" type="hidden" value={String(pageSize)} />
          {status ? <input name="status" type="hidden" value={status} /> : null}

          <div className="flex-1">
            <Input
              className="h-9 border-border/70 bg-background/65 shadow-none"
              id="search"
              name="search"
              placeholder="Search roles or notes"
              defaultValue={search}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="h-9 rounded-xl border-transparent bg-[#076c82] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#065a6b] hover:text-white"
              type="submit"
            >
              Search
            </Button>
            <Button
              asChild
              className="h-9 rounded-xl border-border/70 bg-background/55 px-4 text-sm font-medium shadow-none hover:bg-accent/70 hover:text-foreground"
              variant="outline"
            >
              <Link href="/dashboard/facility/shifts">Reset</Link>
            </Button>
          </div>
        </form>
      </section>

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
