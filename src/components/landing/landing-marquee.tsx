const partnerNames = [
  "Care Homes",
  "Supported Living",
  "Nursing Teams",
  "Home Care",
  "Respite Services",
  "Night Cover",
  "Domiciliary Care",
  "Specialist Support"
];

export function LandingMarquee() {
  return (
    <section
      aria-label="CareConnect partner network"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-white py-5 sm:py-6"
    >
      <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-landing-marquee gap-14 whitespace-nowrap text-sm font-black uppercase tracking-[0.18em] text-slate-300 motion-reduce:animate-none">
            {[...partnerNames, ...partnerNames].map((name, index) => (
              <span key={`${name}-${index}`}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
