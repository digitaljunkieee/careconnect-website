import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WorkerShiftMarketplace } from "@/components/worker/worker-shift-marketplace";
import { getWorkerProfileData, getWorkerShiftBoardData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";

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

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function resolveDatePresetRange(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buildRange = (offsetDays: number) => {
    const start = new Date(today);
    start.setDate(start.getDate() + offsetDays);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return {
      dateFrom: toDateInputValue(start),
      dateTo: toDateInputValue(end)
    };
  };

  switch (value) {
    case "today":
      return buildRange(0);
    case "tomorrow":
      return buildRange(1);
    case "week": {
      const start = new Date(today);
      const end = new Date(today);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      return {
        dateFrom: toDateInputValue(start),
        dateTo: toDateInputValue(end)
      };
    }
    case "fortnight": {
      const start = new Date(today);
      const end = new Date(today);
      end.setDate(end.getDate() + 13);
      end.setHours(23, 59, 59, 999);

      return {
        dateFrom: toDateInputValue(start),
        dateTo: toDateInputValue(end)
      };
    }
    default:
      return {};
  }
}

function resolveRatePreset(value: string) {
  const minRate = Number.parseFloat(value);

  if (!Number.isFinite(minRate)) {
    return {};
  }

  return { minRate };
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
  const pageSize = parsePageSize(
    firstQueryValue(resolvedSearchParams.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );

  const role = firstQueryValue(resolvedSearchParams.role, "all");
  const date = firstQueryValue(resolvedSearchParams.date, "all");
  const distance = firstQueryValue(resolvedSearchParams.distance, "all");
  const rate = firstQueryValue(resolvedSearchParams.rate, "all");
  const search = firstQueryValue(resolvedSearchParams.search);

  const dateRange = resolveDatePresetRange(date);
  const rateRange = resolveRatePreset(rate);

  const [profile, board] = await Promise.all([
    getWorkerProfileData(user.id),
    getWorkerShiftBoardData(user.id, {
      search,
      role,
      distance,
      page,
      pageSize,
      ...dateRange,
      ...rateRange
    })
  ]);

  if (!profile || !board) {
    return (
      <div className="rounded-[32px] border border-border/70 bg-background/80 p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Available shifts
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your worker profile before browsing shifts.
        </p>
      </div>
    );
  }

  const canApply = profile.verificationStatus === "VERIFIED" && profile.isVerified;

  return (
    <WorkerShiftMarketplace
      basePath="/dashboard/worker/shifts"
      canApply={canApply}
      page={board.page}
      pageCount={board.pageCount}
      query={{
        search,
        role,
        date,
        distance,
        rate,
        pageSize: String(pageSize)
      }}
      shifts={board.rows}
      totalCount={board.total}
    />
  );
}
