"use client";

import { useDashboardTheme } from "@/components/providers/dashboard-theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type DashboardAppearanceCardProps = {
  tone?: "light" | "dark";
  className?: string;
  title?: string;
  description?: string;
};

const toneStyles = {
  light: {
    card: "border-border/70",
    description: "text-muted-foreground",
    label: "text-foreground",
    status: "text-muted-foreground",
    row: "border-border/70 bg-muted/25"
  },
  dark: {
    card: "border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]",
    description: "text-white/60",
    label: "text-white",
    status: "text-white/65",
    row: "border-white/10 bg-[#15243A]"
  }
} as const;

export function DashboardAppearanceCard({
  tone = "light",
  className,
  title = "Appearance",
  description = "Set the dashboard mode."
}: DashboardAppearanceCardProps) {
  const { theme, setTheme } = useDashboardTheme();
  const styles = toneStyles[tone];

  return (
    <Card className={cn(styles.card, className)}>
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <CardTitle className={cn(tone === "dark" && "text-white")}>{title}</CardTitle>
        <CardDescription className={styles.description}>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
        <div className={cn("flex items-center justify-between gap-4 rounded-3xl border px-4 py-4", styles.row)}>
          <div className="space-y-1">
            <p className={cn("text-sm font-medium", styles.label)}>Dark dashboard</p>
            <p className={cn("text-sm", styles.status)}>
              {theme === "dark" ? "Enabled" : "Disabled"}
            </p>
          </div>
          <Switch
            aria-label="Dark dashboard"
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
