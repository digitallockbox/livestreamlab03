import React, { useState, useEffect } from "react";
import { Radio, Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "$STREAMING", href: "#ecosystem" },
    { label: "Pricing", href: "#pricing" },
    { label: "API Docs", href: "/api-docs", isRoute: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-lg shadow-black/20" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="https://media.base44.com/images/public/69d070a8ef568ebbd93e386a/d080e7767_copilot_image_1775491380461.jpg" alt="LiveStreamLab" className="w-9 h-9 object-contain" />
          <div>
            <span className="font-display font-bold text-base text-foreground tracking-tight">LiveStreamLab</span>
            <span className="text-primary text-xs font-bold">.live</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            l.isRoute
              ? <Link key={l.label} to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">{l.label}</Link>
              : <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">{l.label}</a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/enter">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log In</Button>
          </Link>
          <Link to="/enter">
            <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 font-semibold gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-muted-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3">
          {links.map((l) => (
            l.isRoute
              ? <Link key={l.label} to={l.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-1.5 font-medium">{l.label}</Link>
              : <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-1.5 font-medium">{l.label}</a>
          ))}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Link to="/enter" className="flex-1"><Button variant="outline" size="sm" className="w-full">Log In</Button></Link>
            <Link to="/enter" className="flex-1"><Button size="sm" className="w-full bg-primary">Get Started</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
}