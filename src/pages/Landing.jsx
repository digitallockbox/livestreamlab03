import React from "react";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StreamingEcosystemSection from "@/components/landing/StreamingEcosystemSection";
import CreatorsSection from "@/components/landing/CreatorsSection";
import PricingSection from "@/components/landing/PricingSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <StreamingEcosystemSection />
      <CreatorsSection />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}