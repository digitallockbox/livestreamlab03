import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useCreator } from "@/hooks/web3/useCreator";
import { subscriptions } from "@/lib/web3/subscriptions";
import { toast } from "sonner";

const TIERS = { basic: 4.99, plus: 9.99, premium: 19.99 };

export default function SubscribeButton({ creatorWallet, tier = "basic", label }) {
  const { profile } = useCreator();
  const [sending, setSending] = useState(false);

  const handle = async () => {
    if (!profile?.wallet_address) {
      toast.error("Connect your wallet at /web3/login first");
      return;
    }
    if (!creatorWallet) {
      toast.error("No creator wallet to subscribe to");
      return;
    }
    setSending(true);
    try {
      await subscriptions.subscribe(profile.wallet_address, creatorWallet, tier);
      toast.success(`Subscribed (${tier}) — $${TIERS[tier]}/mo`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={sending}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/30 px-3 py-1.5 text-sm text-accent font-medium hover:bg-accent/25 transition-colors disabled:opacity-50"
    >
      {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard size={14} />}
      {label || `Subscribe $${TIERS[tier]}/mo`}
    </button>
  );
}