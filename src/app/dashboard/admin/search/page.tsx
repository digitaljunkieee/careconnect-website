import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAdminSearchData } from "@/lib/admin-platform";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { formatDateTime } from "@/lib/format";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default async function AdminSearchPage({
  searchParams
}: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(firstQueryValue(params.pageSize), 10);
  const q = firstQueryValue(params.q);
  const entityType = firstQueryValue(params.entityType, "ALL") as
    | "ALL"
    | "WORKER"
    | "FACILITY"
    | "SHIFT"
    | "APPLICATION";

  const data = await getAdminSearchData({
    page,
    pageSize,
    q,
    entityType
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Find workers, facilities, shifts, and applications from one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-6" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2 lg:col-span-3">
              <label className="text-sm font-medium" htmlFor="q">
                Search query
              </label>
              <Input id="q" name="q" placeholder="Name, email, shift, or facility" defaultValue={q} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="entityType">
                Entity type
              </label>
              <select
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
                defaultValue={entityType}
                id="entityType"
                name="entityType"
              >
                <option value="ALL">All</option>
                <option value="WORKER">Workers</option>
                <option value="FACILITY">Facilities</option>
                <option value="SHIFT">Shifts</option>
                <option value="APPLICATION">Applications</option>
              </select>
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Search
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/search">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {data.rows.length ? "Results from the current search are shown below." : "No results for the current query. Try a broader search term or switch the entity type."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Entity</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={`${row.entityType}-${row.id}`} className="border-t border-border/60">
                      <td className="px-4 py-4">
                        <Badge variant="outline">{row.entityType}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{row.title}</div>
                        <div className="text-xs text-muted-foreground">{row.subtitle}</div>
                      </td>
                      <td className="px-4 py-4">{row.status}</td>
                      <td className="px-4 py-4">{formatDateTime(row.createdAt)}</td>
                      <td className="px-4 py-4">
                        <Button asChild className="rounded-2xl" size="sm" variant="outline">
                          <Link href={row.href}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="Try a broader search term or switch the entity type to surface matches." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
