"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ClipboardCheck,
  Search,
  ShieldCheck,
  UserPlus,
  UsersRound,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandWatermark } from "@/components/layout/brand-mark";

type Audience = "workers" | "facilities";

type StepCard = {
  step: string;
  title: string;
  description: string;
  points: string[];
  ctaLabel: string;
  href: string;
  icon: LucideIcon;
};

type AudienceContent = {
  hash: string;
  label: string;
  cards: StepCard[];
};

const audienceContent: Record<Audience, AudienceContent> = {
  workers: {
    hash: "care-workers",
    label: "Care Workers",
    cards: [
      {
        step: "01",
        title: "Create Your Profile",
        description:
          "Add your experience, availability, and preferred care settings so facilities can understand your background quickly.",
        points: [
          "Add work history and care experience",
          "Set your location and availability",
          "Keep your profile up to date"
        ],
        ctaLabel: "Create profile",
        href: "/register/worker",
        icon: UserPlus
      },
      {
        step: "02",
        title: "Complete Verification",
        description:
          "Upload the checks we need to confirm identity and eligibility. Verified profiles move through the process faster.",
        points: [
          "Upload ID and right-to-work checks",
          "Add references or training records",
          "Track what still needs review"
        ],
        ctaLabel: "Verify checks",
        href: "/register/worker",
        icon: ShieldCheck
      },
      {
        step: "03",
        title: "Browse Available Shifts",
        description:
          "See live shifts from trusted facilities, compare the essentials, and apply to the ones that match your schedule.",
        points: [
          "Filter by date, role, and location",
          "Compare pay, hours, and care setting",
          "Apply from the shift details screen"
        ],
        ctaLabel: "Browse shifts",
        href: "/register/worker",
        icon: Search
      },
      {
        step: "04",
        title: "Start Working & Get Paid",
        description:
          "Once a shift is confirmed, review the details, complete the work, and keep payment information in one place.",
        points: [
          "Review confirmed shift details",
          "Track completed bookings",
          "Keep payment history in one place"
        ],
        ctaLabel: "Start working",
        href: "/register/worker",
        icon: Wallet
      }
    ]
  },
  facilities: {
    hash: "care-facilities",
    label: "Care Facilities",
    cards: [
      {
        step: "01",
        title: "Create Facility Account",
        description:
          "Set up your organisation profile so workers can see who is posting and what care environment they are applying to.",
        points: [
          "Add organisation and site details",
          "Set the care settings you support",
          "Add contact and approval info"
        ],
        ctaLabel: "Set up account",
        href: "/register/facility",
        icon: Building2
      },
      {
        step: "02",
        title: "Post Open Shifts",
        description:
          "Create a shift with the hours, pay, and care requirements that matter most. You can publish quickly and edit the posting before it goes live.",
        points: [
          "Choose date, time, and role",
          "Add pay and essential requirements",
          "Publish or save as a draft"
        ],
        ctaLabel: "Post shift",
        href: "/register/facility",
        icon: ClipboardCheck
      },
      {
        step: "03",
        title: "Review Applicants",
        description:
          "Compare applicants side by side, check verification status, and shortlist the people who fit best without leaving the workflow.",
        points: [
          "Review availability and documents",
          "Shortlist verified applicants",
          "Message with less back-and-forth"
        ],
        ctaLabel: "Review applicants",
        href: "/register/facility",
        icon: UsersRound
      },
      {
        step: "04",
        title: "Fill Positions Faster",
        description:
          "Confirm the right person and close the shift with fewer calls and emails. Repeated bookings stay simpler because the workflow stays consistent.",
        points: [
          "Confirm a trusted match",
          "Reduce admin on each booking",
          "Reuse the same flow for future cover"
        ],
        ctaLabel: "Fill positions",
        href: "/register/facility",
        icon: CalendarDays
      }
    ]
  }
};

function getAudienceFromHash(hash: string): Audience | null {
  if (hash === "#care-facilities") {
    return "facilities";
  }

  if (hash === "#care-workers") {
    return "workers";
  }

  return null;
}

export function AudienceSwitchSection() {
  const [activeAudience, setActiveAudience] = useState<Audience>("workers");
  const active = audienceContent[activeAudience];

  useEffect(() => {
    const syncAudienceFromHash = () => {
      const nextAudience = getAudienceFromHash(window.location.hash);

      if (nextAudience) {
        setActiveAudience(nextAudience);
      }
    };

    syncAudienceFromHash();
    window.addEventListener("hashchange", syncAudienceFromHash);

    return () => window.removeEventListener("hashchange", syncAudienceFromHash);
  }, []);

  function selectAudience(nextAudience: Audience) {
    setActiveAudience(nextAudience);
    window.history.replaceState(null, "", `#${audienceContent[nextAudience].hash}`);
  }

  return (
    <section
      id="how-it-works"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[radial-gradient(circle_at_16%_18%,rgba(43,185,255,0.14),transparent_34%),radial-gradient(circle_at_86%_22%,rgba(19,217,203,0.08),transparent_28%),linear-gradient(180deg,#f8fcff,#eef8ff)] py-12 sm:py-14 lg:py-16"
    >
      <span id="care-workers" className="absolute -top-24" aria-hidden="true" />
      <span id="care-facilities" className="absolute -top-24" aria-hidden="true" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(43,185,255,0.06),transparent_46%)]" />

      <div className="pointer-events-none absolute -left-10 -top-20 hidden h-60 w-60 lg:block">
        <Image
          src="/icons/cclogosmall-transparent.png"
          alt=""
          fill
          sizes="240px"
          aria-hidden="true"
          className="rotate-180 object-contain opacity-[0.12] blur-[1.5px]"
        />
      </div>

      <BrandWatermark
        size="lg"
        tone="light"
        className="bottom-[-3.25rem] right-[-1.75rem] rotate-0 scale-95 opacity-[0.08] blur-[1.15px] lg:hidden"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="mt-6 inline-flex rounded-full border border-border/70 bg-white p-1 shadow-sm"
          role="tablist"
          aria-label="CareConnect audience"
        >
          {(Object.keys(audienceContent) as Audience[]).map((audience) => {
            const isActive = audience === activeAudience;

            return (
              <button
                key={audience}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectAudience(audience)}
                className={[
                  "rounded-full px-4 py-3 text-sm font-bold transition-all sm:px-5 sm:text-base",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_18px_48px_-24px_rgba(43,185,255,0.45)]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                ].join(" ")}
              >
                {audienceContent[audience].label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {active.cards.map((card) => {
            const Icon = card.icon;

            return (
              <Card
                key={`${activeAudience}-${card.step}`}
                className="group relative h-full min-h-[23rem] overflow-hidden border border-slate-200/70 bg-white shadow-[0_18px_60px_-42px_rgba(15,23,42,0.22)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(43,185,255,0.1),transparent_42%)]" />
                <div className="relative flex h-full flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl font-black tracking-tight text-primary/15">
                      {card.step}
                    </span>
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <h4 className="mt-5 text-xl font-black leading-tight text-slate-950 sm:text-[1.45rem]">
                    {card.title}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>

                  <ul className="mt-4 space-y-2.5">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                        <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-5">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-10 rounded-full border-primary/15 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Link href={card.href}>
                        {card.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
