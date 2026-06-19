"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import type { FacilityShiftRow } from "@/lib/facility-portal";
import { formatDate } from "@/lib/format";
import { FacilityShiftActions } from "@/components/facility/shift-actions";
import { SHIFT_STATUS_LABELS, type ShiftStatus } from "@/lib/constants";

type FacilityShiftsTableProps = {
  rows: FacilityShiftRow[];
  page: number;
  pageCount: number;
  basePath: string;
  query: Record<string, string | undefined>;
};

const STATUS_VARIANTS: Record<ShiftStatus, "default" | "secondary" | "destructive" | "outline" | "soft"> = {
  DRAFT: "outline",
  OPEN: "soft",
  FILLED: "secondary",
  CLOSED: "destructive"
};

export function FacilityShiftsTable({
  rows,
  page,
  pageCount,
  basePath,
  query
}: FacilityShiftsTableProps) {
  const columns: ColumnDef<FacilityShiftRow>[] = [
    {
      accessorKey: "roleRequired",
      header: "Role",
      cell: ({ row }) => <div className="font-medium text-foreground">{row.original.roleRequired}</div>
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <div className="text-foreground/80">{formatDate(row.original.date)}</div>
    },
    {
      accessorKey: "startTime",
      header: "Time",
      cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`
    },
    {
      accessorKey: "hourlyRate",
      header: "Rate",
      cell: ({ row }) => <Badge variant="secondary">{row.original.hourlyRateLabel}</Badge>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANTS[row.original.status]}>
          {SHIFT_STATUS_LABELS[row.original.status]}
        </Badge>
      )
    },
    {
      accessorKey: "applicationCount",
      header: "Applicants",
      cell: ({ row }) => (
        <FacilityShiftActions
          shiftId={row.original.id}
          status={row.original.status}
          applicationCount={row.original.applicationCount}
        />
      )
    }
  ];

  return (
    <DataTable
      basePath={basePath}
      columns={columns}
      data={rows}
      cellClassName="px-4 py-5"
      emptyState="No shifts match your filters. Try widening the search or clearing the status filter."
      headClassName="h-11 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
      page={page}
      pageCount={pageCount}
      query={query}
      rowClassName="border-border/40 hover:bg-accent/30"
    />
  );
}
