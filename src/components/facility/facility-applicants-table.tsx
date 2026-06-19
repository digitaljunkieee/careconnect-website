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
  showRoleType?: boolean;
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
  showShift = false,
  showRoleType = true
}: FacilityApplicantsTableProps) {
  const columns: ColumnDef<ApplicantRow>[] = [
    {
      accessorKey: "workerName",
      header: "Worker",
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
      header: "Verification",
      cell: ({ row }) => (
        <Badge
          className="h-6 rounded-full px-2 text-[11px] font-semibold tracking-[0.08em]"
          variant={VERIFICATION_VARIANTS[row.original.verificationStatus]}
        >
          {VERIFICATION_STATUS_LABELS[row.original.verificationStatus]}
        </Badge>
      )
    },
    ...(showRoleType
      ? ([
          {
            accessorKey: "roleType",
            header: "Role",
            cell: ({ row }) =>
              WORKER_ROLE_TYPE_LABELS[
                row.original.roleType as keyof typeof WORKER_ROLE_TYPE_LABELS
              ] ?? row.original.roleType
          }
        ] as ColumnDef<ApplicantRow>[])
      : []),
    {
      accessorKey: "appliedAt",
      header: "Applied",
      cell: ({ row }) => formatDateTime(row.original.appliedAt)
    },
    {
      accessorKey: "applicationStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className="h-6 rounded-full px-2 text-[11px] font-semibold tracking-[0.08em]"
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
      emptyState="No applications match your filters."
      page={page}
      pageCount={pageCount}
      query={query}
    />
  );
}
