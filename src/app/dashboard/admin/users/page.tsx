import { redirect } from "next/navigation";

export default function AdminUsersPage() {
  redirect("/dashboard/admin/search?entityType=ALL");
}
