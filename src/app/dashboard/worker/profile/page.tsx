import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkerProfileForm } from "@/components/worker/worker-profile-form";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import {
  VERIFICATION_STATUS_LABELS,
  WORKER_ROLE_TYPE_LABELS
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getWorkerProfileData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function WorkerProfilePage() {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const profile = await getWorkerProfileData(user.id);

  const initialValues = profile
    ? {
        phone: profile.phone,
        addressHistory: profile.addressHistory.join("\n"),
        niNumber: profile.niNumber,
        shareCode: profile.shareCode,
        roleType: profile.roleType
      }
    : {
        phone: "",
        addressHistory: "",
        niNumber: "",
        shareCode: "",
        roleType: "CARE_SUPPORT" as const
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
              <CardTitle className="mt-2">Worker Profile</CardTitle>
              <CardDescription>
                Keep your contact details and verification information up to date.
              </CardDescription>
            </div>

            <ProfilePhotoUploader
              avatarUrl={profile?.avatarUrl}
              className="xl:max-w-[22rem]"
              name={`${profile?.firstName || user.firstName || ""} ${
                profile?.lastName || user.lastName || ""
              }`.trim()}
            />
          </div>
        </CardHeader>
        <CardContent>
          <WorkerProfileForm initialValues={initialValues} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(19,217,203,0.07),rgba(43,185,255,0.03))]">
          <CardHeader>
            <Badge variant="soft" className="w-fit rounded-full">
              Profile status
            </Badge>
            <CardTitle className="mt-2">Worker profile</CardTitle>
            <CardDescription>Your details and verification status at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Verification
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    profile?.verificationStatus === "VERIFIED"
                      ? "soft"
                      : profile?.verificationStatus === "IN_REVIEW"
                        ? "outline"
                        : profile?.verificationStatus === "REJECTED"
                          ? "destructive"
                          : "secondary"
                  }
                >
                  {VERIFICATION_STATUS_LABELS[profile?.verificationStatus ?? "PENDING"]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {profile?.isVerified
                    ? "Ready to apply for shifts."
                    : "Complete verification to unlock applications."}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Role type
              </div>
              <div className="mt-2 text-lg font-semibold">
                {
                  WORKER_ROLE_TYPE_LABELS[
                    profile?.roleType ?? "CARE_SUPPORT"
                  ]
                }
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Last updated
              </div>
              <div className="mt-2 text-lg font-semibold">
                {profile ? formatDateTime(profile.updatedAt) : "No profile details saved yet"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
