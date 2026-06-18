import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { FacilityProfileForm } from "@/components/facility/facility-profile-form";
import { ProfilePhotoUploader } from "@/components/profile/profile-photo-uploader";
import { getFacilityProfileData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

const PROFILE_CHECK_ITEMS = [
  { key: "logo", label: "Company logo" },
  { key: "companyName", label: "Company name" },
  { key: "address", label: "Company address" },
  { key: "contactNumber", label: "Contact number" },
  { key: "website", label: "Website" },
  { key: "facilityType", label: "Facility type" },
  { key: "description", label: "Description" }
] as const;

export default async function FacilityProfilePage() {
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

  const completionItems = PROFILE_CHECK_ITEMS.map((item) => ({
    ...item,
    filled:
      item.key === "logo"
        ? Boolean(profile?.avatarUrl)
        : Boolean(initialValues[item.key as keyof typeof initialValues]?.trim())
  }));
  const missingItems = completionItems.filter((item) => !item.filled).map((item) => item.label);
  const visibleMissingItems = missingItems.slice(0, 4);
  const remainingMissingItems = Math.max(missingItems.length - visibleMissingItems.length, 0);
  const completionPercent = Math.round(
    ((completionItems.length - missingItems.length) / completionItems.length) * 100
  );
  const readyForReview = missingItems.length === 0;
  const verificationStatusLabel = readyForReview
    ? "Pending Review"
    : profile
      ? "In Progress"
      : "Draft";
  const verificationStatusCopy = readyForReview
    ? "Your facility profile is being reviewed before shifts can go live."
    : "Complete the profile details on the left to move this into review.";

  return (
    <div className="space-y-6 rounded-[32px] border border-white/8 bg-[#040e26] p-4 sm:p-6 lg:p-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#2bb9ff]">
          Facility profile
        </p>
        <div className="max-w-3xl space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A cleaner profile that feels ready for review.
          </h1>
          <p className="text-sm leading-6 text-white/65 sm:text-base">
            Keep the public details of your facility clear, current, and easy to trust.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.22fr)_minmax(18rem,0.78fr)]">
        <Card className="overflow-hidden border-white/8 bg-[#101D31] shadow-[0_24px_60px_rgba(4,14,38,0.45)]">
          <CardHeader className="space-y-6 border-b border-white/8 p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <Badge
                  variant="outline"
                  className="w-fit rounded-full border border-[#13d9cb]/25 bg-[#13d9cb]/10 px-3 py-1 text-[#13d9cb]"
                >
                  Company profile
                </Badge>
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-white sm:text-3xl">
                    Company details
                  </CardTitle>
                  <CardDescription className="max-w-xl text-sm leading-6 text-white/65">
                    Keep the information here aligned with what workers and coordinators should see.
                  </CardDescription>
                </div>
              </div>

              <ProfilePhotoUploader
                avatarUrl={profile?.avatarUrl}
                buttonClassName="border-white/8 bg-[#15243A] text-white hover:bg-[#2bb9ff]/20 hover:text-white"
                className="w-full lg:max-w-[24rem]"
                changeLabel="Change logo"
                entityLabel="company logo"
                helperText="Clear square logos work best."
                name={profile?.companyName || user.email || "Facility account"}
                surface="inline"
                title="Company logo"
                uploadLabel="Upload logo"
              />
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <FacilityProfileForm initialValues={initialValues} />
          </CardContent>
        </Card>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Card className="border-white/8 bg-[#101D31] shadow-[0_24px_60px_rgba(4,14,38,0.38)]">
            <CardHeader className="space-y-4 p-6">
              <Badge
                variant="outline"
                className="w-fit rounded-full border border-[#13d9cb]/25 bg-[#13d9cb]/10 px-3 py-1 text-[#13d9cb]"
              >
                Profile completion
              </Badge>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <CardTitle className="text-4xl text-white">{completionPercent}%</CardTitle>
                  <CardDescription className="mt-2 text-white/65">
                    {readyForReview
                      ? "Everything on this page is complete."
                      : `${missingItems.length} item${missingItems.length === 1 ? "" : "s"} still need attention.`}
                  </CardDescription>
                </div>
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                    readyForReview
                      ? "border-[#13d9cb]/25 bg-[#13d9cb]/10 text-[#13d9cb]"
                      : "border-[#2bb9ff]/25 bg-[#2bb9ff]/10 text-[#2bb9ff]"
                  }`}
                >
                  {readyForReview ? "Complete" : "In progress"}
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#15243A]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#076c82_0%,#13d9cb_100%)] transition-[width] duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Missing
                </p>
                {visibleMissingItems.length ? (
                  <ul className="mt-3 space-y-2">
                    {visibleMissingItems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-white/72">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#13d9cb]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    No missing details right now. You&apos;re ready for review.
                  </p>
                )}
                {remainingMissingItems > 0 ? (
                  <p className="mt-3 text-sm text-white/45">+{remainingMissingItems} more to finish.</p>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-white/50">
                Verification documents are checked during review, so keep your profile details
                current for a faster pass.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#101D31] shadow-[0_24px_60px_rgba(4,14,38,0.38)]">
            <CardHeader className="space-y-4 p-6">
              <Badge
                variant="outline"
                className="w-fit rounded-full border border-[#2bb9ff]/25 bg-[#2bb9ff]/10 px-3 py-1 text-[#2bb9ff]"
              >
                Verification status
              </Badge>
              <CardTitle className="text-2xl text-white">{verificationStatusLabel}</CardTitle>
              <CardDescription className="text-white/65">
                {verificationStatusCopy}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/55">
                <span className="h-2 w-2 rounded-full bg-[#2bb9ff]" />
                <span>
                  {readyForReview
                    ? "Review queue"
                    : "Finish the missing items on the left to unlock review."}
                </span>
              </div>
              <p className="text-sm leading-6 text-white/50">
                When the profile is complete, the team can review and approve the facility for
                live shifts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
