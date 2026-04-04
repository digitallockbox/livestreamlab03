import React from "react";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StreamingEcosystemSection from "@/components/landing/StreamingEcosystemSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="ecosystem">
        <StreamingEcosystemSection />
      </div>
      <LandingFooter />
    </div>
  );
}