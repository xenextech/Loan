import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import EligibilityChecker from "@/components/landing/EligibilityChecker";
import EmiCalculator from "@/components/landing/EmiCalculator";
import OurApproach from "@/components/landing/OurApproach";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import AboutSection from "@/components/landing/AboutSection";
import FAQSection from "@/components/landing/FAQSection";
import OurImpact from "@/components/landing/OurImpact";
import CTASection from "@/components/landing/CTASection";
import SiteFooter from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <HowItWorks />
        <OurApproach />
        <WhyChooseUs />
        <OurImpact />
        <EligibilityChecker />
        <EmiCalculator />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
