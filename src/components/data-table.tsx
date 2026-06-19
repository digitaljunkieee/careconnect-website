"use client";

import type { ReactNode } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PaginationControls } from "@/components/pagination-controls";
import { buildPageHref } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  page: number;
  pageCount: number;
  basePath: string;
  query?: Record<string, string | undefined>;
  emptyState: ReactNode;
  className?: string;
  rowClassName?: string;
  cellClassName?: string;
  headClassName?: string;
};

export function DataTable<TData>({
  columns,
  data,
  page,
  pageCount,
  basePath,
  query,
  emptyState,
  className,
  rowClassName,
  cellClassName,
  headClassName
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount
  });
  const currentPage = Math.min(Math.max(page, 1), pageCount);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-background/80 shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={headClassName}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={rowClassName}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cellClassName}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-12 text-center" colSpan={columns.length}>
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length ? (
        <PaginationControls
          nextHref={buildPageHref(basePath, query, Math.min(currentPage + 1, pageCount))}
          page={currentPage}
          pageCount={pageCount}
          previousHref={buildPageHref(basePath, query, Math.max(currentPage - 1, 1))}
        />
      ) : null}
    </div>
  );
}
