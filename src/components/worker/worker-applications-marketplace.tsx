"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { PaginationControls } from "@/components/pagination-controls";
import { formatDate, formatDateTime } from "@/lib/format";
import type {
  WorkerApplicationRow,
  WorkerApplicationStatusCounts
} from "@/lib/worker-portal";
import { buildPageHref } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";

type ApplicationsQuery = {
  search: string;
  status: string;
  pageSize: string;
};

type WorkerApplicationsMarketplaceProps = {
  rows: WorkerApplicationRow[];
  totalCount: number;
  page: number;
  pageCount: number;
  basePath: string;
  query: ApplicationsQuery;
  statusCounts: WorkerApplicationStatusCounts;
};

type StatusTabKey = "all" | "PENDING" | "ACCEPTED" | "REJECTED";

type StatusTab = {
  key: StatusTabKey;
  label: string;
};

const STATUS_TABS: StatusTab[] = [
  { key: "all", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "REJECTED", label: "Rejected" }
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" }
] as const;

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "border-[#13d9cb]/20 bg-[#13d9cb]/12 text-[#13d9cb]";
    case "REJECTED":
      return "border-rose-500/20 bg-rose-500/12 text-rose-200";
    case "PENDING":
      return "border-[#2bb9ff]/20 bg-[#2bb9ff]/12 text-[#2bb9ff]";
    default:
      return "border-white/10 bg-white/8 text-white/70";
  }
}

function ApplicationStat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#15243A] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function StatusTabLink({
  active,
  count,
  href,
  label
}: {
  active: boolean;
  count: number;
  href: string;
  label: string;
}) {
  return (
    <Link
      className={cn(
        "flex items-center justify-between gap-4 rounded-[22px] border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5",
        active
          ? "border-[#13d9cb]/25 bg-[linear-gradient(135deg,rgba(7,108,130,0.35),rgba(19,217,203,0.12))] text-white shadow-[0_18px_40px_rgba(4,14,38,0.25)]"
          : "border-white/10 bg-white/5 text-white/70 hover:border-[#2bb9ff]/25 hover:bg-white/8"
      )}
      href={href}
    >
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</div>
      </div>
      <div
        className={cn(
          "rounded-full border px-3 py-1 text-xs font-semibold",
          active ? "border-white/15 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70"
        )}
      >
        {count}
      </div>
    </Link>
  );
}

