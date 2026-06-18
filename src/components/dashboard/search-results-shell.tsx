import Link from "next/link";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardSearchSection } from "@/lib/dashboard-search";

type DashboardSearchResultsShellProps = {
  title: string;
  description: string;
  query: string;
  searchPath: string;
  placeholder: string;
  sections: DashboardSearchSection[];
};

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function DashboardSearchResultsShell({
  title,
  description,
  query,
  searchPath,
  placeholder,
  sections
}: DashboardSearchResultsShellProps) {
  const hasResults = sections.some((section) => section.results.length > 0);

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[1fr_auto]" method="get">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="q">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="q"
                  name="q"
                  placeholder={placeholder}
                  defaultValue={query}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <Button className="rounded-2xl" type="submit">
                Search
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href={searchPath}>Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasResults ? (
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.key} className="border-border/70">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                  <Badge variant="soft" className="w-fit rounded-full">
                    {section.results.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {section.results.length ? (
                  <div className="space-y-3">
                    {section.results.map((result) => (
                      <div
                        key={result.id}
                        className={cn(
                          "flex flex-col gap-4 rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        )}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {result.title}
                          </div>
                          <div className="truncate text-sm text-muted-foreground">
                            {result.subtitle}
                          </div>
                          {result.meta ? (
                            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              {result.meta}
                            </div>
                          ) : null}
                        </div>
                        <Button asChild className="rounded-2xl" size="sm" variant="outline">
                          <Link href={result.href}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState label={section.emptyLabel} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/70">
          <CardContent className="py-10">
            <EmptyState label="Enter a search term to find matching shifts, applications, and profile details." />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
