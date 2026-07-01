import Image from "next/image";
import { BrandGlyph } from "@/components/layout/brand-mark";

export function UkMatchingSection() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-white py-6 sm:py-8 lg:py-10">
      <div className="relative mx-auto w-full">
        <div className="relative w-full overflow-hidden rounded-[2rem] bg-[rgba(255,255,255,0.68)] px-5 py-8 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.18)] backdrop-blur-[14px] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/images/facilities/care-network-background.svg"
              alt=""
              fill
              sizes="100vw"
              aria-hidden="true"
              className="object-cover object-center opacity-[0.32] saturate-[1.05] mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.52),rgba(255,255,255,0.88)_74%)]" />
          </div>

          <div className="relative">
            <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur-sm">
              <BrandGlyph className="h-9 w-9 border-transparent shadow-none" />
              <p className="text-[0.78rem] font-medium tracking-normal text-primary">
                UK care staffing network
              </p>
            </div>

            <h2 className="mx-auto mt-5 max-w-5xl font-display text-[clamp(1.75rem,8vw,2.125rem)] font-semibold leading-[1.05] tracking-normal text-slate-950 sm:text-[clamp(2.125rem,5vw,2.625rem)] lg:text-[clamp(2.625rem,3.5vw,3.25rem)]">
              Connecting verified care workers with trusted facilities across the UK.
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
