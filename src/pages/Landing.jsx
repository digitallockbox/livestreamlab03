import React from "react";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TokenSection from "@/components/landing/TokenSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import CreatorsSection from "@/components/landing/CreatorsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTABanner from "@/components/landing/CTABanner";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TokenSection />
      <ComparisonSection />
      <CreatorsSection />
      <PricingSection />
      <FAQSection />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}