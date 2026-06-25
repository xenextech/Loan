import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import EmiCalculator from "@/components/landing/EmiCalculator";
import AboutSection from "@/components/landing/AboutSection";
import FAQSection from "@/components/landing/FAQSection";
import SiteFooter from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <EmiCalculator />
        <AboutSection />
        <FAQSection />
      </main>
      <SiteFooter />
    </div>
  );
}
