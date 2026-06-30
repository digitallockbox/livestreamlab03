import { useState } from "react";
import { Loader2, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreator } from "@/hooks/web3/useCreator";
import { useSubscribers } from "@/hooks/web3/useSubscriptions";
import { subscriptions as subsApi } from "@/lib/web3/subscriptions";
import { toast } from "sonner";

export default function Subscriptions() {
  const { profile } = useCreator();
  const [toWallet, setToWallet] = useState("");
  const [tier, setTier] = useState("basic");
  const [sending, setSending] = useState(false);
  const { subscribers, count, mrr, loading } = useSubscribers(profile?.wallet_address);

  const subscribe = async () => {
    if (!profile?.wallet_address) {
      toast.error("Connect your wallet at /web3/login first");
      return;
    }
    if (!toWallet.trim()) {
      toast.error("Enter a creator wallet");
      return;
    }
    setSending(true);
    try {
      await subsApi.subscribe(profile.wallet_address, toWallet.trim(), tier);
      toast.success(`Subscribed to ${toWallet.slice(0, 6)}... (${tier})`);
      setToWallet("");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Offer tiered subscriptions and track your active subscribers.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active Subscribers</p>
          <p className="text-2xl font-display font-bold mt-1">{count}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          <p className="text-2xl font-display font-bold mt-1 text-accent">${mrr.toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-accent" /> Subscribe to a Creator
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
        <div className="space-y-2">
          <Label>Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger className="bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic — $4.99/mo</SelectItem>
              <SelectItem value="plus">Plus — $9.99/mo</SelectItem>
              <SelectItem value="premium">Premium — $19.99/mo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={subscribe} disabled={sending} className="gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Subscribe
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
          <Users className="w-4 h-4" /> Your Subscribers
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active subscribers yet.</p>
        ) : (
          <div className="space-y-2">
            {subscribers.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-mono truncate">{s.subscriber_wallet}</p>
                  <p className="text-xs text-muted-foreground">
                    Renews {s.renews_at ? new Date(s.renews_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-medium capitalize text-accent">{s.tier}</span>
                  <p className="text-xs text-muted-foreground">${(s.price_monthly || 0).toFixed(2)}/mo</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}