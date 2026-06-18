"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { AdminAnalyticsData } from "@/lib/admin-platform";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type AdminAnalyticsChartsProps = {
  data: AdminAnalyticsData;
};

function ChartCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}

export function AdminAnalyticsCharts({ data }: AdminAnalyticsChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard
        title="Worker Growth"
        description="New worker registrations over the selected range."
      >
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data.workerGrowth}>
            <defs>
              <linearGradient id="workerGrowthFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              fill="url(#workerGrowthFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Facility Growth"
        description="New facility registrations over the selected range."
      >
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data.facilityGrowth}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Applications Over Time"
        description="Submitted applications tracked across the same range."
      >
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data.applicationsOverTime}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Shift Completion Rate"
        description="How many shifts were filled in each month."
      >
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data.shiftCompletionRates}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, "Completion"]} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--chart-2, 215 100% 55%))"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Verification Conversion"
        description="Verified worker share for each registration month."
      >
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data.verificationConversionRates}>
            <defs>
              <linearGradient id="verificationFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3, 28 100% 55%))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--chart-3, 28 100% 55%))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, "Conversion"]} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--chart-3, 28 100% 55%))"
              fill="url(#verificationFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
