import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getFacilityProfileData } from "@/lib/facility-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

const PROFILE_CHECK_ITEMS = [
  { key: "logo", label: "Company logo" },
  { key: "companyName", label: "Company name" },
  { key: "address", label: "Company address" },
  { key: "contactNumber", label: "Contact number" },
  { key: "website", label: "Website" },
  { key: "facilityType", label: "Facility type" },
  { key: "description", label: "Description" }
] as const;

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function InfoField({
  label,
  value,
  span = false
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-muted/30 p-4", span && "md:col-span-2")}>
      <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 whitespace-pre-line text-sm font-medium leading-6 text-foreground">
        {value || "Not provided"}
      </div>
    </div>
  );
}

export default async function FacilityProfilePage() {
  const user = await requireSessionUser(["FACILITY"]);

  if (!user) {
    redirect("/login");
  }

  const profile = await getFacilityProfileData(user.id);
  const editHref = "/dashboard/facility/profile/edit";
  const companyName = profile?.companyName?.trim() || "Company name not set";
  const profileFields = {
    companyName: profile?.companyName?.trim() ?? "",
    website: profile?.website?.trim() ?? "",
    address: profile?.address?.trim() ?? "",
    contactNumber: profile?.contactNumber?.trim() ?? "",
    facilityType: profile?.facilityType?.trim() ?? "",
    description: profile?.description?.trim() ?? ""
  };

  const completionItems = PROFILE_CHECK_ITEMS.map((item) => ({
    ...item,
    filled:
      item.key === "logo"
        ? Boolean(profile?.avatarUrl)
        : Boolean(profileFields[item.key as keyof typeof profileFields])
  }));
  const missingItems = completionItems.filter((item) => !item.filled).map((item) => item.label);
  const visibleMissingItems = missingItems.slice(0, 4);
  const remainingMissingItems = Math.max(missingItems.length - visibleMissingItems.length, 0);
  const completionPercent = Math.round(
    ((completionItems.length - missingItems.length) / completionItems.length) * 100
  );
  const readyForReview = missingItems.length === 0;
  const verificationStatusLabel = readyForReview ? "Pending review" : "In progress";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-6">
          <Card className="border-border/70">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar className="h-14 w-14 shrink-0 rounded-2xl border border-border/70 bg-background">
                    {profile?.avatarUrl ? (
                      <AvatarImage src={profile.avatarUrl} alt={companyName} />
                    ) : null}
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-primary">
                      {getInitials(companyName) || "CC"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
                      {companyName}
                    </h1>
                    <p className="text-sm text-muted-foreground">Facility account</p>
                  </div>
                </div>

                <Button asChild className="rounded-2xl" variant="outline">
                  <Link href={editHref}>Edit Profile</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <CardTitle>Company information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 pt-0 sm:p-6 sm:pt-0 md:grid-cols-2">
              <InfoField label="Website" value={profileFields.website} />
              <InfoField label="Address" value={profileFields.address} span />
              <InfoField label="Contact number" value={profileFields.contactNumber} />
              <InfoField label="Facility type" value={profileFields.facilityType} />
              <InfoField label="Description" value={profileFields.description} span />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Card className="border-border/70">
            <CardHeader className="space-y-4 p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Profile completion
              </div>
              <div className="flex items-end justify-between gap-4">
                <CardTitle className="text-4xl">{completionPercent}% complete</CardTitle>
                <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/70">
                  {readyForReview ? "Complete" : "In progress"}
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#076c82_0%,#13d9cb_100%)] transition-[width] duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Missing
                </p>
                {visibleMissingItems.length ? (
                  <ul className="mt-3 space-y-2">
                    {visibleMissingItems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#13d9cb]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    No missing details right now.
                  </p>
                )}
                {remainingMissingItems > 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    +{remainingMissingItems} more to finish.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="space-y-3 p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Verification status
              </div>
              <CardTitle className="text-2xl">{verificationStatusLabel}</CardTitle>
              <CardDescription>CareConnect will review your facility before shifts go live.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
