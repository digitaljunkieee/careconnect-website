import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, FileCheck2, ShieldCheck } from "lucide-react";
import { BrandWatermark } from "@/components/layout/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const benefits = [
  "Verified Professionals",
  "Faster Shift Matching",
  "Clear Payments",
  "Workforce Management"
];

const facilityTrustPoints = [
  { label: "Identity Verification", icon: ShieldCheck },
  { label: "Right-to-Work Checks", icon: FileCheck2 },
  { label: "Reviewed Profiles", icon: BadgeCheck }
];

export function BenefitsSection() {
  return (
    <section
      id="why-careconnect"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-white"
    >
      <BrandWatermark
        size="lg"
        tone="light"
        className="bottom-[-2.5rem] right-[-1.5rem] rotate-[-12deg] lg:hidden"
      />

      <div className="grid lg:min-h-[36rem] lg:grid-cols-2 lg:items-stretch">
        <div className="group relative min-h-[20rem] overflow-hidden lg:min-h-[36rem]">
          <Image
            src="/images/facilities/care-home-team.webp"
            alt="Black care-home manager speaking with a diverse team of care professionals"
            fill
            quality={86}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            style={{ objectPosition: "47% center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/10 via-transparent to-transparent" />
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Available Now
          </div>
        </div>

        <div className="relative flex h-full items-center px-5 py-10 sm:px-8 sm:py-12 lg:px-8 lg:py-12 xl:px-12">
          <div className="relative z-10 max-w-[36rem] py-2">
            <Badge variant="soft" className="rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-wide">
              Why Choose CareConnect
            </Badge>

            <h2 className="mt-3 max-w-[28rem] text-[clamp(1.85rem,3vw,2.7rem)] font-semibold leading-[1.05] tracking-tight text-slate-950">
              Built for care staffing, not generic hiring.
            </h2>

            <p className="mt-3 max-w-[30rem] text-[0.95rem] leading-6 text-slate-600 sm:text-base sm:leading-7">
              Trusted workers, faster matching, and clear bookings in one place.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 text-sm font-semibold text-slate-950 sm:text-[0.95rem]">{benefit}</div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <Button asChild className="h-11 rounded-full px-5 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5">
                <Link href="#care-workers">
                  Explore how it works
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-4 rounded-[1.35rem] border border-sky-100/70 bg-sky-50/70 px-4 py-3 sm:px-5">
              <h3 className="text-sm font-semibold text-slate-950">
                Why facilities trust CareConnect
              </h3>

              <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-3">
                {facilityTrustPoints.map(({ label, icon: Icon }) => (
                  <li key={label} className="flex items-center gap-2 text-[0.84rem] leading-5 text-slate-600 sm:text-sm sm:leading-6">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
