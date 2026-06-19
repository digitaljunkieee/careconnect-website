import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function NotificationsLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/login");
  }

  return <DashboardShell role={session.user.role}>{children}</DashboardShell>;
}
