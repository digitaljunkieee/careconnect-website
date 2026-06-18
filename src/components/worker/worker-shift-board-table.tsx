"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import type { WorkerShiftBoardRow } from "@/lib/worker-portal";
import { formatDate } from "@/lib/format";
import { ShiftApplyButton } from "@/components/worker/shift-apply-button";

type WorkerShiftBoardTableProps = {
  rows: WorkerShiftBoardRow[];
  page: number;
  pageCount: number;
  basePath: string;
  query: Record<string, string | undefined>;
  canApply: boolean;
};

export function WorkerShiftBoardTable({
  rows,
  page,
  pageCount,
  basePath,
  query,
  canApply
}: WorkerShiftBoardTableProps) {
  const columns: ColumnDef<WorkerShiftBoardRow>[] = [
    {
      accessorKey: "facilityName",
      header: "Facility",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium">{row.original.facilityName}</div>
          <div className="text-xs text-muted-foreground">Live shift</div>
        </div>
      )
    },
    {
      accessorKey: "date",
      header: "Shift Date",
      cell: ({ row }) => formatDate(row.original.date)
    },
    {
      accessorKey: "startTime",
      header: "Time",
      cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`
    },
    {
      accessorKey: "hourlyRate",
      header: "Hourly Rate",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.hourlyRateLabel}</Badge>
      )
    },
    {
      accessorKey: "roleRequired",
      header: "Role Required",
      cell: ({ row }) => row.original.roleRequired
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm text-muted-foreground">
          {row.original.notes || "No notes added for this shift."}
        </span>
      )
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <ShiftApplyButton
          alreadyApplied={row.original.alreadyApplied}
          canApply={canApply}
          shiftId={row.original.id}
        />
      )
    }
  ];

  return (
    <DataTable
      basePath={basePath}
      columns={columns}
      data={rows}
      emptyState="No open shifts match your filters. Try widening the search or clearing the date range."
      page={page}
      pageCount={pageCount}
      query={query}
    />
  );
}
