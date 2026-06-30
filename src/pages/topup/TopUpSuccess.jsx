import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TopUpSuccess() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-2xl font-bold font-display mb-2">Payment Received</h1>
        <p className="text-muted-foreground mb-6">
          Thanks for your purchase! Your $STREAMING coins are being credited to your account. It may take a few moments to reflect.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/"><Button>Back to Home</Button></Link>
          <Link to="/explore"><Button variant="outline">Explore</Button></Link>
        </div>
      </div>
    </div>
  );
}