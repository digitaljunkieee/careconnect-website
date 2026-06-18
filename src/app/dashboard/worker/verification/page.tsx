import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { WorkerDocumentUpload } from "@/components/worker/worker-document-upload";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getVerificationHistory } from "@/lib/worker-portal";
import { requireSessionUser } from "@/lib/auth-helpers";

export default async function WorkerVerificationPage() {
  const user = await requireSessionUser(["WORKER"]);

  if (!user) {
    redirect("/login");
  }

  const history = await getVerificationHistory(user.id);

  if (!history) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Verification</CardTitle>
          <CardDescription>
            Create your worker profile first so we can attach uploaded documents to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/worker/profile">Go to profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const documents = history.documents ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <Badge
              className="w-fit rounded-full"
              variant={
                history.profile.verificationStatus === "VERIFIED"
                  ? "soft"
                  : history.profile.verificationStatus === "IN_REVIEW"
                    ? "outline"
                    : history.profile.verificationStatus === "REJECTED"
                      ? "destructive"
                      : "secondary"
              }
            >
              {VERIFICATION_STATUS_LABELS[history.profile.verificationStatus]}
            </Badge>
            <CardTitle className="mt-2">Verification Status</CardTitle>
            <CardDescription>
              Submitted on {formatDateTime(history.submittedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Current status
              </div>
              <div className="mt-2 text-lg font-semibold">
                {VERIFICATION_STATUS_LABELS[history.profile.verificationStatus]}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Submitted documents
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {documents.length} document{documents.length === 1 ? "" : "s"} currently attached to your profile.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Submitted Documents</CardTitle>
            <CardDescription>
              Files uploaded here are attached to your verification review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-3xl border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length ? (
                    documents.map((document) => (
                      <TableRow key={`${document.publicId ?? document.name}-${String(document.uploadedAt ?? "")}`}>
                        <TableCell className="font-medium">
                          {document.name ?? "Document"}
                        </TableCell>
                        <TableCell>{document.resourceType ?? "file"}</TableCell>
                        <TableCell>
                          {formatDateTime(document.uploadedAt ?? history.submittedAt)}
                        </TableCell>
                        <TableCell>
                          {document.secureUrl ? (
                            <Button asChild className="rounded-2xl" variant="outline" size="sm">
                              <a href={document.secureUrl} target="_blank" rel="noreferrer">
                                View file
                              </a>
                            </Button>
                          ) : (
                            "Unavailable"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="py-10 text-center text-muted-foreground" colSpan={4}>
                        Upload your first document to begin verification.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Upload verification document</CardTitle>
            <CardDescription>
              Supported file types are PDFs and images up to 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkerDocumentUpload />
          </CardContent>
        </Card>

        <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Verification history</CardTitle>
          <CardDescription>
            Recent verification updates for your profile and documents.
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-3">
            {history.logs.length ? (
              history.logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{log.documentName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(log.submittedAt)}
                      </div>
                    </div>
                    <Badge
                      variant={
                        log.status === "VERIFIED"
                          ? "soft"
                          : log.status === "REJECTED"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {VERIFICATION_STATUS_LABELS[log.status]}
                    </Badge>
                  </div>
                  {log.reportUrl ? (
                    <div className="mt-3">
                      <Button asChild className="rounded-2xl" variant="outline" size="sm">
                        <a href={log.reportUrl} target="_blank" rel="noreferrer">
                          View report
                        </a>
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                No verification activity has been recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
