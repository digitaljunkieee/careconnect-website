import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "./landing-header";

const trustPoints = [
  "EBC Verified Workers",
  "UK Right-to-Work Checks",
  "Trusted Care Providers"
];

const floatingPillClass =
  "inline-flex rounded-full border border-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.88)] px-3.5 py-1.5 text-[0.72rem] font-semibold text-slate-900 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur-[16px]";

const floatingStatCardClass =
  "rounded-[1.4rem] border border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.14)] px-4 py-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-[16px]";

const heroCopyRevealLeftClass = "hero-copy-reveal-left motion-reduce:animate-none";
const heroCopyRevealRightClass = "hero-copy-reveal-right motion-reduce:animate-none";
const heroLineSweepClass = "hero-line-sweep motion-reduce:animate-none";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f9fcff_0%,#edf7fb_100%)] lg:min-h-[100svh]">
      <LandingHeader />

      <div className="grid lg:min-h-[100svh] lg:grid-cols-[1fr_1.02fr]">
        <div className="relative flex items-start overflow-hidden bg-white px-6 pb-8 pt-20 sm:px-8 sm:pb-10 sm:pt-24 lg:min-h-[100svh] lg:px-12 lg:pb-16 lg:pt-24 xl:px-16">
          <div className="relative z-10 mx-auto w-full max-w-[44rem] text-left">
            <div className={`${heroCopyRevealLeftClass} relative max-w-[44rem] pt-5 pb-5`} style={{ animationDelay: "80ms" }}>
              <span className={`pointer-events-none absolute right-0 top-0 h-1 w-[7.5rem] origin-right rounded-full bg-[#13d9cb] opacity-95 sm:w-[11rem] md:w-[13rem] ${heroLineSweepClass}`} style={{ animationDelay: "120ms" }} />
              <span className={`pointer-events-none absolute left-0 bottom-0 h-1 w-[8.5rem] origin-left rounded-full bg-[#2bb9ff] opacity-95 sm:w-[12.5rem] md:w-[15rem] ${heroLineSweepClass}`} style={{ animationDelay: "170ms" }} />
              <h1 className="max-w-[44rem] font-display text-[clamp(3rem,5vw,4.75rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-slate-950">
                <span className="block">Connecting verified care</span>
                <span className="block">professionals with</span>
                <span className="block">trusted facilities</span>
              </h1>
            </div>

            <p
              className={`${heroCopyRevealLeftClass} mt-4 max-w-[40rem] text-[0.95rem] leading-6 text-slate-600 sm:text-base sm:leading-7`}
              style={{ animationDelay: "220ms" }}
            >
              Find flexible care shifts or fill staffing gaps through a trusted,
              verified healthcare staffing marketplace.
            </p>

            <div
              className={`${heroCopyRevealLeftClass} mt-6 flex flex-col gap-3 sm:flex-row sm:items-center`}
              style={{ animationDelay: "320ms" }}
            >
              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-full px-6 text-sm font-semibold shadow-[0_18px_40px_-24px_rgba(7,108,130,0.45)] sm:w-auto sm:px-7 sm:text-base"
              >
                <Link href="/register/worker">
                  Find Work
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-slate-200 bg-white px-6 text-sm font-semibold text-slate-950 shadow-sm sm:w-auto sm:px-7 sm:text-base"
              >
                <Link href="/register/facility">Post a Shift</Link>
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {trustPoints.map((point, index) => (
                <div
                  key={point}
                  className={`${heroCopyRevealLeftClass} flex items-center gap-2 rounded-full border border-sky-100/80 bg-white/[0.85] px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm sm:text-sm`}
                  style={{ animationDelay: `${440 + index * 90}ms` }}
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 hidden max-w-[23rem] grid-cols-2 gap-3 2xl:grid">
              <div
                className={`${heroCopyRevealLeftClass} rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4`}
                style={{ animationDelay: "620ms" }}
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Verified Workers
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">2,500+</p>
              </div>
              <div
                className={`${heroCopyRevealLeftClass} rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4`}
                style={{ animationDelay: "710ms" }}
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Care Providers
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">150+</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${heroCopyRevealRightClass} -mt-3 relative h-[34rem] overflow-hidden rounded-none bg-[linear-gradient(180deg,#d7dce1_0%,#e8ecef_18%,#f4f6f8_34%,#eef3f6_46%,#d9eef9_62%,#076c82_100%)] sm:h-[38rem] md:h-[42rem] lg:mt-0 lg:min-h-[100svh] lg:h-auto lg:rounded-l-[3rem]`} style={{ animationDelay: "120ms" }}>
          <div className="relative h-full overflow-hidden">
            <Image
              src="/images/hero/care-team-conversation.webp"
              alt="Black care professional talking with an older Black man in a residential care home"
              fill
              priority
              quality={88}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="z-0 object-cover"
              style={{ objectPosition: "center 36%" }}
            />

            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_28%_16%,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.01)_34%,transparent_62%)]" />
            <div className="absolute inset-x-0 bottom-0 z-10 h-[45%] bg-[linear-gradient(to_top,rgba(0,126,150,0.92)_0%,rgba(0,126,150,0.78)_34%,rgba(0,126,150,0.34)_68%,transparent_100%)]" />

            <div className="pointer-events-none absolute inset-0 z-20">
              <div
                className="absolute left-4 bottom-[1.15rem] z-20 md:left-[7%] md:bottom-[1.15rem] md:[--hero-card-rotate:-6deg] md:hero-card-drop motion-reduce:animate-none"
                style={{ animationDelay: "0.14s", animationDuration: "2.05s" }}
              >
                <span
                  className={`md:hero-chip-float-bottom ${floatingPillClass}`}
                  style={{ animationDelay: "0.65s", animationDuration: "4.9s" }}
                >
                  Dementia Care
                </span>
              </div>

              <div
                className="absolute right-4 bottom-[0.95rem] z-20 md:left-[62%] md:right-auto md:bottom-[0.95rem] md:-translate-x-1/2 md:[--hero-card-rotate:-3deg] md:hero-card-drop motion-reduce:animate-none"
                style={{ animationDelay: "0.28s", animationDuration: "2.1s" }}
              >
                <span
                  className={`md:hero-chip-float-bottom ${floatingPillClass}`}
                  style={{ animationDelay: "0.85s", animationDuration: "5.1s" }}
                >
                  Home Care
                </span>
              </div>

              <div
                className="absolute left-[34%] bottom-[1.35rem] z-20 md:block md:left-[24%] md:bottom-[1.35rem] md:[--hero-card-rotate:4deg] md:hero-card-drop motion-reduce:animate-none"
                style={{ animationDelay: "0.38s", animationDuration: "2.18s" }}
              >
                <span
                  className={`md:hero-chip-float-bottom ${floatingPillClass}`}
                  style={{ animationDelay: "1.05s", animationDuration: "4.7s" }}
                >
                  Private Care
                </span>
              </div>

              <div
                className="absolute right-[14%] bottom-[1.1rem] z-20 hidden md:block md:left-[44%] md:right-auto md:bottom-[1.1rem] md:-translate-x-1/2 md:[--hero-card-rotate:-3deg] md:hero-card-drop motion-reduce:animate-none"
                style={{ animationDelay: "0.5s", animationDuration: "2.26s" }}
              >
                <span
                  className={`md:hero-chip-float-bottom ${floatingPillClass}`}
                  style={{ animationDelay: "1.2s", animationDuration: "5s" }}
                >
                  Respite Support
                </span>
              </div>

              <div
                className="absolute left-3 bottom-[3.55rem] z-30 md:left-[8%] md:bottom-[3.55rem] md:[--hero-card-rotate:-4deg] md:hero-card-drop motion-reduce:animate-none"
                style={{ animationDelay: "0.52s", animationDuration: "2.22s" }}
              >
                <div
                  className={`md:hero-chip-float w-[11.5rem] ${floatingStatCardClass}`}
                  style={{ animationDelay: "1.35s", animationDuration: "5.1s" }}
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/90">
                    Verified Workers
                  </p>
                  <p className="mt-2 text-xl font-semibold leading-none text-slate-950">
                    2,500+
                  </p>
                </div>
              </div>

              <div
                className="absolute left-[32%] bottom-[5.1rem] z-30 hidden md:block md:left-[38%] md:bottom-[5.1rem] md:[--hero-card-rotate:3deg] md:hero-card-drop motion-reduce:animate-none"
                style={{ animationDelay: "0.64s", animationDuration: "2.26s" }}
              >
                <div
                  className={`md:hero-chip-float w-[13rem] ${floatingStatCardClass}`}
                  style={{ animationDelay: "1.55s", animationDuration: "4.8s" }}
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/90">
                    Trusted Care Providers
                  </p>
                  <p className="mt-2 text-xl font-semibold leading-none text-slate-950">
                    150+
                  </p>
                </div>
              </div>

              <div
                className="absolute right-3 bottom-[3.35rem] z-30 hidden md:block md:right-[9%] md:bottom-[3.35rem] md:[--hero-card-rotate:2deg] md:hero-card-drop motion-reduce:animate-none"
                style={{ animationDelay: "0.76s", animationDuration: "2.32s" }}
              >
                <div
                  className={`md:hero-chip-float w-[11rem] ${floatingStatCardClass}`}
                  style={{ animationDelay: "1.7s", animationDuration: "5.2s" }}
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/90">
                    Shift Available
                  </p>
                  <p className="mt-2 text-xl font-semibold leading-none text-slate-950">
                    £18/hr
                  </p>
                  <p className="mt-1 text-sm text-white/85">Care Support Worker</p>
                </div>
              </div>

              <div
                className="absolute right-3 bottom-[1rem] z-20 md:right-[10%] md:bottom-[1rem] md:[--hero-card-rotate:-5deg] md:hero-card-drop motion-reduce:animate-none"
                style={{ animationDelay: "0.92s", animationDuration: "2.28s" }}
              >
                <span
                  className={`md:hero-chip-float-bottom ${floatingPillClass}`}
                  style={{ animationDelay: "1.4s", animationDuration: "4.6s" }}
                >
                  Night Cover
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
