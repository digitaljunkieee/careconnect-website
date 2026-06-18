import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
};

type BrandWatermarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark" | "adaptive";
};

export function BrandGlyph({
  className,
  variant = "icon"
}: {
  className?: string;
  variant?: "icon" | "wordmark";
}) {
  const isWordmark = variant === "wordmark";

  return (
    <span
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-transparent shadow-sm",
        isWordmark ? "h-11 w-[11.5rem]" : "h-11 w-11",
        className
      )}
    >
      <Image
        src={
          isWordmark
            ? "/icons/cclogolight-transparent.png"
            : "/icons/cclogosmall-transparent.png"
        }
        alt="CareConnect logo"
        fill
        sizes={isWordmark ? "184px" : "44px"}
        className="object-contain"
      />
    </span>
  );
}

export function BrandMark({
  className,
  compact = false,
  inverse = false
}: BrandMarkProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      {inverse ? (
        <BrandGlyph variant="wordmark" className="border-white/10 shadow-none" />
      ) : (
        <>
          <BrandGlyph />
          <span className="flex flex-col">
            <span
              className={cn(
                "font-display text-lg font-semibold tracking-tight",
                inverse ? "text-white" : "text-foreground"
              )}
            >
              CareConnect
            </span>
            {!compact ? (
              <span
                className={cn(
                  "text-[0.68rem] uppercase tracking-[0.3em]",
                  inverse ? "text-white/70" : "text-muted-foreground"
                )}
              >
                Care staffing platform
              </span>
            ) : null}
          </span>
        </>
      )}
    </Link>
  );
}

const watermarkSizes = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-28 w-28"
} as const;

export function BrandWatermark({
  className,
  size = "md",
  tone = "adaptive"
}: BrandWatermarkProps) {
  const watermarkToneClass =
    tone === "dark"
      ? "opacity-20 saturate-150 mix-blend-screen"
      : tone === "light"
        ? "opacity-14 saturate-125 mix-blend-multiply"
        : "opacity-12 saturate-125 mix-blend-multiply dark:opacity-20 dark:mix-blend-screen";

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      <BrandGlyph
        className={cn(
          "border-0 rounded-none bg-transparent shadow-none",
          watermarkSizes[size],
          watermarkToneClass
        )}
      />
    </div>
  );
}
