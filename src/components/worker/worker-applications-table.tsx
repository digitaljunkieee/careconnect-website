"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import type { WorkerApplicationRow } from "@/lib/worker-portal";
import { formatDateTime } from "@/lib/format";

type WorkerApplicationsTableProps = {
  rows: WorkerApplicationRow[];
  page: number;
  pageCount: number;
  basePath: string;
  query: Record<string, string | undefined>;
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "soft"> = {
  PENDING: "outline",
  ACCEPTED: "soft",
  REJECTED: "destructive",
  CANCELLED: "secondary"
};

export function WorkerApplicationsTable({
  rows,
  page,
  pageCount,
  basePath,
  query
}: WorkerApplicationsTableProps) {
  const columns: ColumnDef<WorkerApplicationRow>[] = [
    {
      accessorKey: "facilityName",
      header: "Facility",
      cell: ({ row }) => <div className="font-medium">{row.original.facilityName}</div>
    },
    {
      accessorKey: "shiftId",
      header: "Shift Details",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.roleRequired}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.startTime} - {row.original.endTime}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDateTime(row.original.shiftDate)}
          </div>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Application Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANTS[row.original.status] ?? "secondary"}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: "appliedAt",
      header: "Applied Date",
      cell: ({ row }) => formatDateTime(row.original.appliedAt)
    }
  ];

  return (
    <DataTable
      basePath={basePath}
      columns={columns}
      data={rows}
      emptyState="You have not applied to any shifts yet."
      page={page}
      pageCount={pageCount}
      query={query}
    />
  );
}
