import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { Loader2, ArrowDownToLine, Clock, CheckCircle2, XCircle, Users, CalendarPlus } from "lucide-react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { Page, Card, Spinner, Input } from "@/components/creator/os";
import { payoutsApi, creatorApi } from "@/lib/tridentApi";
import { downloadPayoutICS, countUpcomingPayouts } from "@/lib/payoutCalendar";
import AutosplitPanel from "@/components/creator/payouts/AutosplitPanel";

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
        creatorApi.earnings({}).catch(() => ({})),
        payoutsApi.list({}).catch(() => ({ payouts: [] })),
      ]);
      setEarnings(eco || {});
      setPayouts(list?.payouts || list || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const claimable = Number(earnings?.streaming_revenue || earnings?.claimable || 0);
  const claimed = payouts.filter((p) => p.status === "completed").reduce((a, p) => a + Number(p.amount || 0), 0);
  const inProgress = payouts.filter((p) => p.status === "pending" || p.status === "processing").reduce((a, p) => a + Number(p.amount || 0), 0);
  const available = Math.max(0, claimable - claimed - inProgress);

  const monthly = useMemo(() => {
    const map = {};
    payouts.forEach((p) => {
      if (!p.created_date) return;
      const d = new Date(p.created_date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[k] = (map[k] || 0) + Number(p.amount || 0);
    });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([k, v]) => ({ cycle: k, amount: v }));
  }, [payouts]);

  const statusBreakdown = useMemo(() => {
    const counts = { pending: 0, processing: 0, completed: 0, failed: 0 };
    payouts.forEach((p) => { if (counts[p.status] != null) counts[p.status]++; });
    return counts;
  }, [payouts]);

  const requestPayout = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError("Enter an amount greater than 0"); return; }
    if (amt > available) { setError("Amount exceeds available balance"); return; }
    setBusy(true); setError("");
    try {
      await payoutsApi.process({ cycle: cycleLabel(), amount: amt });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-3">Payouts by Month</h3>
          {monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payout activity yet.</p>
          ) : (
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="cycle" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }} formatter={(v) => `${Number(v).toLocaleString()} ◎`} />
                  <Bar dataKey="amount" name="Payout" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="space-y-3">
          <h3 className="font-display font-semibold">Status Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(statusBreakdown).map(([k, v]) => {
              const s = STATUS[k] || STATUS.pending;
              const Icon = s.icon;
              return (
                <div key={k} className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1 capitalize"><Icon className="w-3 h-3" /> {k}</p>
                  <p className="text-xl font-display font-bold">{v}</p>
                </div>
              );
            })}
          </div>
        </Card>
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

      <AutosplitPanel />

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

      {countUpcomingPayouts(payouts) > 0 && (
        <Card className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-semibold">Sync to Calendar</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{countUpcomingPayouts(payouts)} upcoming payout{countUpcomingPayouts(payouts) !== 1 ? "s" : ""} ready to sync.</p>
          </div>
          <button onClick={() => downloadPayoutICS(payouts)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 border border-border">
            <CalendarPlus className="w-4 h-4" /> Download .ics
          </button>
        </Card>
      )}

      <Link to="/economy" className="text-primary hover:underline text-sm">← Back to Earnings overview</Link>
    </Page>
  );
}