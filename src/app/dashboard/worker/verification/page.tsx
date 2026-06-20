import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PaginationControls } from "@/components/pagination-controls";
import { WorkerDocumentUpload } from "@/components/worker/worker-document-upload";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getVerificationHistory } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";
import {
  buildPageHref,
  getResponsivePageSize,
  paginateItems,
  parsePage
} from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { FileText, ShieldCheck, Sparkles } from "lucide-react";

type WorkerVerificationPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ProfileRequirement = {
  key: "avatarUrl" | "phone" | "niNumber" | "shareCode" | "addressHistory" | "roleType";
  label: string;
};

const PROFILE_REQUIREMENTS: ProfileRequirement[] = [
  { key: "avatarUrl", label: "Profile photo" },
  { key: "phone", label: "Contact number" },
  { key: "niNumber", label: "National Insurance number" },
  { key: "shareCode", label: "UKVI share code" },
  { key: "addressHistory", label: "Address history" },
  { key: "roleType", label: "Role type" }
];

function firstQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function getVerificationToneClassName(status: string) {
  switch (status) {
    case "VERIFIED":
      return "border-[#13d9cb]/25 bg-[#13d9cb]/12 text-[#13d9cb]";
    case "IN_REVIEW":
      return "border-[#2bb9ff]/25 bg-[#2bb9ff]/12 text-[#2bb9ff]";
    case "REJECTED":
      return "border-rose-500/25 bg-rose-500/12 text-rose-200";
    default:
      return "border-white/10 bg-white/8 text-white/70";
  }
}

