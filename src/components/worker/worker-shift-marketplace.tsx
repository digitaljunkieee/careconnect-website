"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ShiftApplyButton } from "@/components/worker/shift-apply-button";
import { formatDate } from "@/lib/format";
import type { WorkerShiftBoardRow } from "@/lib/worker-portal";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Star
} from "lucide-react";

type MarketplaceQuery = {
  search: string;
  role: string;
  date: string;
  distance: string;
  rate: string;
  pageSize: string;
};

type WorkerShiftMarketplaceProps = {
  shifts: WorkerShiftBoardRow[];
  totalCount: number;
  page: number;
  pageCount: number;
  basePath: string;
  query: MarketplaceQuery;
  canApply: boolean;
};

type SelectOption = {
  value: string;
  label: string;
};

const ROLE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All roles" },
  { value: "care assistant", label: "Care Assistant" },
  { value: "support worker", label: "Support Worker" },
  { value: "senior carer", label: "Senior Carer" },
  { value: "nurse", label: "Nurse" },
  { value: "dementia care", label: "Dementia Care" },
  { value: "home care", label: "Home Care" },
  { value: "respite support", label: "Respite Support" },
  { value: "cleaning", label: "Cleaning" }
];

const DATE_OPTIONS: SelectOption[] = [
  { value: "all", label: "Any date" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "Next 7 days" },
  { value: "fortnight", label: "Next 14 days" }
];

const DISTANCE_OPTIONS: SelectOption[] = [
  { value: "all", label: "Any distance" },
  { value: "nearby", label: "Nearby" },
  { value: "city", label: "City match" },
  { value: "regional", label: "Regional" }
];

const RATE_OPTIONS: SelectOption[] = [
  { value: "all", label: "Any rate" },
  { value: "15", label: "£15+/hr" },
  { value: "18", label: "£18+/hr" },
  { value: "20", label: "£20+/hr" },
  { value: "25", label: "£25+/hr" }
];

