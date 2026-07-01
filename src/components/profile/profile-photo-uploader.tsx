"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfilePhotoUploaderProps = {
  name: string;
  avatarUrl?: string | null;
  helperText?: string;
  className?: string;
  surface?: "card" | "inline";
  title?: string;
  entityLabel?: string;
  uploadLabel?: string;
  changeLabel?: string;
  avatarClassName?: string;
  buttonClassName?: string;
};

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfilePhotoUploader({
  name,
  avatarUrl,
  helperText = "JPG, PNG, WEBP, or GIF up to 5MB.",
  className,
  surface = "card",
  title = "Profile photo",
  entityLabel = "profile photo",
  uploadLabel = "Upload photo",
  changeLabel = "Change photo",
  avatarClassName,
  buttonClassName
}: ProfilePhotoUploaderProps) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const isInline = surface === "inline";

  const currentImage = avatarUrl || session?.user?.image || "";
  const initials = getInitials(name || session?.user?.name || session?.user?.email || "CC");
  const uploadActionLabel = currentImage ? changeLabel : uploadLabel;
  const wrapperClassName = cn(
    isInline
      ? "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      : "flex w-full flex-col gap-4 rounded-3xl border border-border/60 bg-background/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between",
    className
  );
  const avatarStyles = cn(
    "relative flex items-center justify-center rounded-[1.75rem] outline-none ring-offset-background transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isInline
      ? "h-20 w-20 border border-border/70 bg-background/80 shadow-sm"
      : "h-16 w-16 border border-border/60 bg-background shadow-sm",
    avatarClassName
  );
  const helperClassName = "text-sm text-muted-foreground";
  const buttonStyles = cn(
    isInline
      ? "rounded-2xl border border-border/70 bg-background/80 text-foreground shadow-sm hover:bg-accent hover:text-foreground"
      : "",
    buttonClassName
  );

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload a JPG, PNG, WEBP, or GIF image.");
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error(`${title} must be 5MB or smaller.`);
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/account/avatar", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          success?: boolean;
          message?: string;
          data?: { avatarUrl?: string };
          error?: { message?: string };
        }
      | null;

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error?.message ?? payload?.message ?? `Unable to upload ${entityLabel}.`);
    }

    const avatarImage = payload.data?.avatarUrl ?? "";
    if (avatarImage) {
      await update({ image: avatarImage } as never);
    }

    router.refresh();
  }

  return (
    <div className={wrapperClassName}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="group relative outline-none ring-offset-background transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => inputRef.current?.click()}
          aria-label={`${currentImage ? "Change" : "Upload"} ${entityLabel}`}
        >
          <Avatar className={avatarStyles}>
            {currentImage ? (
              <AvatarImage src={currentImage} alt={`${name || "User"} profile photo`} />
            ) : null}
            <AvatarFallback className="rounded-[1.5rem] text-base">{initials || "CC"}</AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 grid place-items-center rounded-[1.75rem] bg-background/0 opacity-0 transition group-hover:bg-background/15 group-hover:opacity-100">
            <Upload className="h-4 w-4 text-foreground" />
          </span>
        </button>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className={helperClassName}>{helperText}</p>
        </div>
      </div>

      <Button
        className={cn("rounded-2xl sm:self-center", buttonStyles)}
        disabled={isUploading}
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isUploading ? "Uploading..." : uploadActionLabel}
      </Button>

      <input
        ref={inputRef}
        accept="image/*"
        aria-hidden="true"
        className="hidden"
        type="file"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";

          if (!file) {
            return;
          }

          setIsUploading(true);

          try {
            await uploadAvatar(file);
            toast.success(`${title} updated.`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : `Unable to upload ${entityLabel}.`);
          } finally {
            setIsUploading(false);
          }
        }}
      />
    </div>
  );
}
