import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function WorkerSettingsPage() {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  redirect("/dashboard/worker/profile");
}
