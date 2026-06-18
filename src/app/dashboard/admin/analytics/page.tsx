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
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts";
import { getAdminAnalyticsData } from "@/lib/admin-platform";

type AnalyticsPageProps = {
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

export default async function AdminAnalyticsPage({
  searchParams
}: AnalyticsPageProps) {
  const params = (await searchParams) ?? {};
  const dateFrom = firstQueryValue(params.dateFrom);
  const dateTo = firstQueryValue(params.dateTo);

  const data = await getAdminAnalyticsData({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Workers", data.summary.totalWorkers],
          ["Facilities", data.summary.totalFacilities],
          ["Applications", data.summary.totalApplications],
          ["Shifts", data.summary.totalShifts],
          ["Verified Workers", data.summary.verifiedWorkers],
          ["Shift Completion", `${data.summary.shiftCompletionRate}%`]
        ].map(([label, value]) => (
          <Card key={label as string} className="border-border/70">
            <CardHeader>
              <CardTitle className="text-3xl">{String(value)}</CardTitle>
              <CardDescription>{label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card className="border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Explore growth, application activity, shift completion, and verification conversion.
              </CardDescription>
            </div>
            <Badge variant="soft" className="rounded-full">
              Live platform data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-6" method="get">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dateFrom">
                Date from
              </label>
              <Input id="dateFrom" name="dateFrom" type="date" defaultValue={dateFrom} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dateTo">
                Date to
              </label>
              <Input id="dateTo" name="dateTo" type="date" defaultValue={dateTo} />
            </div>
            <div className="flex items-end gap-3 lg:col-span-6">
              <Button className="rounded-2xl" type="submit">
                Apply filters
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link href="/dashboard/admin/analytics">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AdminAnalyticsCharts data={data} />
    </div>
  );
}
