import { auth } from "@/auth";
import { ROLE_HOME } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/login");
  }

  redirect(ROLE_HOME[session.user.role]);
}
