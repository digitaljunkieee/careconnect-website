import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  className
}: AdminStatCardProps) {
  return (
    <Card
      className={cn(
        "min-h-28 overflow-hidden border-border/70 bg-card/95 shadow-sm",
        className
      )}
    >
      <CardContent className="flex min-h-28 items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="break-words text-xs font-medium uppercase leading-5 tracking-[0.16em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 break-words text-3xl font-semibold leading-none tracking-tight text-foreground">
            {value}
          </div>
        </div>

        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-primary shadow-sm">
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
