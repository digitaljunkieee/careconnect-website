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
import { VerificationDecisionDialog } from "@/components/admin/verification-decision-dialog";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { getAdminVerificationQueueData } from "@/lib/admin-data";
import { parsePage, parsePageSize } from "@/lib/pagination";

type VerificationQueuePageProps = {
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

export default async function AdminVerificationQueuePage({
  searchParams
}: VerificationQueuePageProps) {
  const params = (await searchParams) ?? {};
  const page = parsePage(firstQueryValue(params.page));
  const pageSize = parsePageSize(firstQueryValue(params.pageSize), 10);
  const search = firstQueryValue(params.search);
  const status = firstQueryValue(params.status);
  const sort = firstQueryValue(params.sort, "oldest") as "oldest" | "newest";

  const data = await getAdminVerificationQueueData({
    page,
    pageSize,
    search,
    status: status && status !== "ALL" ? (status as "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED") : undefined,
    sort
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.total}</CardTitle>
            <CardDescription>Total queue items</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.page}</CardTitle>
            <CardDescription>Current page</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">{data.pageCount}</CardTitle>
            <CardDescription>Total pages</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
          <CardDescription>
            Search by worker name, sort oldest to newest, and process approvals with notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-6" method="get">
            <input name="page" type="hidden" value="1" />
            <input name="pageSize" type="hidden" value={String(pageSize)} />
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
              <Input id="search" name="search" placeholder="Worker name or email" defaultValue={search} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
                defaultValue={status || "ALL"}
                id="status"
                name="status"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="sort">
                Sort
              </label>
              <select
                className="h-10 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm"
                defaultValue={sort}
                id="sort"
                name="sort"
              >
                <option value="oldest">Oldest</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Apply filters
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/verifications">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>
            {data.rows.length
              ? "Review each request, add notes, and approve or reject from the row actions."
              : "No verification requests match the current filters. Try adjusting the search or status filter."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.rows.length ? (
            <div className="overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Worker</th>
                    <th className="px-4 py-3 font-medium">Submission Date</th>
                    <th className="px-4 py-3 font-medium">Current Status</th>
                    <th className="px-4 py-3 font-medium">Documents Uploaded</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-4">
                        <div className="font-medium">{row.workerName}</div>
                        <div className="text-xs text-muted-foreground">{row.workerUserId}</div>
                      </td>
                      <td className="px-4 py-4">{row.submissionDate}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline">{VERIFICATION_STATUS_LABELS[row.currentStatus]}</Badge>
                      </td>
                      <td className="px-4 py-4">{row.documentCount}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button asChild className="rounded-2xl" size="sm" variant="outline">
                            <Link href={`/dashboard/admin/workers/${row.workerUserId}`}>View Worker</Link>
                          </Button>
                          <VerificationDecisionDialog
                            workerProfileId={row.id}
                            decision="APPROVE"
                            triggerLabel="Approve"
                            triggerVariant="default"
                          />
                          <VerificationDecisionDialog
                            workerProfileId={row.id}
                            decision="REJECT"
                            triggerLabel="Reject"
                            triggerVariant="outline"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No verification requests match the current filters. Try adjusting the search or status filter." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
