import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const PACKAGES = [
  { id: "starter", coins: 500, usd: 5, label: "Starter", bonus: "" },
  { id: "popular", coins: 1200, usd: 10, label: "Popular", bonus: "+200 bonus" },
  { id: "pro", coins: 3500, usd: 25, label: "Pro", bonus: "+500 bonus" },
  { id: "whale", coins: 8000, usd: 50, label: "Whale", bonus: "+1,500 bonus" },
];

export default function TopUp() {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const buy = async (pkg) => {
    setError(null);
    setBusyId(pkg.id);
    try {
      const res = await base44.functions.invoke("create-checkout", { packageId: pkg.id });
      const redirectUrl = res?.data?.redirectUrl;
      if (!redirectUrl) throw new Error("No checkout URL returned.");
      window.location.href = redirectUrl;
    } catch (e) {
      setError(e?.message || "Could not start checkout.");
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Coins className="w-7 h-7 text-accent" />
          <h1 className="text-2xl font-bold font-display">Top Up $STREAMING</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Pick a coin package and pay securely via Base44 Payments. Coins are credited to your account once payment is confirmed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PACKAGES.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col gap-3 bg-gradient-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{p.label}</span>
                {p.bonus && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">{p.bonus}</span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display text-gradient-brand">
                  {p.coins.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">$STREAMING</span>
              </div>
              <div className="text-lg font-semibold">${p.usd}</div>
              <Button onClick={() => buy(p)} disabled={busyId === p.id} className="w-full">
                {busyId === p.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Redirecting…
                  </>
                ) : (
                  `Buy ${p.label}`
                )}
              </Button>
            </Card>
          ))}
        </div>

        {error && <p className="text-destructive text-sm mt-6">{error}</p>}

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-8">
          <ShieldCheck className="w-4 h-4" />
          Secure checkout handled by Base44 Payments. We never see your card details.
        </div>
      </div>
    </div>
  );
}