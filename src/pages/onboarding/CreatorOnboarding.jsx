import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Zap, User, Palette, Wallet, DollarSign, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const steps = [
  { icon: User, label: "Profile" },
  { icon: Palette, label: "Branding" },
  { icon: Wallet, label: "Vault" },
  { icon: DollarSign, label: "Monetize" },
  { icon: CheckCircle2, label: "Finish" },
];

export default function CreatorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Set Up Your Profile</h2>
              <p className="text-muted-foreground mt-1">Tell us about yourself.</p>
            </div>
            <div className="space-y-4">
              <div><Label>Display Name</Label><Input placeholder="Your creator name" className="mt-1.5 bg-secondary border-border" /></div>
              <div><Label>Username</Label><Input placeholder="@username" className="mt-1.5 bg-secondary border-border" /></div>
              <div><Label>Bio</Label><Textarea placeholder="Tell your audience about you..." className="mt-1.5 bg-secondary border-border" /></div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Channel Branding</h2>
              <p className="text-muted-foreground mt-1">Customize how your channel looks.</p>
            </div>
            <div className="space-y-4">
              <div><Label>Channel Name</Label><Input placeholder="My Awesome Channel" className="mt-1.5 bg-secondary border-border" /></div>
              <div>
                <Label>Avatar</Label>
                <div className="mt-1.5 w-24 h-24 rounded-2xl bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <Label>Banner</Label>
                <div className="mt-1.5 h-32 rounded-2xl bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <p className="text-sm text-muted-foreground">Click to upload banner</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Connect CreatorVault</h2>
              <p className="text-muted-foreground mt-1">Your sovereign wallet for all earnings.</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl border border-border p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">CreatorVault</h3>
              <p className="text-sm text-muted-foreground mb-4">Connect your vault to start receiving payouts and $STREAMING rewards.</p>
              <Button className="bg-primary hover:bg-primary/90">Connect CreatorVault</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Monetization Preferences</h2>
              <p className="text-muted-foreground mt-1">Choose how you want to earn.</p>
            </div>
            <div className="space-y-3">
              {["Stream Tips & Gifts", "Video Premium Unlocks", "Store Sales", "Affiliate Commissions", "Podcast Boosts"].map((option) => (
                <label key={option} className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border cursor-pointer hover:border-primary/30 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm font-medium text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">You're All Set!</h2>
              <p className="text-muted-foreground mt-2">Your creator profile is ready. Start creating and earning today.</p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="bg-primary hover:bg-primary/90 px-8">
              Go to Dashboard
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                i <= currentStep ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                <step.icon className="w-5 h-5" />
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-12 h-0.5 rounded-full", i < currentStep ? "bg-primary" : "bg-border")} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-8">
          {renderStep()}
        </div>

        {/* Nav */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {currentStep === 3 ? "Finish" : "Next"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}