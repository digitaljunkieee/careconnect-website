"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationActionButton } from "@/components/confirmation-action-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import type { AdminWorkerDetailData } from "@/lib/admin-data";
import {
  ASSIGNMENT_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  WORKER_ROLE_TYPE_LABELS
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

type WorkerReviewDrawerProps = {
  workerId: string;
  profileId: string;
  workerName: string;
  email: string;
  phone: string;
  roleType: string;
  verificationStatus: string;
  isActive: boolean;
};

async function parseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; message?: string }
    | null;

  return payload?.error?.message ?? payload?.message ?? "Unable to update worker.";
}

export function WorkerReviewDrawer({
  workerId,
  profileId,
  workerName,
  email,
  phone,
  roleType,
  verificationStatus,
  isActive
}: WorkerReviewDrawerProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<AdminWorkerDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState("");
  const [isMutating, setIsMutating] = React.useState(false);

  React.useEffect(() => {
    if (!open || data || isLoading) {
      return;
    }

    let cancelled = false;

    async function loadWorker() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch(`/api/admin/workers/${workerId}/detail`, {
          method: "GET"
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        const payload = (await response.json()) as {
          data?: AdminWorkerDetailData;
        };

        if (!cancelled) {
          setData(payload.data ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Unable to load worker.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadWorker();

    return () => {
      cancelled = true;
    };
  }, [data, isLoading, open, workerId]);

  async function refreshWorkerStatus(nextIsActive: boolean) {
    setIsMutating(true);

    try {
      const response = await fetch(`/api/admin/workers/${workerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: nextIsActive })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success(nextIsActive ? "Worker enabled." : "Worker suspended.");
      setData((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                isActive: nextIsActive
              }
            }
          : current
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update worker.");
    } finally {
      setIsMutating(false);
    }
  }

  async function handleVerificationDecision(decision: "APPROVE" | "REJECT") {
    setIsMutating(true);

    try {
      const response = await fetch(`/api/admin/verifications/${profileId}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ decision, notes: "" })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success(decision === "APPROVE" ? "Verification approved." : "Verification rejected.");
      setData((current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                verificationStatus: decision === "APPROVE" ? "VERIFIED" : "REJECTED",
                isVerified: decision === "APPROVE"
              },
              verification: {
                ...current.verification,
                currentStatus: decision === "APPROVE" ? "VERIFIED" : "REJECTED"
              }
            }
          : current
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update verification.");
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDeleteWorker() {
    setIsMutating(true);

    try {
      const response = await fetch(`/api/admin/workers/${workerId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      toast.success("Worker deleted.");
      router.refresh();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete worker.");
    } finally {
      setIsMutating(false);
    }
  }

  const currentVerificationKey = (data?.profile.verificationStatus ?? verificationStatus) as keyof typeof VERIFICATION_STATUS_LABELS;
  const currentRoleKey = (data?.profile.roleType ?? roleType) as keyof typeof WORKER_ROLE_TYPE_LABELS;
  const currentIsActive = data?.user.isActive ?? isActive;
  const currentVerificationLabel = VERIFICATION_STATUS_LABELS[currentVerificationKey] ?? "Pending";
  const currentRoleLabel = WORKER_ROLE_TYPE_LABELS[currentRoleKey] ?? roleType;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-2xl" size="sm" variant="outline">
          View profile
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[min(48rem,calc(100vw-1rem))] overflow-y-auto bg-background/95 p-0">
        <SheetTitle className="sr-only">{workerName} review drawer</SheetTitle>
        <div className="border-b border-border/70 px-6 py-5">
          <SheetHeader className="space-y-3 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="soft">Worker profile</Badge>
                  <Badge variant={currentIsActive ? "soft" : "secondary"}>
                    {currentIsActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{currentVerificationLabel}</Badge>
                </div>
                <SheetDescription className="mt-3 max-w-xl">
                  Review the worker profile, uploaded documents, verification history, and
                  applications without leaving the page.
                </SheetDescription>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-border/70 bg-card/80 p-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Name
                </div>
                <div className="mt-1 font-medium">{workerName}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Email
                </div>
                <div className="mt-1 font-medium">{email}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Phone
                </div>
                <div className="mt-1 font-medium">{phone || "Not provided"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Role
                </div>
                <div className="mt-1 font-medium">{currentRoleLabel}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={isMutating}
                onClick={() => void handleVerificationDecision("APPROVE")}
                size="sm"
              >
                Approve
              </Button>
              <Button
                disabled={isMutating}
                onClick={() => void handleVerificationDecision("REJECT")}
                size="sm"
                variant="outline"
              >
                Reject
              </Button>
              <Button
                disabled={isMutating}
                onClick={() => void refreshWorkerStatus(!currentIsActive)}
                size="sm"
                variant="outline"
              >
                {currentIsActive ? "Suspend" : "Reactivate"}
              </Button>
              <ConfirmationActionButton
                confirmLabel="Delete"
                confirmVariant="destructive"
                description="This will permanently remove the worker account and related records."
                disabled={isMutating}
                onConfirm={handleDeleteWorker}
                title="Delete worker?"
                triggerClassName="rounded-2xl"
                triggerVariant="outline"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </ConfirmationActionButton>
              <Button asChild className="rounded-2xl" size="sm" variant="ghost">
                <Link href={`/dashboard/admin/workers/${workerId}`}>
                  Full profile
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-border/70 px-6 py-10 text-sm text-muted-foreground">
              Loading worker profile...
            </div>
          ) : loadError ? (
            <div className="rounded-3xl border border-dashed border-border/70 px-6 py-10 text-sm text-muted-foreground">
              {loadError}
            </div>
          ) : data ? (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-4 pt-4" value="profile">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Account
                    </div>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Full name</div>
                        <div className="font-medium">{data.user.fullName || workerName}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Email</div>
                        <div className="font-medium">{data.user.email}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Phone</div>
                        <div className="font-medium">{data.user.phone || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Profile
                    </div>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">NI number</div>
                        <div className="font-medium">{data.profile.niNumber || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Share code</div>
                        <div className="font-medium">{data.profile.shareCode || "Not provided"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last updated</div>
                        <div className="font-medium">{formatDateTime(data.profile.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent className="space-y-4 pt-4" value="documents">
                {data.profile.documents.length ? (
                  <div className="space-y-3">
                    {data.profile.documents.map((document, index) => (
                      <div
                        key={`${document.name ?? "document"}-${index}`}
                        className="rounded-3xl border border-border/70 bg-card/80 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="font-medium">{document.name ?? "Document"}</div>
                            <div className="text-sm text-muted-foreground">
                              Uploaded {document.uploadedAt ? formatDateTime(document.uploadedAt) : "unknown"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{document.resourceType ?? "File"}</Badge>
                            {document.expiresAt ? (
                              <Badge variant="secondary">
                                Expires {formatDateTime(document.expiresAt)}
                              </Badge>
                            ) : null}
                            {document.secureUrl ? (
                              <Button asChild size="sm" variant="outline">
                                <a href={document.secureUrl} rel="noreferrer" target="_blank">
                                  Open
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
                    No documents uploaded yet.
                  </div>
                )}
              </TabsContent>

              <TabsContent className="space-y-4 pt-4" value="verification">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Current status
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {VERIFICATION_STATUS_LABELS[data.profile.verificationStatus]}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Submitted {formatDateTime(data.verification.submittedAt)}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Admin note
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {data.verification.logs[0]?.adminNotes || "No admin notes added yet."}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {data.verification.logs.length ? (
                    data.verification.logs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-3xl border border-border/70 bg-card/80 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="font-medium">{log.documentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(log.submittedAt)}
                            </div>
                          </div>
                          <Badge variant="outline">{VERIFICATION_STATUS_LABELS[log.status]}</Badge>
                        </div>
                        <div className="my-3 h-px w-full bg-border/70" />
                        <div className="text-sm text-muted-foreground">
                          {log.adminNotes || "No notes"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
                      No verification logs available.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent className="space-y-4 pt-4" value="applications">
                {data.applications.length ? (
                  <div className="space-y-3">
                    {data.applications.map((application) => (
                      <div
                        key={application.id}
                        className="rounded-3xl border border-border/70 bg-card/80 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="font-medium">{application.facilityName}</div>
                            <div className="text-sm text-muted-foreground">
                              {application.shiftLabel}
                            </div>
                          </div>
                          <Badge variant="outline">{application.status}</Badge>
                        </div>
                        <div className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Submitted {formatDateTime(application.submittedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border/70 px-6 py-8 text-sm text-muted-foreground">
                    No applications yet.
                  </div>
                )}
              </TabsContent>

              <TabsContent className="space-y-4 pt-4" value="history">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Upcoming assignments
                    </div>
                    <div className="mt-3 space-y-3">
                      {data.assignments.upcoming.length ? (
                        data.assignments.upcoming.map((assignment) => (
                          <div key={assignment.id}>
                            <div className="font-medium">{assignment.facilityName}</div>
                            <div className="text-sm text-muted-foreground">
                              {assignment.date} - {assignment.hours}
                            </div>
                            <Badge className="mt-2" variant="outline">
                              {
                                ASSIGNMENT_STATUS_LABELS[
                                  assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                                ]
                              }
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No upcoming assignments.</div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-card/80 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Completed assignments
                    </div>
                    <div className="mt-3 space-y-3">
                      {data.assignments.completed.length ? (
                        data.assignments.completed.map((assignment) => (
                          <div key={assignment.id}>
                            <div className="font-medium">{assignment.facilityName}</div>
                            <div className="text-sm text-muted-foreground">
                              {assignment.date} - {assignment.hours}
                            </div>
                            <Badge className="mt-2" variant="secondary">
                              {
                                ASSIGNMENT_STATUS_LABELS[
                                  assignment.status as keyof typeof ASSIGNMENT_STATUS_LABELS
                                ]
                              }
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No completed assignments yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
