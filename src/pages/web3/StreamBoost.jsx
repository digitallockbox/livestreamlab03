import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Zap, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreator } from "@/hooks/web3/useCreator";
import { useBoosts } from "@/hooks/web3/useBoosts";
import { boosts as boostsApi } from "@/lib/web3/boosts";
import { toast } from "sonner";

export default function StreamBoost() {
  const { profile } = useCreator();
  const [params] = useSearchParams();
  const [toWallet, setToWallet] = useState(params.get("creator") || "");
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { boosts, total, count, loading } = useBoosts(profile?.wallet_address);

  const send = async () => {
    if (!profile?.wallet_address) {
      toast.error("Connect your wallet at /web3/login first");
      return;
    }
    if (!toWallet.trim()) {
      toast.error("Enter a creator wallet");
      return;
    }
    if (amount <= 0) {
      toast.error("Amount must be positive");
      return;
    }
    setSending(true);
    try {
      await boostsApi.send(profile.wallet_address, toWallet.trim(), amount, message.trim());
      toast.success(`Sent ${amount} $STREAMING boost`);
      setMessage("");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Stream Boosts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send $STREAMING boosts to creators and track boosts you've received.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> Send a Boost
        </h2>
        <div className="space-y-2">
          <Label>Creator Wallet</Label>
          <Input
            value={toWallet}
            onChange={(e) => setToWallet(e.target.value)}
            placeholder="0x..."
            className="bg-muted font-mono"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount ($STREAMING)</Label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Great stream!"
              className="bg-muted"
            />
          </div>
        </div>
        <Button onClick={send} disabled={sending} className="gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Boost</>}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Boosts You Received</h2>
          <span className="text-sm text-muted-foreground">
            {count} · {total} $STREAMING
          </span>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : boosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No boosts yet. Share your wallet to start receiving boosts.
          </p>
        ) : (
          <div className="space-y-2">
            {boosts.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-mono truncate">{b.viewer_wallet}</p>
                  {b.message && <p className="text-xs text-muted-foreground truncate">"{b.message}"</p>}
                </div>
                <span className="text-sm font-medium text-accent shrink-0">+{b.amount} ⚡</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}