import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, ShieldCheck } from "lucide-react";
import { BrandWatermark } from "@/components/layout/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: CalendarDays,
    title: "Work on your schedule",
    description:
      "Browse available shifts, compare locations and rates, and apply for work that fits your availability."
  },
  {
    icon: ShieldCheck,
    title: "Verified, trusted opportunities",
    description:
      "Only approved care providers can post shifts, helping you work with confidence."
  }
];

export function WorkerScheduleSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto w-full max-w-[44rem]">
              <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                <div className="h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(43,185,255,0.18),rgba(43,185,255,0.06)_46%,transparent_72%)] blur-3xl sm:h-[34rem] sm:w-[34rem]" />
              </div>

              <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_24px_70px_-54px_rgba(15,23,42,0.34)] transition-transform duration-500 hover:-translate-y-1">
                <div className="relative aspect-[6/5] w-full overflow-hidden rounded-[28px]">
                  <Image
                    src="/images/landing/hero-careworker-1.jpg"
                    alt="Care worker supporting an older adult in a care setting"
                    fill
                    priority
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                    style={{ objectPosition: "center 28%" }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,108,130,0.02),rgba(7,108,130,0.14))]" />
                </div>

                <div className="absolute right-4 top-4 z-20 max-w-[11.5rem] rounded-2xl border border-slate-200/80 bg-white/96 px-4 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-md sm:right-6 sm:top-6">
                  <div className="flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-primary/80">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Shift Available
                  </div>
                  <p className="mt-2 text-2xl font-black leading-none text-slate-950">£18/hr</p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                    Care Support Worker
                  </p>
                </div>

                <div className="absolute bottom-4 left-4 z-20 max-w-[13rem] rounded-2xl border border-slate-200/80 bg-white/96 px-4 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-md sm:bottom-6 sm:left-6">
                  <div className="flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    Application Sent
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-5 text-slate-950">
                    Verified Profile
                  </p>
                  <p className="mt-1 text-xs leading-4 text-slate-500">
                    Ready for review
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative order-1 max-w-[36rem] lg:order-2">
            <BrandWatermark
              size="lg"
              tone="light"
              className="bottom-[-1.25rem] right-[-1rem] rotate-180 opacity-[0.1] blur-[1.05px] lg:hidden"
            />

            <Badge variant="soft" className="rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.24em]">
              WHY CARECONNECT
            </Badge>

            <h2 className="mt-4 max-w-[32rem] text-[clamp(2.1rem,4vw,3.7rem)] font-semibold leading-[1.06] tracking-tight text-slate-950">
              Flexible shifts with trusted care providers.
            </h2>

            <p className="mt-4 max-w-[34rem] text-base leading-7 text-slate-600 sm:text-lg">
              Choose when and where you work. CareConnect helps verified care
              professionals find suitable shifts with trusted care homes and support
              services across the UK.
            </p>

            <div className="mt-6 space-y-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="group rounded-2xl border border-sky-100/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.88),rgba(236,253,245,0.72))] px-5 py-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.22)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-tight text-slate-950">
                          {benefit.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <Button
                asChild
                className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-24px_rgba(7,108,130,0.45)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Link href="/register/worker">
                  Create Your Profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

