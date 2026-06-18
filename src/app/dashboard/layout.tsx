import type { ReactNode } from "react";
import { cookies } from "next/headers";
import {
  DASHBOARD_THEME_COOKIE_NAME,
  DashboardThemeProvider,
  type DashboardTheme
} from "@/components/providers/dashboard-theme-provider";

function parseDashboardTheme(value: string | undefined): DashboardTheme {
  return value === "dark" ? "dark" : "light";
}

export default async function DashboardLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(DASHBOARD_THEME_COOKIE_NAME)?.value;

  return (
    <DashboardThemeProvider initialTheme={parseDashboardTheme(themeCookie)}>
      {children}
    </DashboardThemeProvider>
  );
}
