"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { AdminWorkerRow } from "@/lib/admin-data";
import {
  VERIFICATION_STATUS_LABELS,
  WORKER_ROLE_TYPE_LABELS
} from "@/lib/constants";
import { EntityToggleActions } from "@/components/admin/entity-toggle-actions";

type AdminWorkersTableProps = {
  rows: AdminWorkerRow[];
  page: number;
  pageCount: number;
  basePath: string;
  query: Record<string, string | undefined>;
};

const VERIFICATION_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "soft"> = {
  PENDING: "outline",
  IN_REVIEW: "secondary",
  VERIFIED: "soft",
  REJECTED: "destructive"
};

export function AdminWorkersTable({
  rows,
  page,
  pageCount,
  basePath,
  query
}: AdminWorkersTableProps) {
  const columns: ColumnDef<AdminWorkerRow>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row }) => <div className="font-medium">{row.original.fullName}</div>
    },
    {
      accessorKey: "email",
      header: "Email"
    },
    {
      accessorKey: "phone",
      header: "Phone"
    },
    {
      accessorKey: "roleType",
      header: "Role Type",
      cell: ({ row }) =>
        WORKER_ROLE_TYPE_LABELS[row.original.roleType] ?? row.original.roleType
    },
    {
      accessorKey: "verificationStatus",
      header: "Verification",
      cell: ({ row }) => (
        <Badge variant={VERIFICATION_VARIANTS[row.original.verificationStatus] ?? "outline"}>
          {VERIFICATION_STATUS_LABELS[row.original.verificationStatus]}
        </Badge>
      )
    },
    {
      accessorKey: "isActive",
      header: "Active Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "soft" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      accessorKey: "registrationDate",
      header: "Registration Date",
      cell: ({ row }) => formatDateTime(row.original.registrationDate)
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <EntityToggleActions
          viewHref={`/dashboard/admin/workers/${row.original.id}`}
          endpoint={`/api/admin/workers/${row.original.id}`}
          entityLabel="Worker"
          isActive={row.original.isActive}
        />
      )
    }
  ];

  return (
    <DataTable
      basePath={basePath}
      columns={columns}
      data={rows}
      emptyState="No workers match your filters. Try widening the search or clearing a filter."
      page={page}
      pageCount={pageCount}
      query={query}
    />
  );
}
