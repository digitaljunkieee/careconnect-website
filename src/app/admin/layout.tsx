import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  DASHBOARD_THEME_COOKIE_NAME,
  DashboardThemeProvider,
  type DashboardTheme
} from "@/components/providers/dashboard-theme-provider";

function parseDashboardTheme(value: string | undefined): DashboardTheme {
  return value === "dark" ? "dark" : "light";
}

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" || !session.user.isAdmin) {
    redirect("/unauthorized");
  }

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(DASHBOARD_THEME_COOKIE_NAME)?.value;

  return (
    <DashboardThemeProvider initialTheme={parseDashboardTheme(themeCookie)}>
      <DashboardShell role="ADMIN">{children}</DashboardShell>
    </DashboardThemeProvider>
  );
}
