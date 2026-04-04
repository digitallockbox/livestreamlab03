import React from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">LiveStreamLab</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#ecosystem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">$STREAMING</a>
          <a href="#creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Creators</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground">Log In</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}