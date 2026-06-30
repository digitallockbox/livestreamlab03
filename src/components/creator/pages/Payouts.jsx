import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowDownToLine, Clock, CheckCircle2, XCircle, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { economyAPI, Page, Card, Spinner, Input } from "@/components/creator/os";

const STATUS = {
  pending: { cls: "bg-muted text-muted-foreground", icon: Clock, label: "Pending" },
  processing: { cls: "bg-primary/15 text-primary", icon: Loader2, label: "Processing" },
  completed: { cls: "bg-accent/15 text-accent", icon: CheckCircle2, label: "Completed" },
  failed: { cls: "bg-destructive/15 text-destructive", icon: XCircle, label: "Failed" },
};

const cycleLabel = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function Payouts() {
  const { balance } = useStreamingIdentity();
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [eco, list] = await Promise.all([
        economyAPI.get().catch(() => ({})),
        base44.entities.Payout.list("-created_date", 50).catch(() => []),
      ]);
      setEarnings(eco || {});
      setPayouts(list || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const claimable = Number(earnings?.streaming_revenue || 0);
  const claimed = payouts.filter((p) => p.status === "completed").reduce((a, p) => a + Number(p.amount || 0), 0);
  const inProgress = payouts.filter((p) => p.status === "pending" || p.status === "processing").reduce((a, p) => a + Number(p.amount || 0), 0);
  const available = Math.max(0, claimable - claimed - inProgress);

  const requestPayout = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError("Enter an amount greater than 0"); return; }
    if (amt > available) { setError("Amount exceeds available balance"); return; }
    setBusy(true); setError("");
    try {
      await base44.entities.Payout.create({ cycle: cycleLabel(), amount: amt, status: "pending" });
      setAmount("");
      load();
    } catch (e) {
      setError(e.message || "Failed to request payout");
    } finally { setBusy(false); }
  };

  if (loading) return <Page title="Earnings Payouts" subtitle="Payout cycles, history & claims"><Spinner /></Page>;

  return (
    <Page title="Earnings Payouts" subtitle="Payout cycles, history & claim $STREAMING">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><p className="text-xs text-muted-foreground">Total Earned</p><p className="text-xl sm:text-2xl font-display font-bold">{claimable.toLocaleString()} ◎</p></Card>
        <Card><p className="text-xs text-muted-foreground">Claimed</p><p className="text-xl sm:text-2xl font-display font-bold">{claimed.toLocaleString()} ◎</p></Card>
        <Card><p className="text-xs text-muted-foreground">In Progress</p><p className="text-xl sm:text-2xl font-display font-bold">{inProgress.toLocaleString()} ◎</p></Card>
        <Card className="bg-gradient-card"><p className="text-xs text-muted-foreground">Available</p><p className="text-xl sm:text-2xl font-display font-bold text-accent">{available.toLocaleString()} ◎</p></Card>
      </div>

      <Card className="space-y-3 max-w-md">
        <div className="flex items-center gap-2"><ArrowDownToLine className="w-4 h-4 text-primary" /><h3 className="font-display font-semibold">Request Payout</h3></div>
        <div className="flex gap-2">
          <Input type="number" min={0} max={available} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Up to ${available.toLocaleString()} ◎`} />
          <button onClick={requestPayout} disabled={busy || available <= 0} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm whitespace-nowrap">{busy ? "Requesting…" : "Request"}</button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">On-chain $STREAMING wallet balance: {balance} ◎</p>
      </Card>

      <div>
        <h2 className="font-display font-semibold mb-3">Payout History</h2>
        {payouts.length === 0 ? (
          <Card><p className="text-sm text-muted-foreground">No payouts yet. Request your first payout above.</p></Card>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => {
              const s = STATUS[p.status] || STATUS.pending;
              const Icon = s.icon;
              return (
                <Card key={p.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-display font-semibold">Cycle {p.cycle}</p>
                      <p className="text-xs text-muted-foreground">{p.created_date ? new Date(p.created_date).toLocaleDateString() : ""}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-accent">{Number(p.amount).toLocaleString()} ◎</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${s.cls}`}><Icon className="w-3 h-3" /> {s.label}</span>
                    </div>
                  </div>
                  {p.team_splits && p.team_splits.length > 0 && (
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mb-2"><Users className="w-3 h-3" /> Team Splits</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {p.team_splits.map((m, i) => (
                          <div key={i} className="rounded-lg bg-muted p-2 text-sm">
                            <div className="flex justify-between"><span className="font-medium truncate">{m.name}</span><span className="text-muted-foreground">{m.percentage}%</span></div>
                            <p className="text-xs text-accent">{Number(m.amount || 0).toLocaleString()} ◎</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Link to="/economy" className="text-primary hover:underline text-sm">← Back to Earnings overview</Link>
    </Page>
  );
}