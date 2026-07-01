import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
};

const authProfileImages = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&crop=faces&w=160&h=160&q=85",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=160&h=160&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces&w=160&h=160&q=85"
] as const;

export function AuthShell({ children }: AuthShellProps) {
  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(43,185,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(19,217,203,0.08),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] px-0 py-0 lg:px-4 lg:py-4">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col items-stretch overflow-hidden bg-white shadow-[0_30px_100px_rgba(15,23,42,0.12)] lg:min-h-[calc(100vh-2rem)] lg:flex-row lg:rounded-[36px]">
        <main className="relative flex w-full flex-col overflow-hidden px-5 py-8 sm:px-8 sm:py-10 md:px-10 lg:w-[45%] lg:px-12 lg:py-10 xl:px-14">
          <div className="mb-4 flex justify-center lg:hidden">
            <Link href="/" aria-label="CareConnect home" className="inline-flex">
              <Image
                src="/icons/cclogobig-transparent.png"
                alt="CareConnect logo"
                width={220}
                height={72}
                className="h-14 w-auto"
                priority
              />
            </Link>
          </div>

          <div className="pointer-events-none absolute left-4 top-4 hidden lg:block xl:left-6 xl:top-6">
            <Image
              src="/icons/cclogosmall-transparent.png"
              alt=""
              width={120}
              height={120}
              aria-hidden="true"
              className="h-28 w-28 -translate-x-3 -translate-y-2 rotate-[-8deg] object-contain opacity-[0.08] blur-[1.1px]"
              priority
            />
          </div>

          <div className="relative z-10 flex flex-1 items-center">
            <div className="w-full max-w-[460px]">{children}</div>
          </div>
        </main>

        <aside className="relative hidden min-h-[22rem] w-full overflow-hidden bg-slate-950 lg:flex lg:min-h-full lg:flex-1">
          <Image
            src="/images/hero/auth-care-connection.webp"
            alt="Black care professional arranging flowers with an older mixed-race woman"
            fill
            priority
            quality={88}
            sizes="55vw"
            className="object-cover object-center"
            style={{ objectPosition: "center 38%" }}
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,28,0.16)_0%,rgba(3,10,28,0.28)_42%,rgba(2,24,44,0.86)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(19,217,203,0.22),transparent_24%)]" />

          <div className="relative z-10 flex h-full w-full flex-col px-6 py-6 sm:px-8 sm:py-8 xl:px-12 xl:py-12">
            <div className="max-w-md">
              <p className="max-w-[18rem] text-[clamp(1.65rem,2.8vw,2.8rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white drop-shadow-[0_12px_24px_rgba(15,23,42,0.35)]">
                Care staffing made simple.
              </p>
            </div>

            <div className="absolute bottom-5 right-5 z-20 sm:bottom-6 sm:right-6">
              <div className="inline-flex items-center gap-3">
                <div className="flex -space-x-2">
                  {authProfileImages.map((src, index) => (
                    <span
                      key={src}
                      aria-hidden="true"
                      className="relative inline-flex h-10 w-10 overflow-hidden rounded-full bg-white ring-2 ring-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)]"
                      style={{ zIndex: 3 - index }}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover object-center"
                      />
                    </span>
                  ))}
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)]">
                    +
                  </span>
                </div>

                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white">
                  <BadgeCheck className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
