"use client";

import * as React from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  page: number;
  pageCount: number;
  basePath: string;
  query?: Record<string, string | undefined>;
  emptyState: React.ReactNode;
  className?: string;
};

export function DataTable<TData>({
  columns,
  data,
  page,
  pageCount,
  basePath,
  query,
  emptyState,
  className
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount
  });

  const buildHref = React.useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams();

      Object.entries(query ?? {}).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      params.set("page", String(nextPage));

      const queryString = params.toString();
      return queryString ? `${basePath}?${queryString}` : basePath;
    },
    [basePath, query]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-background/80 shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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

      {pageCount > 1 ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-background/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <Button
              asChild
              className="rounded-2xl"
              disabled={page <= 1}
              variant="outline"
            >
              <Link href={buildHref(Math.max(page - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-2xl"
              disabled={page >= pageCount}
              variant="outline"
            >
              <Link href={buildHref(Math.min(page + 1, pageCount))}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
