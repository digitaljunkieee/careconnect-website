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
      accessorKey: "date",
      header: "Date",
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
      cell: ({ row }) => row.original.applicationCount
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <FacilityShiftActions
          shiftId={row.original.id}
          status={row.original.status}
        />
      )
    }
  ];

  return (
    <DataTable
      basePath={basePath}
      columns={columns}
      data={rows}
      emptyState="No shifts match your filters. Try widening the search or clearing the status filter."
      page={page}
      pageCount={pageCount}
      query={query}
    />
  );
}
