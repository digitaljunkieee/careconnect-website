import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" || session.user.isAdmin !== true) {
    redirect("/unauthorized");
  }

  return <DashboardShell role="ADMIN">{children}</DashboardShell>;
}
