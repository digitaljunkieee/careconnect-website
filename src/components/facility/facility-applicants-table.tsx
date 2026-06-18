"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import type { ApplicantRow } from "@/lib/facility-portal";
import { formatDateTime } from "@/lib/format";
import { ApplicationDecisionActions } from "@/components/facility/application-decision-actions";
import {
  VERIFICATION_STATUS_LABELS,
  WORKER_ROLE_TYPE_LABELS,
  type VerificationStatus
} from "@/lib/constants";

type FacilityApplicantsTableProps = {
  rows: ApplicantRow[];
  page: number;
  pageCount: number;
  basePath: string;
  query: Record<string, string | undefined>;
  showShift?: boolean;
};

const VERIFICATION_VARIANTS: Record<VerificationStatus, "default" | "secondary" | "destructive" | "outline" | "soft"> = {
  PENDING: "outline",
  IN_REVIEW: "secondary",
  VERIFIED: "soft",
  REJECTED: "destructive"
};

export function FacilityApplicantsTable({
  rows,
  page,
  pageCount,
  basePath,
  query,
  showShift = false
}: FacilityApplicantsTableProps) {
  const columns: ColumnDef<ApplicantRow>[] = [
    {
      accessorKey: "workerName",
      header: "Worker Name",
      cell: ({ row }) => <div className="font-medium">{row.original.workerName}</div>
    },
    ...(showShift
      ? ([
          {
            accessorKey: "shiftLabel",
            header: "Shift",
            cell: ({ row }) => (
              <div className="max-w-[20rem] text-sm text-muted-foreground">
                {row.original.shiftLabel ?? "Unknown shift"}
              </div>
            )
          }
        ] as ColumnDef<ApplicantRow>[])
      : []),
    {
      accessorKey: "verificationStatus",
      header: "Verification Status",
      cell: ({ row }) => (
        <Badge variant={VERIFICATION_VARIANTS[row.original.verificationStatus]}>
          {VERIFICATION_STATUS_LABELS[row.original.verificationStatus]}
        </Badge>
      )
    },
    {
      accessorKey: "roleType",
      header: "Role Type",
      cell: ({ row }) =>
        WORKER_ROLE_TYPE_LABELS[
          row.original.roleType as keyof typeof WORKER_ROLE_TYPE_LABELS
        ] ?? row.original.roleType
    },
    {
      accessorKey: "appliedAt",
      header: "Application Date",
      cell: ({ row }) => formatDateTime(row.original.appliedAt)
    },
    {
      accessorKey: "applicationStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.applicationStatus === "ACCEPTED"
              ? "soft"
              : row.original.applicationStatus === "REJECTED"
                ? "destructive"
                : "outline"
          }
        >
          {row.original.applicationStatus}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Decision",
      cell: ({ row }) => (
        <ApplicationDecisionActions
          applicationId={row.original.id}
          status={row.original.applicationStatus}
        />
      )
    }
  ];

  return (
    <DataTable
      basePath={basePath}
      columns={columns}
      data={rows}
      emptyState="No applications match your filters. Try widening the search or clearing a filter."
      page={page}
      pageCount={pageCount}
      query={query}
    />
  );
}
