import Image from "next/image";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  className?: string;
};

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(43,185,255,0.1),transparent_26%),radial-gradient(circle_at_bottom,rgba(19,217,203,0.08),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#eef7fc_100%)]",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-sky-200/70 border-t-primary/90 animate-spin" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/85 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 backdrop-blur">
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