function SectionEmpty({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[16rem] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#13d9cb]/10 text-[#13d9cb]">
          <Sparkles className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
            {title}
          </h3>
          <p className="text-sm leading-6 text-white/65">{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

export default async function WorkerVerificationPage({
  searchParams
}: WorkerVerificationPageProps) {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const pageSize = getResponsivePageSize((await headers()).get("user-agent"));
  const documentsPage = parsePage(firstQueryValue(params.documentsPage));
  const historyPage = parsePage(firstQueryValue(params.historyPage));
  const history = await getVerificationHistory(user.id);

  if (!history) {
    return (
      <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="text-2xl text-white">Verification</CardTitle>
          <CardDescription className="text-white/65">
            Create your worker profile first so we can attach uploaded documents to it.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <Button asChild className="rounded-2xl bg-[#076c82] text-white hover:bg-[#13d9cb]">
            <Link href="/dashboard/worker/profile">Go to profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const documents = history.documents ?? [];
  const paginatedDocuments = paginateItems(documents, documentsPage, pageSize);
  const paginatedHistory = paginateItems(history.logs, historyPage, pageSize);
  const basePath = "/dashboard/worker/verification";
  const buildSharedQuery = (nextDocumentsPage: number, nextHistoryPage: number) => ({
    documentsPage: String(nextDocumentsPage),
    historyPage: String(nextHistoryPage),
    pageSize: String(pageSize)
  });

  const profile = history.profile;
  const verificationStatus = profile.verificationStatus;
  const completionPercent = profile.profileCompletionPercent;
  const savedAddressCount = profile.addressHistory.filter(Boolean).length;
  const missingRequirements = PROFILE_REQUIREMENTS.filter((item) => {
    switch (item.key) {
      case "avatarUrl":
        return !profile.avatarUrl?.trim();
      case "phone":
        return !profile.phone?.trim();
      case "niNumber":
        return !profile.niNumber?.trim();
      case "shareCode":
        return !profile.shareCode?.trim();
      case "addressHistory":
        return savedAddressCount === 0;
      case "roleType":
        return !profile.roleType?.trim();
      default:
        return false;
    }
  });
  const verificationCopy =
    verificationStatus === "VERIFIED"
      ? "Your profile is approved and ready for live shift applications."
      : verificationStatus === "IN_REVIEW"
        ? "Your documents are under review before shift access is fully unlocked."
        : verificationStatus === "REJECTED"
          ? "Please update the missing details and submit fresh documents for review."
          : "Finish the last few details so verification can begin.";

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(43,185,255,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(19,217,203,0.16),transparent_22%),linear-gradient(135deg,rgba(4,14,38,0.98),rgba(7,23,53,0.96))] p-6 text-white shadow-[0_30px_80px_rgba(4,14,38,0.24)] sm:p-8">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {VERIFICATION_STATUS_LABELS[verificationStatus]}
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {documents.length} {documents.length === 1 ? "Document" : "Documents"}
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {completionPercent}% complete
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              Verification
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              Keep your documents current so your profile can move through review without friction.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="space-y-6">
          <Card
            id="upload-document"
            className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]"
          >
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg text-white">Upload document</CardTitle>
                  <CardDescription className="text-white/65">
                    Add a fresh document whenever your verification details change.
                  </CardDescription>
                </div>
                <div className="rounded-full border border-[#13d9cb]/20 bg-[#13d9cb]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#13d9cb]">
                  Secure upload
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              <WorkerDocumentUpload />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <CardTitle className="text-lg text-white">Submitted documents</CardTitle>
              <CardDescription className="text-white/65">
                Files attached to your verification review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
              {paginatedDocuments.rows.length ? (
                paginatedDocuments.rows.map((document) => (
                  <div
                    key={`${document.publicId ?? document.name}-${String(document.uploadedAt ?? "")}`}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#13d9cb]/10 text-[#13d9cb]">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-white">
                              {document.name ?? "Document"}
                            </div>
                            <div className="text-sm text-white/60">
                              {document.resourceType ?? "file"}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-white/65">
                          Uploaded {formatDateTime(document.uploadedAt ?? history.submittedAt)}
                        </div>
                        {document.expiresAt ? (
                          <div className="text-sm text-white/55">
                            Expires {formatDateTime(document.expiresAt)}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                        {document.secureUrl ? (
                          <Button
                            asChild
                            className="rounded-2xl bg-[#076c82] text-white hover:bg-[#13d9cb]"
                            size="sm"
                          >
                            <a href={document.secureUrl} target="_blank" rel="noreferrer">
                              View file
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <SectionEmpty
                  title="No documents yet"
                  description="Upload your first verification document to start the review process."
                  action={
                    <Button
                      className="rounded-2xl bg-[#076c82] text-white hover:bg-[#13d9cb]"
                      asChild
                    >
                      <a href="#upload-document">Upload document</a>
                    </Button>
                  }
                />
              )}

              {paginatedDocuments.rows.length ? (
                <PaginationControls
                  className="bg-white/5"
                  nextHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      Math.min(paginatedDocuments.page + 1, paginatedDocuments.pageCount),
                      paginatedHistory.page
                    ),
                    Math.min(paginatedDocuments.page + 1, paginatedDocuments.pageCount),
                    "documentsPage"
                  )}
                  page={paginatedDocuments.page}
                  pageCount={paginatedDocuments.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      Math.max(paginatedDocuments.page - 1, 1),
                      paginatedHistory.page
                    ),
                    Math.max(paginatedDocuments.page - 1, 1),
                    "documentsPage"
                  )}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <CardTitle className="text-lg text-white">Verification history</CardTitle>
              <CardDescription className="text-white/65">
                Recent status updates for your verification review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
              {paginatedHistory.rows.length ? (
                paginatedHistory.rows.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold text-white">{log.documentName}</div>
                        <div className="text-sm text-white/60">
                          {formatDateTime(log.submittedAt)}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          getVerificationToneClassName(log.status)
                        )}
                      >
                        {VERIFICATION_STATUS_LABELS[log.status]}
                      </Badge>
                    </div>

                    {log.reportUrl ? (
                      <div className="mt-4">
                        <Button
                          asChild
                          className="rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                          size="sm"
                          variant="ghost"
                        >
                          <a href={log.reportUrl} target="_blank" rel="noreferrer">
                            View report
                          </a>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <SectionEmpty
                  title="No verification history yet"
                  description="Once your documents are reviewed, updates will appear here."
                />
              )}

              {paginatedHistory.rows.length ? (
                <PaginationControls
                  className="bg-white/5"
                  nextHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      paginatedDocuments.page,
                      Math.min(paginatedHistory.page + 1, paginatedHistory.pageCount)
                    ),
                    Math.min(paginatedHistory.page + 1, paginatedHistory.pageCount),
                    "historyPage"
                  )}
                  page={paginatedHistory.page}
                  pageCount={paginatedHistory.pageCount}
                  previousHref={buildPageHref(
                    basePath,
                    buildSharedQuery(
                      paginatedDocuments.page,
                      Math.max(paginatedHistory.page - 1, 1)
                    ),
                    Math.max(paginatedHistory.page - 1, 1),
                    "historyPage"
                  )}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
            <CardHeader className="space-y-4 p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                Verification overview
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    getVerificationToneClassName(verificationStatus)
                  )}
                >
                  {VERIFICATION_STATUS_LABELS[verificationStatus]}
                </Badge>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                  Submitted {formatDateTime(history.submittedAt)}
                </div>
              </div>
              <p className="text-sm leading-6 text-white/70">{verificationCopy}</p>

              <div className="space-y-3 pt-2">
                <div className="flex items-end justify-between gap-4">
                  <div className="text-4xl font-semibold tracking-tight text-white">
                    {completionPercent}%
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                    Profile completion
                  </div>
                </div>
                <Progress
                  className="bg-white/10 [&>div]:bg-[linear-gradient(90deg,#076c82_0%,#13d9cb_100%)]"
                  value={completionPercent}
                />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                Missing requirements
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
              {missingRequirements.length ? (
                <ul className="space-y-3">
                  {missingRequirements.map((item) => (
                    <li key={item.key} className="flex items-start gap-3 text-sm text-white/75">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#13d9cb]" />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-[22px] border border-[#13d9cb]/20 bg-[#13d9cb]/8 px-4 py-5 text-sm leading-6 text-white/75">
                  Everything is in place right now. Your profile is ready for review.
                </div>
              )}

              <Button asChild className="w-full rounded-2xl bg-[#076c82] text-white hover:bg-[#13d9cb]">
                <Link href="/dashboard/worker/profile/edit">Edit profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#101D31]/90 text-white shadow-[0_24px_80px_rgba(4,14,38,0.35)]">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                Keep things moving
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              <div className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2bb9ff]/10 text-[#2bb9ff]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-white">Verification stays visible</div>
                  <p className="text-sm leading-6 text-white/65">
                    You can keep uploading documents and tracking review progress here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
