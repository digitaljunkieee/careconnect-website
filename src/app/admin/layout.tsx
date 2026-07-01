import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" || !session.user.isAdmin) {
    redirect("/unauthorized");
  }

  return <DashboardShell role="ADMIN">{children}</DashboardShell>;
}
