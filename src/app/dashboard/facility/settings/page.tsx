import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function FacilitySettingsPage() {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  redirect("/dashboard/facility/profile/edit");
}
