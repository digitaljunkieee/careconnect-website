"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  page: number;
  pageCount: number;
  previousHref?: string;
  nextHref?: string;
  className?: string;
};

function PageButton({
  children,
  disabled,
  href,
  direction
}: {
  children: string;
  disabled: boolean;
  href?: string;
  direction: "left" | "right";
}) {
  const sharedClassName =
    "h-9 rounded-xl border-border/70 bg-background/70 px-3 text-sm shadow-none transition-colors hover:bg-[#13d9cb]/8 hover:text-foreground sm:h-10";

  if (disabled || !href) {
    return (
      <Button className={sharedClassName} disabled size="sm" variant="outline">
        {direction === "left" ? <ChevronLeft className="h-4 w-4" /> : null}
        {children}
        {direction === "right" ? <ChevronRight className="h-4 w-4" /> : null}
      </Button>
    );
  }

  return (
    <Button asChild className={sharedClassName} size="sm" variant="outline">
      <Link href={href}>
        {direction === "left" ? <ChevronLeft className="h-4 w-4" /> : null}
        {children}
        {direction === "right" ? <ChevronRight className="h-4 w-4" /> : null}
      </Link>
    </Button>
  );
}

export function PaginationControls({
  page,
  pageCount,
  previousHref,
  nextHref,
  className
}: PaginationControlsProps) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= pageCount;

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-3xl border border-border/70 bg-background/80 px-3 py-3 shadow-sm",
        className
      )}
    >
      <PageButton direction="left" disabled={isFirstPage} href={previousHref}>
        Previous
      </PageButton>

      <div className="whitespace-nowrap text-center text-[11px] font-medium tracking-[0.16em] text-muted-foreground sm:text-xs">
        Page {page} of {pageCount}
      </div>

      <PageButton direction="right" disabled={isLastPage} href={nextHref}>
        Next
      </PageButton>
    </div>
  );
}
