import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, ArrowLeft } from "lucide-react";

// ThankYou — redirect target after a successful Base44 Payments checkout.
// The Wix Payments API requires a thankYouPageUrl; this page serves that role.
export default function ThankYou() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") || params.get("session_id") || "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-accent/30 bg-card p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-accent" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Payment Complete</h1>
          <p className="text-sm text-muted-foreground mt-1">Thank you for your purchase!</p>
        </div>
        {orderId && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="text-muted-foreground">Order ID</p>
            <p className="font-mono text-xs mt-1 break-all">{orderId}</p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Link to="/store" className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-md border border-border text-sm hover:bg-muted">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <Link to="/" className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
            <Package className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}