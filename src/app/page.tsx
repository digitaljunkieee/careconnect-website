import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROLE_HOME } from "@/lib/constants";
import {
  AudienceSwitchSection,
  BenefitsSection,
  ContactSection,
  FaqSection,
  HeroSection,
  LandingFooter,
  LandingBackToTop,
  LandingMarquee,
  WorkerScheduleSection
} from "@/components/landing";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return (
    <main
      id="home"
      className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f9fcff_0%,#eef6fb_100%)] text-foreground"
    >
      <HeroSection />
      <WorkerScheduleSection />
      <AudienceSwitchSection />
      <BenefitsSection />
      <FaqSection />
      <ContactSection />
      <LandingMarquee />
      <LandingFooter />
      <LandingBackToTop />
    </main>
  );
}
