import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardAppearanceCard } from "@/components/layout/dashboard-appearance-card";
import {
  VERIFICATION_STATUS_LABELS,
  WORKER_ROLE_TYPE_LABELS
} from "@/lib/constants";
import { getWorkerProfileData } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

const PROFILE_CHECK_ITEMS = [
  { key: "avatarUrl", label: "Profile photo" },
  { key: "phone", label: "Contact number" },
  { key: "niNumber", label: "National Insurance number" },
  { key: "shareCode", label: "UKVI share code" },
  { key: "addressHistory", label: "Address history" },
  { key: "roleType", label: "Role type" }
] as const;

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function maskSensitiveValue(value: string, startVisible: number, endVisible: number) {
  const chars = Array.from(value.trim());
  const alphanumericIndexes = chars
    .map((char, index) => (/^[A-Za-z0-9]$/.test(char) ? index : -1))
    .filter((index) => index >= 0);

  if (!alphanumericIndexes.length) {
    return value.trim();
  }

  const visibleIndexes = new Set([
    ...alphanumericIndexes.slice(0, startVisible),
    ...alphanumericIndexes.slice(-endVisible)
  ]);

  return chars
    .map((char, index) =>
      /^[A-Za-z0-9]$/.test(char) && !visibleIndexes.has(index) ? "*" : char
    )
    .join("");
}

function getVerificationTone(status: string) {
  switch (status) {
    case "VERIFIED":
      return "bg-[#13d9cb]/15 text-[#13d9cb] border-[#13d9cb]/25";
    case "REJECTED":
      return "bg-rose-500/15 text-rose-300 border-rose-500/25";
    case "IN_REVIEW":
      return "bg-[#2bb9ff]/15 text-[#2bb9ff] border-[#2bb9ff]/25";
    default:
      return "bg-white/8 text-white/70 border-white/10";
  }
}

function InfoField({
  label,
  value,
  helperText,
  span = false
}: {
  label: string;
  value: string;
  helperText?: string;
  span?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/8 bg-[#15243A] p-4",
        span && "md:col-span-2"
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
        {label}
      </div>
      <div className="mt-2 whitespace-pre-line text-sm font-medium leading-6 text-white">
        {value || "Not provided"}
      </div>
      {helperText ? <div className="mt-2 text-sm text-white/60">{helperText}</div> : null}
    </div>
  );
}

function StatusCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
          {title}
        </div>
        <div>{children}</div>
      </CardHeader>
    </Card>
  );
}

export default async function WorkerProfilePage() {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const profile = await getWorkerProfileData(user.id);
  const fullName =
    `${profile?.firstName || user.firstName || ""} ${profile?.lastName || user.lastName || ""}`.trim() ||
    "Worker profile";
  const roleType = profile?.roleType ?? "CARE_ASSISTANT";
  const verificationStatus = profile?.verificationStatus ?? "PENDING";
  const completionPercent = profile?.profileCompletionPercent ?? 0;
  const addressHistory = profile?.addressHistory ?? [];
  const latestAddress = addressHistory.at(-1)?.trim() ?? "";
  const savedAddressCount = addressHistory.filter(Boolean).length;
  const maskedNiNumber = profile?.niNumber?.trim()
    ? maskSensitiveValue(profile.niNumber, 2, 3)
    : "";
  const maskedShareCode = profile?.shareCode?.trim()
    ? maskSensitiveValue(profile.shareCode, 4, 3)
    : "";

  const profileChecks = [
    Boolean(profile?.avatarUrl?.trim()),
    Boolean(profile?.phone?.trim()),
    Boolean(profile?.niNumber?.trim()),
    Boolean(profile?.shareCode?.trim()),
    savedAddressCount > 0,
    Boolean(profile?.roleType)
  ];
  const missingRequirements = PROFILE_CHECK_ITEMS.filter((_, index) => !profileChecks[index]).map(
    (item) => item.label
  );

  const verificationCopy = (() => {
    switch (verificationStatus) {
      case "VERIFIED":
        return "Your worker profile is approved and ready for applications.";
      case "IN_REVIEW":
        return "Your profile is currently being reviewed before shift access is unlocked.";
      case "REJECTED":
        return "Please update the missing details and resubmit for verification.";
      default:
        return "Complete your profile so verification can begin.";
    }
  })();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Profile
        </h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-[1.75rem] border border-white/10 bg-[#15243A] shadow-sm sm:h-20 sm:w-20">
                    {profile?.avatarUrl || user.image ? (
                      <AvatarImage src={profile?.avatarUrl || user.image || ""} alt={fullName} />
                    ) : null}
                    <AvatarFallback className="rounded-[1.5rem] bg-white/5 text-base text-white">
                      {getInitials(fullName) || "CC"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {fullName}
                    </h1>
                    <p className="mt-1 text-sm text-white/65">
                      {WORKER_ROLE_TYPE_LABELS[roleType]}
                    </p>
                  </div>
                </div>

                <Button asChild className="h-11 rounded-2xl bg-[#076c82] px-5 text-white hover:bg-[#13d9cb]">
                  <Link href="/dashboard/worker/profile/edit">Edit profile</Link>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    getVerificationTone(verificationStatus)
                  )}
                >
                  {VERIFICATION_STATUS_LABELS[verificationStatus]}
                </Badge>
                <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 hover:bg-white/5">
                  {completionPercent}% complete
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <CardTitle className="text-lg text-white">Profile details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 pt-0 sm:p-6 sm:pt-0 md:grid-cols-2">
              <InfoField label="Phone number" value={profile?.phone?.trim() ?? ""} />
              <InfoField
                label="National Insurance number"
                value={maskedNiNumber}
                helperText={profile?.niNumber?.trim() ? "Masked on the view page." : undefined}
              />
              <InfoField
                label="UKVI share code"
                value={maskedShareCode}
                helperText={profile?.shareCode?.trim() ? "Masked on the view page." : undefined}
              />
              <InfoField
                label="Address history"
                value={latestAddress || "Not provided"}
                helperText={
                  savedAddressCount
                    ? `${savedAddressCount} saved address${savedAddressCount === 1 ? "" : "es"} on file`
                    : "Add previous addresses in edit mode."
                }
                span
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <StatusCard title="Verification status">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    getVerificationTone(verificationStatus)
                  )}
                >
                  {VERIFICATION_STATUS_LABELS[verificationStatus]}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-white/70">{verificationCopy}</p>
            </div>
          </StatusCard>

          <StatusCard title="Profile completion">
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div className="text-4xl font-semibold tracking-tight text-white">
                  {completionPercent}%
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  {missingRequirements.length ? "In progress" : "Complete"}
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#076c82_0%,#13d9cb_100%)] transition-[width] duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-sm leading-6 text-white/70">
                {missingRequirements.length
                  ? "Finish the missing items to give your profile a complete, verified look."
                : "Everything is filled in. Your profile is ready for review."}
              </p>
            </div>
          </StatusCard>

          <DashboardAppearanceCard tone="dark" />

          <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                Missing requirements
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {missingRequirements.length ? (
                <ul className="space-y-3">
                  {missingRequirements.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#13d9cb]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-[#13d9cb]/20 bg-[#13d9cb]/8 px-4 py-5 text-sm leading-6 text-white/75">
                  No missing requirements right now.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
