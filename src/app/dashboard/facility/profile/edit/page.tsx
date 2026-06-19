import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FacilityProfileForm } from "@/components/facility/facility-profile-form";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import { getFacilityProfileData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function FacilityProfileEditPage() {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const profile = await getFacilityProfileData(user.id);

  const initialValues = {
    companyName: profile?.companyName ?? "",
    address: profile?.address ?? "",
    contactNumber: profile?.contactNumber ?? "",
    website: profile?.website ?? "",
    facilityType: profile?.facilityType ?? "",
    description: profile?.description ?? ""
  };

  const companyName = profile?.companyName?.trim() || "Company name";

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader className="p-5 sm:p-6">
          <ProfilePhotoUploader
            avatarUrl={profile?.avatarUrl}
            changeLabel="Upload logo"
            className="w-full"
            helperText="PNG, JPG, WEBP, or GIF up to 5MB."
            name={companyName}
            surface="inline"
            title={companyName}
            uploadLabel="Upload logo"
          />
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <FacilityProfileForm initialValues={initialValues} />
        </CardContent>
      </Card>
    </div>
  );
}
