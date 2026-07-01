import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BellRing, Building2, Download, UserRound, UsersRound } from "lucide-react";
import { auth } from "@/auth";
import { SurveyLeadDetailsDialog } from "@/components/admin/survey-lead-details-dialog";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/pagination-controls";
import { formatDateTime } from "@/lib/format";
import { buildPageHref, getResponsivePageSize, parsePage, parsePageSize } from "@/lib/pagination";
import { getAdminSurveyLeadListData } from "@/lib/survey-leads";
import {
  SURVEY_LEAD_STATUSES,
  SURVEY_USER_TYPES,
  type SurveyLeadStatus,
  type SurveyUserType
} from "@/lib/validators/survey";

type SurveyLeadsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const userTypeLabels: Record<SurveyUserType, string> = {
  CARE_WORKER: "Care Worker",
  CARE_FACILITY: "Care Facility",
  INTERESTED_PARTNER: "Interested Partner"
};

const statusLabels: Record<SurveyLeadStatus, string> = {
  WAITLISTED: "Waitlisted",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  REJECTED: "Rejected"
};

const surveyLeadsPath = "/dashboard/admin/survey-leads";

function firstQueryValue(value: string | string[] | undefined, fallback = "") {
  return Array.isArray(value) ? (value[0] ?? fallback) : (value ?? fallback);
}

export default async function AdminSurveyLeadsPage({ searchParams }: SurveyLeadsPageProps) {
  const session = await auth();
  if (!session?.user?.accessToken || session.user.role !== "ADMIN" || !session.user.isAdmin) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(
    firstQueryValue(params.pageSize),
    getResponsivePageSize((await headers()).get("user-agent"))
  );
  const search = firstQueryValue(params.search);
  const requestedType = firstQueryValue(params.userType);
  const requestedStatus = firstQueryValue(params.status);
  const userType = SURVEY_USER_TYPES.includes(requestedType as SurveyUserType)
    ? (requestedType as SurveyUserType)
    : undefined;
  const status = SURVEY_LEAD_STATUSES.includes(requestedStatus as SurveyLeadStatus)
    ? (requestedStatus as SurveyLeadStatus)
    : undefined;

  let data;
  try {
    data = await getAdminSurveyLeadListData(session.user.accessToken, {
      page,
      pageSize,
      search,
      userType,
      status
    });
  } catch (error) {
    return (
      <Card className="border-red-200 bg-red-50/60">
        <CardHeader>
          <CardTitle className="text-red-800">Unable to load survey leads</CardTitle>
          <CardDescription className="text-red-700">
            {error instanceof Error ? error.message : "The survey lead service is unavailable."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline"><Link href="/login">Sign in again</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const query = {
    search: search || undefined,
    userType: userType || undefined,
    status: status || undefined,
    pageSize: String(pageSize)
  };
  const exportParams = new URLSearchParams();
  if (search) exportParams.set("search", search);
  if (userType) exportParams.set("userType", userType);
  if (status) exportParams.set("status", status);
  const exportHref = `/api/admin/survey-leads/export${exportParams.size ? `?${exportParams.toString()}` : ""}`;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total leads", value: data.total, icon: UsersRound },
          { label: "Care workers", value: data.workerTotal, icon: UserRound },
          { label: "Care facilities", value: data.facilityTotal, icon: Building2 },
          { label: "Launch consent", value: data.consented, icon: BellRing }
        ].map((item) => {
          const Icon = item.icon;
          return <AdminStatCard key={item.label} label={item.label} value={item.value} icon={Icon} />;
        })}
      </section>

      <Card className="border-border/70">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div><CardTitle>Survey Leads</CardTitle><CardDescription>View every response, manage lead status, and export waitlist data.</CardDescription></div>
          <Button asChild className="rounded-2xl" variant="outline"><Link href={exportHref}><Download className="h-4 w-4" />Export CSV</Link></Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_auto]" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2"><label className="text-sm font-medium" htmlFor="search">Search</label><Input id="search" name="search" defaultValue={search} placeholder="Name, email, phone, or location" className="h-10" /></div>
            <div className="space-y-2"><label className="text-sm font-medium" htmlFor="userType">User type</label><select id="userType" name="userType" defaultValue={userType ?? "ALL"} className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"><option value="ALL">All user types</option>{SURVEY_USER_TYPES.map((item) => <option key={item} value={item}>{userTypeLabels[item]}</option>)}</select></div>
            <div className="space-y-2"><label className="text-sm font-medium" htmlFor="status">Status</label><select id="status" name="status" defaultValue={status ?? "ALL"} className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"><option value="ALL">All statuses</option>{SURVEY_LEAD_STATUSES.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></div>
            <div className="flex items-end gap-2"><Button className="rounded-2xl" type="submit">Filter</Button><Button asChild className="rounded-2xl" variant="outline"><Link href={surveyLeadsPath}>Reset</Link></Button></div>
          </form>

          {data.rows.length ? (
            <div className="overflow-x-auto rounded-3xl border border-border/70">
              <table className="w-full min-w-[1220px] text-sm">
                <thead className="bg-muted/50 text-left"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">User Type</th><th className="px-4 py-3 font-medium">Location</th><th className="px-4 py-3 font-medium">Notify</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Submitted</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{data.rows.map((row) => <tr key={row.id} className="border-t border-border/60 align-middle"><td className="px-4 py-4 font-medium">{row.fullName}</td><td className="px-4 py-4">{row.email}</td><td className="px-4 py-4">{row.phone || "—"}</td><td className="px-4 py-4"><Badge variant="outline">{userTypeLabels[row.userType]}</Badge></td><td className="px-4 py-4">{row.location}</td><td className="px-4 py-4"><Badge variant={row.notificationConsent ? "soft" : "secondary"}>{row.notificationConsent ? "Yes" : "No"}</Badge></td><td className="px-4 py-4"><Badge variant={row.status === "REJECTED" ? "destructive" : "soft"}>{statusLabels[row.status]}</Badge></td><td className="whitespace-nowrap px-4 py-4">{formatDateTime(row.submittedAt)}</td><td className="px-4 py-4"><SurveyLeadDetailsDialog leadId={row.id} /></td></tr>)}</tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/70 px-6 py-12 text-center"><UsersRound className="mx-auto h-8 w-8 text-muted-foreground/60" /><div className="mt-3 font-medium">No survey responses found</div><p className="mt-1 text-sm text-muted-foreground">New waitlist submissions will appear here automatically.</p></div>
          )}
        </CardContent>
      </Card>

      {data.total ? <PaginationControls page={data.page} pageCount={data.pageCount} previousHref={buildPageHref(surveyLeadsPath, query, Math.max(data.page - 1, 1))} nextHref={buildPageHref(surveyLeadsPath, query, Math.min(data.page + 1, data.pageCount))} /> : null}
    </div>
  );
}
