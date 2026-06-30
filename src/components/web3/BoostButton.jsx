import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { useCreator } from "@/hooks/web3/useCreator";
import { boosts } from "@/lib/web3/boosts";
import { toast } from "sonner";

export default function BoostButton({ creatorWallet, amount = 1, message = "", label }) {
  const { profile } = useCreator();
  const [sending, setSending] = useState(false);

  const handle = async () => {
    if (!profile?.wallet_address) {
      toast.error("Connect your wallet at /web3/login first");
      return;
    }
    if (!creatorWallet) {
      toast.error("No creator wallet to boost");
      return;
    }
    setSending(true);
    try {
      await boosts.send(profile.wallet_address, creatorWallet, amount, message);
      toast.success(`Boosted ${amount} $STREAMING`);
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
      className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1.5 text-sm text-primary font-medium hover:bg-primary/25 transition-colors disabled:opacity-50"
    >
      {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap size={14} />}
      {label || `Boost ${amount}`}
    </button>
  );
}