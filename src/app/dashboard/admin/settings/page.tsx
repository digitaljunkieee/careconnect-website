import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import { getAdminSettingsData } from "@/lib/admin-platform";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function AdminSettingsPage() {
  const admin = await requireSessionUser(["ADMIN"]);

  if (!admin?.id) {
    redirect("/login");
  }

  const data = await getAdminSettingsData(admin.id);

  if (!data) {
    redirect("/dashboard/admin");
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your details and keep your account information current.
              </CardDescription>
            </div>
            <ProfilePhotoUploader
              avatarUrl={data.user.avatarUrl}
              className="lg:max-w-[22rem]"
              name={`${data.user.firstName} ${data.user.lastName}`.trim() || data.user.email}
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Name</div>
            <div className="mt-1 font-medium">
              {data.user.firstName} {data.user.lastName}
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Phone</div>
            <div className="mt-1 font-medium">{data.user.phone || "Not provided"}</div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Role</div>
            <div className="mt-1 font-medium">Administrator</div>
          </div>
        </CardContent>
      </Card>

      <AdminSettingsForm data={data} />
    </div>
  );
}
