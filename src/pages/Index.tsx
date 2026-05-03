import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import SafetySection from "@/components/landing/SafetySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead path="/" />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SafetySection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
