"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "Do you verify every care professional?",
    answer:
      "Yes. CareConnect supports identity checks, right-to-work verification, and profile review before a worker is matched with a facility."
  },
  {
    question: "How quickly can a shift be filled?",
    answer:
      "Facilities can publish open shifts quickly and verified professionals can apply as soon as the opportunity is live."
  },
  {
    question: "Can I post urgent shifts?",
    answer:
      "Yes. You can create urgent bookings, set the role and rate, and move faster when cover is needed at short notice."
  },
  {
    question: "Can workers tailor availability?",
    answer:
      "Workers can update availability, care settings, and preferred locations so the shifts they see are more relevant."
  },
  {
    question: "Can I keep repeat bookings simple?",
    answer:
      "Yes. The platform is designed so trusted cover, recurring shift details, and booking history stay easy to review in one place."
  }
];

const careShowcaseImages = [
  {
    src: "/images/community/home-care-cooking.webp",
    alt: "Black home-care worker preparing lunch with an older Black woman",
    objectPosition: "center 42%"
  },
  {
    src: "/images/community/garden-mobility-support.webp",
    alt: "Mixed-race care professional walking with an older South Asian man in a care-home garden",
    objectPosition: "center 38%"
  },
  {
    src: "/images/community/family-care-planning.webp",
    alt: "Black family discussing a care plan with an East Asian care professional",
    objectPosition: "center 40%"
  }
];

export function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % careShowcaseImages.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      id="faq"
      className="bg-white px-4 py-14 text-slate-950 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12">
          <div className="max-w-[40rem]">
            <Badge
              variant="soft"
              className="rounded-full px-3 py-1 text-[0.7rem] font-semibold tracking-[0.22em] text-slate-600"
            >
              Support &amp; FAQs
            </Badge>

            <h2 className="mt-4 max-w-[14ch] text-[clamp(2.1rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-tight text-slate-950">
              FAQs and helpful answers
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Find clear answers to common care staffing questions and learn how
              CareConnect supports trusted shifts, verification, and bookings.
            </p>

            <div className="relative mt-8 h-[21rem] w-full max-w-[30rem] overflow-visible sm:h-[22.5rem] sm:max-w-[34rem] lg:h-[24rem] lg:max-w-[38rem]">
              <div className="pointer-events-none absolute left-0 top-5 hidden h-[13.75rem] w-[12rem] rounded-[1.35rem] border border-sky-100 bg-[linear-gradient(180deg,rgba(43,185,255,0.18)_0%,rgba(255,255,255,0.92)_100%)] shadow-[0_18px_48px_-34px_rgba(15,23,42,0.42)] md:block" />
              <div className="pointer-events-none absolute right-0 top-0 hidden h-[14.5rem] w-[12.25rem] rounded-[1.35rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(19,217,203,0.16)_0%,rgba(255,255,255,0.9)_100%)] shadow-[0_18px_48px_-34px_rgba(15,23,42,0.38)] sm:block" />

              <div className="relative z-20 h-[19rem] w-full overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white shadow-[0_18px_48px_-32px_rgba(15,23,42,0.42)] sm:h-[20.75rem] lg:h-[24rem]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.06)_60%,rgba(7,128,150,0.14)_100%)]" />

                {careShowcaseImages.map((image, index) => {
                  const isActive = index === activeImageIndex;

                  return (
                    <div
                      key={image.src}
                      className={[
                        "absolute inset-0 transition-opacity duration-700 ease-in-out",
                        isActive ? "opacity-100" : "opacity-0"
                      ].join(" ")}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        quality={86}
                        sizes="(min-width: 1024px) 38rem, (min-width: 640px) 88vw, 94vw"
                        className={[
                          "object-cover transition-transform duration-700 ease-out",
                          isActive ? "scale-100" : "scale-[1.03]"
                        ].join(" ")}
                        style={{ objectPosition: image.objectPosition }}
                        priority={index === 0}
                      />
                    </div>
                  );
                })}

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_55%,rgba(7,128,150,0.08)_100%)]" />
              </div>
            </div>
          </div>

          <div className="space-y-3 lg:pt-10 xl:pt-12">
            {faqItems.map((item, index) => {
              const isOpen = index === activeIndex;
              const number = String(index + 1).padStart(2, "0");

              return (
                <article
                  key={item.question}
                  className={[
                    "overflow-hidden rounded-2xl border bg-white shadow-[0_12px_28px_-24px_rgba(15,23,42,0.22)] transition-all duration-300 ease-out",
                    isOpen ? "border-slate-200" : "border-slate-200/80"
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="text-xs font-semibold tracking-[0.12em] text-slate-500">
                        ({number})
                      </span>
                      <h3 className="text-sm font-semibold leading-6 text-slate-950 sm:text-base">
                        {item.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={[
                        "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                      ].join(" ")}
                    />
                  </button>

                  <div
                    className={[
                      "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    ].join(" ")}
                  >
                    <div className="min-h-0">
                      <div className="border-t border-slate-100 px-5 pb-5 pt-0 sm:px-6">
                        <p className="max-w-[36rem] text-sm leading-6 text-slate-600">
                          {item.answer}
                        </p>
                        <Button
                          asChild
                          variant="ghost"
                          className="mt-3 h-auto gap-2 px-0 text-sm font-semibold text-primary hover:bg-transparent hover:text-primary/80"
                        >
                          <Link href="#contact">
                            Learn more
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="pt-3">
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-sm font-semibold">
                <Link href="#contact">
                  View All FAQs
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
