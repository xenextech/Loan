import LandingNav          from "@/components/landing/LandingNav";
import HeroSection         from "@/components/landing/HeroSection";
import StatsSection        from "@/components/landing/StatsSection";
import HowItWorks          from "@/components/landing/HowItWorks";
import EligibilityChecker  from "@/components/landing/EligibilityChecker";
import EmiCalculator       from "@/components/landing/EmiCalculator";
import AboutSection        from "@/components/landing/AboutSection";
import FAQSection          from "@/components/landing/FAQSection";
import CTASection          from "@/components/landing/CTASection";
import SiteFooter          from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <EligibilityChecker />
        <EmiCalculator />
        <AboutSection />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
