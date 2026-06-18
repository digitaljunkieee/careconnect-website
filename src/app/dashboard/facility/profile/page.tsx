import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FacilityProfileForm } from "@/components/facility/facility-profile-form";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import { getFacilityProfileData } from "@/lib/facility-portal";
import { formatDateTime } from "@/lib/format";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function FacilityProfilePage() {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const profile = await getFacilityProfileData(user.id);

  const initialValues = profile
    ? {
        companyName: profile.companyName,
        address: profile.address,
        contactNumber: profile.contactNumber
      }
    : {
        companyName: "",
        address: "",
        contactNumber: ""
      };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="border-border/70">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-xl">
              <Badge variant="soft" className="w-fit rounded-full">
                Profile
              </Badge>
              <CardTitle className="mt-2">Company details</CardTitle>
              <CardDescription>
                Keep your facility contact information accurate for shift coordination.
              </CardDescription>
            </div>

            <ProfilePhotoUploader
              avatarUrl={profile?.avatarUrl}
              className="xl:max-w-[22rem]"
              name={profile?.companyName || user.email || "Facility account"}
            />
          </div>
        </CardHeader>
        <CardContent>
          <FacilityProfileForm initialValues={initialValues} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(19,217,203,0.07),rgba(43,185,255,0.03))]">
          <CardHeader>
            <Badge variant="soft" className="w-fit rounded-full">
              Profile status
            </Badge>
            <CardTitle className="mt-2">Saved facility details</CardTitle>
            <CardDescription>These details appear across your facility dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Company
              </div>
              <div className="mt-2 text-lg font-semibold">
                {profile?.companyName || "No facility profile saved yet"}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Contact
              </div>
              <div className="mt-2 text-lg font-semibold">
                {profile?.contactNumber || "Not set"}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Last updated
              </div>
              <div className="mt-2 text-lg font-semibold">
                {profile ? formatDateTime(profile.updatedAt) : "No profile updates yet"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
