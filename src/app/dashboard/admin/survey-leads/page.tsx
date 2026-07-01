import Link from "next/link";
import { headers } from "next/headers";
import { BellRing, Building2, Download, UserRound, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/pagination-controls";
import { formatDateTime } from "@/lib/format";
import { buildPageHref, getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";
import { getAdminSurveyLeadListData } from "@/lib/survey-leads";
import { SURVEY_USER_TYPES, type SurveyUserType } from "@/lib/validators/survey";

type SurveyLeadsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const userTypeLabels: Record<SurveyUserType, string> = {
  CARE_WORKER: "Care Worker",
  CARE_FACILITY: "Care Facility",
  INTERESTED_PARTNER: "Interested Partner"
};

function firstQueryValue(value: string | string[] | undefined, fallback = "") {
  return Array.isArray(value) ? (value[0] ?? fallback) : (value ?? fallback);
}

export default async function AdminSurveyLeadsPage({ searchParams }: SurveyLeadsPageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(
    firstQueryValue(params.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const search = firstQueryValue(params.search);
  const requestedType = firstQueryValue(params.userType);
  const userType = SURVEY_USER_TYPES.includes(requestedType as SurveyUserType)
    ? (requestedType as SurveyUserType)
    : undefined;
  const data = await getAdminSurveyLeadListData({ page, pageSize, search, userType });
  const query = {
    search: search || undefined,
    userType: userType || undefined,
    pageSize: String(pageSize)
  };
  const exportParams = new URLSearchParams();

  if (search) exportParams.set("search", search);
  if (userType) exportParams.set("userType", userType);

  const exportHref = `/api/admin/survey-leads/export${exportParams.size ? `?${exportParams.toString()}` : ""}`;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total waitlist", value: data.total, icon: UsersRound },
          { label: "Care workers", value: data.workerTotal, icon: UserRound },
          { label: "Care facilities", value: data.facilityTotal, icon: Building2 },
          { label: "Launch consent", value: data.consented, icon: BellRing }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-border/70">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</div>
                  <div className="mt-2 text-3xl font-semibold">{item.value}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-border/70">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Early access survey leads</CardTitle>
            <CardDescription>Search, filter, and export CareConnect pre-launch responses.</CardDescription>
          </div>
          <Button asChild className="rounded-2xl" variant="outline">
            <Link href={exportHref}>
              <Download className="h-4 w-4" />
              Export CSV
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,14rem)_auto]" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="search">Search</label>
              <Input id="search" name="search" defaultValue={search} placeholder="Name, email, phone, or location" className="h-10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="userType">User type</label>
              <select id="userType" name="userType" defaultValue={userType ?? "ALL"} className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm">
                <option value="ALL">All user types</option>
                {SURVEY_USER_TYPES.map((type) => (
                  <option key={type} value={type}>{userTypeLabels[type]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="rounded-2xl" type="submit">Filter</Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/survey-leads">Reset</Link>
              </Button>
            </div>
          </form>

          {data.rows.length ? (
            <div className="overflow-x-auto rounded-3xl border border-border/70">
              <table className="min-w-[980px] w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">User Type</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Notify</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60 align-top">
                      <td className="px-4 py-4 font-medium">{row.fullName}</td>
                      <td className="px-4 py-4">
                        <div>{row.email}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{row.phone || "No phone provided"}</div>
                      </td>
                      <td className="px-4 py-4"><Badge variant="outline">{userTypeLabels[row.userType]}</Badge></td>
                      <td className="px-4 py-4">{row.location}</td>
                      <td className="px-4 py-4"><Badge variant={row.notificationConsent ? "soft" : "secondary"}>{row.notificationConsent ? "Yes" : "No"}</Badge></td>
                      <td className="px-4 py-4 whitespace-nowrap">{formatDateTime(row.submittedAt)}</td>
                      <td className="px-4 py-4"><Badge variant="soft">Waitlisted</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              No survey leads match the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {data.total ? (
        <PaginationControls
          page={data.page}
          pageCount={data.pageCount}
          previousHref={buildPageHref("/dashboard/admin/survey-leads", query, Math.max(data.page - 1, 1))}
          nextHref={buildPageHref("/dashboard/admin/survey-leads", query, Math.min(data.page + 1, data.pageCount))}
        />
      ) : null}
    </div>
  );
}
