import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function FacilityLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/login");
  }

  if (session.user.role !== "FACILITY") {
    redirect("/unauthorized");
  }

  return <DashboardShell role="FACILITY">{children}</DashboardShell>;
}
