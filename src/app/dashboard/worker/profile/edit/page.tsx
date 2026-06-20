import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import { WorkerProfileForm } from "@/components/worker/worker-profile-form";
import { WORKER_ROLE_TYPE_LABELS } from "@/lib/constants";
import { getWorkerProfileData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function WorkerProfileEditPage() {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const profile = await getWorkerProfileData(user.id);
  const roleType = profile?.roleType ?? "CARE_ASSISTANT";
  const fullName =
    `${profile?.firstName || user.firstName || ""} ${profile?.lastName || user.lastName || ""}`.trim() ||
    "Worker profile";

  const initialValues = {
    phone: profile?.phone ?? "",
    addressHistory: profile?.addressHistory?.join("\n") ?? "",
    niNumber: profile?.niNumber ?? "",
    shareCode: profile?.shareCode ?? "",
    roleType
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Edit profile
        </h1>
      </div>

      <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
        <CardHeader className="p-5 sm:p-6">
          <ProfilePhotoUploader
            avatarClassName="h-24 w-24 rounded-[1.8rem] border-white/10 bg-[#15243A] sm:h-28 sm:w-28"
            avatarUrl={profile?.avatarUrl || user.image || undefined}
            buttonClassName="border-white/10 bg-white/5 text-white shadow-none hover:bg-white/10"
            changeLabel="Upload photo"
            className="w-full"
            helperText={WORKER_ROLE_TYPE_LABELS[roleType]}
            name={fullName}
            surface="inline"
            title={fullName}
            uploadLabel="Upload photo"
          />
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <WorkerProfileForm initialValues={initialValues} />
        </CardContent>
      </Card>
    </div>
  );
}
