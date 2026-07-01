import Image from "next/image";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  className?: string;
};

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "grid min-h-screen place-items-center bg-background bg-[radial-gradient(circle_at_top,rgba(var(--brand-sky-rgb),0.1),transparent_28%),radial-gradient(circle_at_bottom,rgba(var(--brand-cyan-rgb),0.08),transparent_24%)] text-foreground transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,rgba(var(--brand-sky-rgb),0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(var(--brand-cyan-rgb),0.08),transparent_26%)]",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-border/80 border-t-primary" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-card/90 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-border/80 backdrop-blur dark:shadow-[0_18px_45px_rgba(0,0,0,0.38)]">
          <Image
            src="/icons/cclogosmall-transparent.png"
            alt="CareConnect loading"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />
        </div>
      </div>
    </div>
  );
}