function ApplicationCard({
  application,
  onViewDetails
}: {
  application: WorkerApplicationRow;
  onViewDetails: (application: WorkerApplicationRow) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/95 p-5 text-foreground shadow-[0_1px_0_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2bb9ff]/35 hover:shadow-[0_22px_45px_rgba(4,14,38,0.16)] dark:bg-[#101D31] dark:text-white dark:shadow-none dark:hover:shadow-[0_22px_45px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  getStatusBadgeClassName(application.status)
                )}
              >
                {application.status}
              </Badge>
            </div>

            <div className="space-y-1">
              <h3 className="truncate font-display text-2xl font-semibold tracking-tight text-foreground dark:text-white">
                {application.facilityName}
              </h3>
              <p className="text-sm text-muted-foreground dark:text-white/65">
                {application.roleRequired}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-semibold tracking-tight text-foreground dark:text-white">
              {application.hourlyRateLabel}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground dark:text-white/45">
              Per hour
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ApplicationStat label="Shift date" value={formatDate(application.shiftDate)} />
          <ApplicationStat label="Shift time" value={`${application.startTime} - ${application.endTime}`} />
          <ApplicationStat label="Applied on" value={formatDateTime(application.appliedAt)} />
          <ApplicationStat label="Status" value={application.status} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="w-full rounded-2xl sm:flex-1"
            onClick={() => onViewDetails(application)}
            variant="outline"
          >
            View details
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  hasFilters,
  basePath
}: {
  hasFilters: boolean;
  basePath: string;
}) {
  return (
    <div className="flex min-h-[28rem] items-center justify-center rounded-[32px] border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center shadow-sm dark:bg-white/5">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#13d9cb]/10 text-[#13d9cb]">
          <Sparkles className="h-9 w-9" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
            {hasFilters ? "No applications match your filters" : "No applications yet"}
          </h3>
          <p className="text-sm leading-6 text-white/65">
            {hasFilters
              ? "Try a different status or search again to narrow the list."
              : "Browse available shifts and apply when you find the right fit."}
          </p>
        </div>
        <Button asChild className="rounded-2xl bg-[#076c82] text-white hover:bg-[#13d9cb]">
          <Link href={hasFilters ? basePath : "/dashboard/worker/shifts"}>
            {hasFilters ? "Reset filters" : "Browse shifts"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function WorkerApplicationsMarketplace({
  rows,
  totalCount,
  page,
  pageCount,
  basePath,
  query,
  statusCounts
}: WorkerApplicationsMarketplaceProps) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [selectedApplication, setSelectedApplication] = React.useState<WorkerApplicationRow | null>(null);
  const activeStatus = query.status === "PENDING" || query.status === "ACCEPTED" || query.status === "REJECTED"
    ? query.status
    : "all";
  const hasFilters = Boolean(query.search.trim()) || activeStatus !== "all";

  const buildHref = (nextStatus: string) =>
    buildPageHref(
      basePath,
      {
        pageSize: query.pageSize,
        search: query.search || undefined,
        status: nextStatus === "all" ? undefined : nextStatus
      },
      1
    );

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(43,185,255,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(19,217,203,0.16),transparent_22%),linear-gradient(135deg,rgba(4,14,38,0.98),rgba(7,23,53,0.96))] p-6 text-white shadow-[0_30px_80px_rgba(4,14,38,0.24)] sm:p-8">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {totalCount} {totalCount === 1 ? "Application" : "Applications"}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              My applications
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              Track shifts you have applied for.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATUS_TABS.map((tab) => {
          const countKey = tab.key === "all" ? "ALL" : tab.key;

          return (
            <StatusTabLink
              key={tab.key}
              active={activeStatus === tab.key}
              count={statusCounts[countKey]}
              href={buildHref(tab.key)}
              label={tab.label}
            />
          );
        })}
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-xl">
        <form
          ref={formRef}
          className="flex flex-col gap-3 lg:flex-row lg:items-end"
          method="get"
        >
          <input name="page" type="hidden" value="1" />
          <input name="pageSize" type="hidden" value={query.pageSize} />

          <div className="flex-1 space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Search applications
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <Input
                className="h-11 rounded-2xl border-white/10 bg-[#15243A] pl-11 text-white placeholder:text-white/35 shadow-none focus-visible:border-[#2bb9ff]/60 focus-visible:ring-2 focus-visible:ring-[#13d9cb]/20 focus-visible:ring-offset-0"
                defaultValue={query.search}
                name="search"
                placeholder="Search applications"
              />
            </div>
          </div>

          <div className="space-y-1.5 lg:min-w-[14rem]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Status
            </div>
            <Select
              defaultValue={activeStatus}
              name="status"
              onValueChange={() => {
                formRef.current?.requestSubmit();
              }}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-[#15243A] text-sm text-white shadow-none focus:ring-2 focus:ring-[#13d9cb]/20">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0b1730] text-white shadow-2xl">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    className="focus:bg-white/10 focus:text-white"
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 lg:self-center">
            <Button
              asChild
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white hover:bg-white/10"
              variant="ghost"
            >
              <Link href={basePath}>Reset</Link>
            </Button>
          </div>
        </form>
      </section>

      {rows.length ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            {rows.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onViewDetails={setSelectedApplication}
              />
            ))}
          </div>

          {pageCount > 1 ? (
            <PaginationControls
              className="dark:bg-[#101D31]/80"
              nextHref={buildPageHref(
                basePath,
                {
                  pageSize: query.pageSize,
                  search: query.search || undefined,
                  status: activeStatus === "all" ? undefined : activeStatus
                },
                Math.min(page + 1, pageCount)
              )}
              page={page}
              pageCount={pageCount}
              previousHref={buildPageHref(
                basePath,
                {
                  pageSize: query.pageSize,
                  search: query.search || undefined,
                  status: activeStatus === "all" ? undefined : activeStatus
                },
                Math.max(page - 1, 1)
              )}
            />
          ) : null}
        </div>
      ) : (
        <EmptyState basePath={basePath} hasFilters={hasFilters} />
      )}

      <Sheet
        open={Boolean(selectedApplication)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplication(null);
          }
        }}
      >
        <SheetContent className="w-[min(44rem,calc(100vw-1rem))] overflow-y-auto border-white/10 bg-[#040e26]/95 p-0 text-white sm:max-w-none">
          {selectedApplication ? (
            <>
              <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(43,185,255,0.12),transparent_30%),linear-gradient(135deg,rgba(4,14,38,0.96),rgba(7,23,53,0.95))] px-6 py-6 text-white">
                <SheetHeader className="space-y-4 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        getStatusBadgeClassName(selectedApplication.status)
                      )}
                    >
                      {selectedApplication.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <SheetTitle className="font-display text-3xl font-semibold tracking-tight">
                      {selectedApplication.facilityName}
                    </SheetTitle>
                    <SheetDescription className="max-w-xl text-white/75">
                      {selectedApplication.roleRequired}
                    </SheetDescription>
                  </div>
                </SheetHeader>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ApplicationStat
                    label="Facility"
                    value={selectedApplication.facilityName}
                  />
                  <ApplicationStat label="Role" value={selectedApplication.roleRequired} />
                  <ApplicationStat
                    label="Shift date"
                    value={formatDate(selectedApplication.shiftDate)}
                  />
                  <ApplicationStat
                    label="Shift time"
                    value={`${selectedApplication.startTime} - ${selectedApplication.endTime}`}
                  />
                  <ApplicationStat
                    label="Rate"
                    value={selectedApplication.hourlyRateLabel}
                  />
                  <ApplicationStat
                    label="Applied on"
                    value={formatDateTime(selectedApplication.appliedAt)}
                  />
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Application status
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/75">
                    {selectedApplication.status === "PENDING"
                      ? "This application is waiting for a facility decision."
                      : selectedApplication.status === "ACCEPTED"
                        ? "This application was accepted and moved into your assignments."
                        : "This application was not selected, but the opportunity can still inspire future matches."}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
