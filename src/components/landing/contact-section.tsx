import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section id="contact" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#081126_0%,#0e2a63_48%,#1f6be0_100%)] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-4 lg:py-11">
        <div className="pointer-events-none absolute -right-6 -bottom-20 hidden h-56 w-56 lg:block">
          <Image
            src="/icons/cclogosmall-transparent.png"
            alt=""
            fill
            sizes="160px"
            aria-hidden="true"
            className="object-contain opacity-[0.16] blur-[1.5px]"
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-4 lg:min-h-[14rem] lg:flex-row lg:items-center lg:justify-between">
          <div className="relative z-10 max-w-2xl">
            <h2 className="relative max-w-xl text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-tight text-white sm:text-[clamp(2.25rem,3.8vw,3.2rem)]">
              Ready to find care shifts or fill staffing gaps?
            </h2>
            <p className="relative mt-2 max-w-2xl text-sm leading-6 text-white/72 sm:text-base sm:leading-7">
              Join CareConnect to connect verified care professionals with trusted UK care providers.
            </p>

            <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90">
                <Link href="/register/worker">Find Work</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/register/facility">Post a Shift</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
