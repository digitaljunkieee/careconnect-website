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
import { EntityToggleActions } from "@/components/admin/entity-toggle-actions";
import { getAdminFacilityListData } from "@/lib/admin-data";
import { parsePage, parsePageSize } from "@/lib/pagination";

type FacilitiesPageProps = {
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

export default async function AdminFacilitiesPage({
  searchParams
}: FacilitiesPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(firstQueryValue(params.pageSize), 10);
  const search = firstQueryValue(params.search);
  const activityStatus = firstQueryValue(params.activityStatus);

  const data = await getAdminFacilityListData({
    page,
    pageSize,
    search,
    activityStatus:
      activityStatus && activityStatus !== "ALL"
        ? (activityStatus as "ACTIVE" | "INACTIVE")
        : undefined
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
          <CardDescription>Search facility accounts and update their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-6" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Company name, address, or contact"
                defaultValue={search}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="activityStatus">
                Status
              </label>
              <select
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
                defaultValue={activityStatus || "ALL"}
                id="activityStatus"
                name="activityStatus"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Search facilities
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/facilities">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
          <CardDescription>
            {data.rows.length
              ? "Each row includes a quick view link and an activation toggle."
              : "No facilities match the current filters. Try searching by company name or clear the activity filter."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Company Name</th>
                    <th className="px-4 py-3 font-medium">Contact Person</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Total Shifts</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-4 font-medium">{row.companyName}</td>
                      <td className="px-4 py-4">{row.contactPerson}</td>
                      <td className="px-4 py-4">{row.email}</td>
                      <td className="px-4 py-4">{row.totalShifts}</td>
                      <td className="px-4 py-4">
                        <Badge variant={row.isActive ? "soft" : "secondary"}>
                          {row.isActive ? "Live" : "Paused"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <EntityToggleActions
                          entityLabel="Facility"
                          endpoint={`/api/admin/facilities/${row.id}`}
                          isActive={row.isActive}
                          viewHref={`/dashboard/admin/facilities/${row.id}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No facilities match the current filters. Try searching by company name or clear the activity filter." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