function MarketplaceFilterSelect({
  formRef,
  label,
  name,
  options,
  value
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  label: string;
  name: keyof MarketplaceQuery;
  options: SelectOption[];
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <Select
        defaultValue={value || "all"}
        onValueChange={() => {
          formRef.current?.requestSubmit();
        }}
        name={name}
      >
        <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/70 text-sm shadow-none">
          <SelectValue placeholder={options[0]?.label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ShiftMeta({
  icon: Icon,
  label
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/55 px-3 py-2 text-sm text-foreground dark:bg-white/5">
      <Icon className="h-4 w-4 shrink-0 text-[#2bb9ff]" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function ShiftTag({ children }: { children: string }) {
  return (
    <Badge className="rounded-full border-transparent bg-[#13d9cb]/10 px-3 py-1 text-[11px] font-semibold text-[#13d9cb] hover:bg-[#13d9cb]/10">
      {children}
    </Badge>
  );
}

function InfoRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4 dark:bg-white/5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function ShiftCard({
  shift,
  featured,
  canApply,
  onViewDetails
}: {
  shift: WorkerShiftBoardRow;
  featured?: boolean;
  canApply: boolean;
  onViewDetails: (shift: WorkerShiftBoardRow) => void;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[30px] border border-border/70 bg-white/95 p-5 shadow-[0_1px_0_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2bb9ff]/40 hover:shadow-[0_22px_45px_rgba(4,14,38,0.14)] dark:bg-[#101D31] dark:shadow-none dark:hover:shadow-[0_22px_45px_rgba(0,0,0,0.35)]",
        featured && "md:col-span-2"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-5",
          featured && "xl:flex-row xl:items-start xl:justify-between"
        )}
      >
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {featured ? (
              <Badge className="rounded-full bg-[#076c82] text-white hover:bg-[#076c82]">
                <Star className="mr-1 h-3.5 w-3.5" />
                Featured
              </Badge>
            ) : null}
            {shift.alreadyApplied ? (
              <Badge variant="secondary" className="rounded-full">
                Applied
              </Badge>
            ) : null}
            {!canApply && !shift.alreadyApplied ? (
              <Badge className="rounded-full border-white/10 bg-white/5 text-white/70 dark:border-border/70 dark:bg-white/5">
                Verification required
              </Badge>
            ) : null}
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {shift.facilityType || "Care opportunity"}
            </div>
            <h3
              className={cn(
                "font-display font-semibold tracking-tight text-foreground",
                featured ? "text-2xl sm:text-3xl" : "text-xl"
              )}
            >
              {shift.facilityName}
            </h3>
            <p className="text-sm text-muted-foreground">{shift.roleRequired}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {shift.tags.map((tag) => (
              <ShiftTag key={tag}>{tag}</ShiftTag>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 xl:items-end">
          <div
            className={cn(
              "font-semibold tracking-tight text-foreground",
              featured ? "text-3xl sm:text-4xl" : "text-2xl"
            )}
          >
            {shift.hourlyRateLabel}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Per hour
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-5 grid gap-3",
          featured ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2"
        )}
      >
        <ShiftMeta icon={CalendarDays} label={formatDate(shift.date)} />
        <ShiftMeta icon={Clock3} label={`${shift.startTime} - ${shift.endTime}`} />
        <ShiftMeta icon={MapPin} label={shift.location} />
        {featured ? <ShiftMeta icon={BadgeCheck} label={shift.facilityType || "Open shift"} /> : null}
      </div>

      {featured ? (
        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">
          {shift.description || "No extra shift notes were added for this opportunity."}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          className="rounded-2xl sm:flex-1"
          onClick={() => {
            onViewDetails(shift);
          }}
          variant="outline"
        >
          View Details
        </Button>

        {shift.alreadyApplied ? (
          <Badge
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border/70 bg-background/70 px-4 text-sm font-medium text-foreground dark:bg-white/5"
            variant="secondary"
          >
            Applied
          </Badge>
        ) : (
          <ShiftApplyButton
            alreadyApplied={false}
            canApply={canApply}
            label="Apply Now"
            shiftId={shift.id}
            triggerClassName="w-full sm:flex-1"
          />
        )}
      </div>
    </article>
  );
}

function EmptyMarketplaceState() {
  return (
    <div className="flex min-h-[28rem] items-center justify-center rounded-[32px] border border-dashed border-border/70 bg-background/70 px-6 py-14 text-center shadow-sm dark:bg-white/5">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#13d9cb]/10 text-[#13d9cb]">
          <Sparkles className="h-9 w-9" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            No shifts match your filters
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Try changing your filters or check back later for new opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}

export function WorkerShiftMarketplace({
  shifts,
  totalCount,
  page,
  pageCount,
  basePath,
  query,
  canApply
}: WorkerShiftMarketplaceProps) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [selectedShift, setSelectedShift] = React.useState<WorkerShiftBoardRow | null>(null);
  const featuredShift = shifts[0] ?? null;
  const regularShifts = shifts.slice(1);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(43,185,255,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(19,217,203,0.16),transparent_22%),linear-gradient(135deg,rgba(4,14,38,0.98),rgba(7,23,53,0.96))] p-6 text-white shadow-[0_30px_80px_rgba(4,14,38,0.24)] sm:p-8">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {totalCount} {totalCount === 1 ? "Available Shift" : "Available Shifts"}
            </div>
            <Badge className="rounded-full border-white/15 bg-white/10 text-white hover:bg-white/10">
              Verified Worker Required
            </Badge>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              Available Shifts
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              Find verified care opportunities that match your availability and qualifications.
            </p>
            {!canApply ? (
              <p className="text-sm text-white/65">
                You can browse every shift now. Apply buttons unlock after verification.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:bg-[#101D31]/80">
        <form
          ref={formRef}
          className="grid gap-4 xl:grid-cols-[1.05fr_0.9fr_0.9fr_0.9fr_auto]"
          method="get"
        >
          <input name="page" type="hidden" value="1" />
          <input name="search" type="hidden" value={query.search} />
          <input name="pageSize" type="hidden" value={query.pageSize} />

          <MarketplaceFilterSelect
            formRef={formRef}
            label="Role"
            name="role"
            options={ROLE_OPTIONS}
            value={query.role}
          />
          <MarketplaceFilterSelect
            formRef={formRef}
            label="Date"
            name="date"
            options={DATE_OPTIONS}
            value={query.date}
          />
          <MarketplaceFilterSelect
            formRef={formRef}
            label="Distance"
            name="distance"
            options={DISTANCE_OPTIONS}
            value={query.distance}
          />
          <MarketplaceFilterSelect
            formRef={formRef}
            label="Hourly rate"
            name="rate"
            options={RATE_OPTIONS}
            value={query.rate}
          />

          <div className="flex items-end gap-3 xl:justify-end">
            <Button asChild className="rounded-2xl" variant="ghost">
              <Link href={basePath}>Clear</Link>
            </Button>
          </div>
        </form>
      </section>

      {!canApply ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 dark:text-muted-foreground">
          Verification required. You can browse now, but apply actions stay locked until your
          worker profile is approved.
        </div>
      ) : null}

      {shifts.length ? (
        <div className="space-y-6">
          {featuredShift ? (
            <ShiftCard
              canApply={canApply}
              featured
              onViewDetails={setSelectedShift}
              shift={featuredShift}
            />
          ) : null}

          {regularShifts.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {regularShifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  canApply={canApply}
                  onViewDetails={setSelectedShift}
                  shift={shift}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyMarketplaceState />
      )}

      {shifts.length && pageCount > 1 ? (
          <PaginationControls
            className="dark:bg-[#101D31]/80"
            nextHref={`${basePath}?${new URLSearchParams({
            search: query.search,
            role: query.role,
            date: query.date,
            distance: query.distance,
            rate: query.rate,
            pageSize: query.pageSize,
            page: String(Math.min(page + 1, pageCount))
          }).toString()}`}
          page={page}
          pageCount={pageCount}
          previousHref={`${basePath}?${new URLSearchParams({
            search: query.search,
            role: query.role,
            date: query.date,
            distance: query.distance,
            rate: query.rate,
            pageSize: query.pageSize,
            page: String(Math.max(page - 1, 1))
          }).toString()}`}
        />
      ) : null}

      <Sheet
        open={Boolean(selectedShift)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedShift(null);
          }
        }}
      >
        <SheetContent className="w-[min(44rem,calc(100vw-1rem))] overflow-y-auto bg-background/95 p-0 sm:max-w-none">
          {selectedShift ? (
            <>
              <div className="border-b border-border/70 bg-[radial-gradient(circle_at_top_right,_rgba(43,185,255,0.12),transparent_30%),linear-gradient(135deg,rgba(4,14,38,0.96),rgba(7,23,53,0.95))] px-6 py-6 text-white">
                <SheetHeader className="space-y-4 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedShift.isFeatured ? (
                      <Badge className="rounded-full bg-white/15 text-white hover:bg-white/15">
                        Featured
                      </Badge>
                    ) : null}
                    {selectedShift.alreadyApplied ? (
                      <Badge className="rounded-full bg-white/15 text-white hover:bg-white/15">
                        Applied
                      </Badge>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <SheetTitle className="font-display text-3xl font-semibold tracking-tight">
                      {selectedShift.facilityName}
                    </SheetTitle>
                    <SheetDescription className="max-w-xl text-white/75">
                      {selectedShift.roleRequired} | {formatDate(selectedShift.date)} |{" "}
                      {selectedShift.location}
                    </SheetDescription>
                  </div>
                </SheetHeader>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Facility" value={selectedShift.facilityName} />
                  <InfoRow label="Role" value={selectedShift.roleRequired} />
                  <InfoRow label="Date" value={formatDate(selectedShift.date)} />
                  <InfoRow
                    label="Time"
                    value={`${selectedShift.startTime} - ${selectedShift.endTime}`}
                  />
                  <InfoRow label="Rate" value={selectedShift.hourlyRateLabel} />
                  <InfoRow label="Location" value={selectedShift.location} />
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/70 p-5 dark:bg-white/5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Requirements
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {selectedShift.requirements || "No specific requirements listed."}
                  </p>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/70 p-5 dark:bg-white/5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Description
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {selectedShift.description || "No additional details were provided."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedShift.tags.map((tag) => (
                    <ShiftTag key={tag}>{tag}</ShiftTag>
                  ))}
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/70 p-4 dark:bg-white/5">
                  {selectedShift.alreadyApplied ? (
                    <Badge className="rounded-full" variant="secondary">
                      Applied
                    </Badge>
                  ) : (
                    <ShiftApplyButton
                      alreadyApplied={false}
                      canApply={canApply}
                      label="Apply Now"
                      shiftId={selectedShift.id}
                      triggerClassName="w-full"
                    />
                  )}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
