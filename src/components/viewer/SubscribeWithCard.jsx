import React, { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TIER_PRICES = { basic: 4.99, plus: 9.99, premium: 19.99 };

// SubscribeWithCard — triggers a Base44 Payments subscription checkout via
// the existing create-checkout backend function. Creates a monthly recurring
// subscription item and redirects the buyer to the hosted payment page.
export default function SubscribeWithCard({ creatorWallet, creatorName, tier = "basic" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const subscribe = async () => {
    const price = TIER_PRICES[tier] || TIER_PRICES.basic;
    if (price < 0.5) { setError("Minimum charge is $0.50"); return; }
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("create-checkout", {
        items: [{
          name: `${creatorName || "Creator"} — ${tier} subscription`,
          price: String(price),
          quantity: 1,
          subscriptionInfo: {
            subscriptionSettings: { frequency: "MONTH" },
            title: `${creatorName || "Creator"} ${tier} subscription`,
          },
        }],
        creatorWallet,
        type: "subscription",
        tier,
      });
      const url = res?.redirectUrl || res?.url || res?.checkoutSession?.redirectUrl;
      if (url) window.location.href = url;
      else setError("Checkout session could not be created.");
    } catch (e) {
      setError(e?.message || "Checkout failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        onClick={subscribe}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm hover:bg-accent/90 disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        {busy ? "Redirecting…" : `Subscribe · $${TIER_PRICES[tier] || TIER_PRICES.basic}/mo`}
      </button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}