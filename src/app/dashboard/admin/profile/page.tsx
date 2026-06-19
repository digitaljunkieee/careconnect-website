import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function AdminProfilePage() {
  const admin = await requireSessionUser(["ADMIN"]);

  if (!admin) {
    redirect("/login");
  }

  redirect("/dashboard/admin/settings");
}
