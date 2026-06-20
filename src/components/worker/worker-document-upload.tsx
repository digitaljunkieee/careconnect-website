"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileUp, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#13d9cb]/10 text-[#13d9cb]">
          <FileUp className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-semibold text-white">Upload a document</div>
          <p className="text-sm text-white/60">
            PDFs and images up to 10MB. Keep the file name simple and clear.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80" htmlFor="documentName">
            Document name
          </label>
          <Input
            className="border-white/10 bg-[#15243A] text-white placeholder:text-white/35 shadow-none focus-visible:border-[#2bb9ff]/60 focus-visible:ring-2 focus-visible:ring-[#13d9cb]/20 focus-visible:ring-offset-0"
            id="documentName"
            placeholder="Right to work document"
            value={documentName}
            onChange={(event) => setDocumentName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80" htmlFor="verificationFile">
            File
          </label>
          <Input
            ref={fileInputRef}
            className={cn(
              "border-white/10 bg-[#15243A] text-white file:text-white placeholder:text-white/35 shadow-none focus-visible:border-[#2bb9ff]/60 focus-visible:ring-2 focus-visible:ring-[#13d9cb]/20 focus-visible:ring-offset-0",
              "file:mr-3 file:rounded-xl file:border-0 file:bg-white/5 file:px-3 file:py-1.5 file:text-sm file:font-medium"
            )}
            id="verificationFile"
            accept=".pdf,image/*"
            type="file"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {selectedFile ? (
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          Selected file: <span className="font-medium text-white">{selectedFile.name}</span>
        </div>
      ) : null}

      {isUploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            <span>Uploading</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress className="bg-white/10 [&>div]:bg-[linear-gradient(90deg,#076c82_0%,#13d9cb_100%)]" value={uploadProgress} />
        </div>
      ) : null}

      <Button
        className="h-12 w-full rounded-2xl bg-[#076c82] px-6 text-white shadow-none transition hover:bg-[#13d9cb]"
        disabled={isUploading || !selectedFile}
        size="lg"
        type="submit"
      >
        {isUploading ? "Uploading document..." : "Upload document"}
        {!isUploading ? <Upload className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}
