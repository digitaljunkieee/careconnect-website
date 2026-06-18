"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type UploadResponse = {
  success?: boolean;
  message?: string;
  error?: {
    message?: string;
  };
};

export function WorkerDocumentUpload() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [documentName, setDocumentName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  function resetForm() {
    setDocumentName("");
    setSelectedFile(null);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Please choose a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentName", documentName.trim() || selectedFile.name);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", "/api/worker/documents");
        xhr.responseType = "text";

        xhr.upload.onprogress = (progressEvent) => {
          if (progressEvent.lengthComputable) {
            setUploadProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );
          }
        };

        xhr.onload = () => {
          let payload: UploadResponse | null = null;

          try {
            payload = xhr.responseText ? (JSON.parse(xhr.responseText) as UploadResponse) : null;
          } catch {
            payload = null;
          }

          if (xhr.status < 200 || xhr.status >= 300) {
            reject(
              new Error(
                payload?.error?.message ??
                  payload?.message ??
                  "Unable to upload document."
              )
            );
            return;
          }

          resolve();
        };

        xhr.onerror = () => {
          reject(new Error("Network error while uploading document."));
        };

        xhr.send(formData);
      });

      toast.success("Document uploaded successfully.");
      resetForm();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload document.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="documentName">
            Document Name
          </label>
          <Input
            id="documentName"
            placeholder="Right to work document"
            value={documentName}
            onChange={(event) => setDocumentName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="verificationFile">
            File
          </label>
          <Input
            ref={fileInputRef}
            id="verificationFile"
            accept=".pdf,image/*"
            type="file"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Supported files: PDF, JPEG, PNG, WEBP, and GIF. Maximum size: 10MB.
      </p>

      {selectedFile ? (
        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm">
          Selected file: <span className="font-medium">{selectedFile.name}</span>
        </div>
      ) : null}

      {isUploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span>Uploading</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      ) : null}

      <Button className="w-full" disabled={isUploading || !selectedFile} size="lg" type="submit">
        {isUploading ? "Uploading document..." : "Upload document"}
      </Button>
    </form>
  );
}
