import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const shiftCards = [
  {
    total: "£216.00",
    rate: "£18/hr",
    facility: "Sunrise House Care Home",
    location: "12 Meadow Lane, Leeds",
    tag: "Long Term Care",
    date: "May 9",
    time: "07:00-19:00"
  },
  {
    total: "£160.00",
    rate: "£20/hr",
    facility: "Harbour View Supported Living",
    location: "44 Seafront Road, Liverpool",
    tag: "Personal Care",
    date: "May 12",
    time: "20:00-08:00"
  },
  {
    total: "£96.00",
    rate: "£16/hr",
    facility: "Meadow Court Care Home",
    location: "18 Green Street, Manchester",
    tag: "Domestic Support",
    date: "May 13",
    time: "09:00-15:00"
  }
];

export function ShiftMarketplaceSection() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="text-center lg:text-left">
          <h2 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-slate-950 sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3.25rem]">
            Care staffing, simplified for workers and facilities.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0">
            CareConnect helps verified care professionals and trusted care providers
            connect, apply, book, and manage shifts with confidence.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {["Verified profiles", "Direct applications", "Clear bookings"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-none"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 flex justify-center lg:justify-start">
            <Button asChild variant="outline" className="h-11 rounded-full px-5 text-sm font-semibold">
              <Link href="#care-workers">
                Explore how it works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-end">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl sm:h-[26rem] sm:w-[26rem]" />
          </div>

          <div className="relative mx-auto w-full max-w-[394px] rounded-[2.4rem] border border-slate-200/80 bg-white p-2 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.42)]">
            <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-white" />
            <div className="absolute left-1/2 top-4 z-30 h-1.5 w-12 -translate-x-1/2 rounded-full bg-slate-700/75" />

            <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50">
              <div className="flex h-11 items-center justify-between bg-slate-950 px-4 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_0_4px_rgba(34,211,238,0.12)]" />
                  Live shift activity
                </div>
                <span className="text-[0.7rem] font-medium text-white/55">Now</span>
              </div>

              <div className="h-[24rem] overflow-hidden p-3">
                <div className="animate-shift-video-scroll space-y-3">
                  {[...shiftCards, ...shiftCards].map((shift, index) => (
                    <div
                      key={`${shift.facility}-${shift.date}-${index}`}
                      className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-none"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-950">{shift.facility}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">{shift.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-950">{shift.total}</p>
                          <p className="text-xs text-slate-500">{shift.rate}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[0.68rem]">
                        <span className="rounded-full bg-cyan-100 px-2 py-1 font-medium text-primary">
                          {shift.tag}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                          {shift.date}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                          {shift.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
