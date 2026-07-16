import React, { useState, useEffect } from "react";
import { Loader2, Calculator, CheckCircle2, TrendingUp, Wallet, Clock, Link2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { Card } from "@/components/creator/os";
import {
  aggregateEarnings, buildParticipants, calculateSplit,
  calcTransactionEarnings, calcWatchTimeEarnings,
} from "@/lib/earningsEngine";

// AutosplitPanel — calculates payouts from real Transaction + WatchSession
// data, splits across team members, active affiliates, and a platform fee,
// then creates Payout records via the entity SDK.
export default function AutosplitPanel() {
  const { wallet } = useStreamingIdentity();
  const [transactions, setTransactions] = useState([]);
  const [watchSessions, setWatchSessions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [finalizing, setFinalizing] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    if (!wallet) { setLoading(false); return; }
    setLoading(true);
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    try {
      const [txs, sessions, members, affiliates, existingPayouts] = await Promise.all([
        base44.entities.Transaction.filter({ recipient_wallet: wallet, status: "completed" }, "-created_date", 500)
          .then((data) => (data || []).filter((t) => {
            const d = new Date(t.created_date);
            return d >= periodStart && d <= periodEnd;
          }))
          .catch(() => []),
        base44.entities.WatchSession.filter({ creator_wallet: wallet, status: "ended" }, "-created_date", 500)
          .then((data) => (data || []).filter((ws) => {
            const d = new Date(ws.created_date);
            return d >= periodStart && d <= periodEnd;
          }))
          .catch(() => []),
        base44.entities.TeamMember.filter({ creator_wallet: wallet }, null, 50)
          .then((data) => data || [])
          .catch(() => []),
        base44.entities.AffiliateLink.filter({ creator_wallet: wallet }, null, 50)
          .then((data) => data || [])
          .catch(() => []),
        base44.entities.Payout.filter({ creator_wallet: wallet }, "-created_date", 50)
          .then((data) => data || [])
          .catch(() => []),
      ]);
      setTransactions(txs);
      setWatchSessions(sessions);
      setTeamMembers(members);
      setAffiliateLinks(affiliates);
      setPayouts(existingPayouts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [wallet]);

  const earnings = aggregateEarnings(transactions, watchSessions);
  const periodTotal = earnings.total;
  const txTotal = transactions.reduce((s, t) => s + calcTransactionEarnings(t), 0);
  const watchTimeTotal = watchSessions.reduce((s, ws) => s + calcWatchTimeEarnings(ws.minutes_watched), 0);

  const participants = buildParticipants(teamMembers, affiliateLinks);
  const splits = calculateSplit(periodTotal, participants);

  const now = new Date();
  const cycle = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const alreadyGenerated = payouts.some((p) => p.cycle === cycle);

  const generate = async () => {
    if (!wallet || periodTotal <= 0) return;
    setGenerating(true);
    setError("");
    try {
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

      await base44.entities.Payout.create({
        creator_wallet: wallet,
        cycle,
        period_start: periodStart,
        period_end: periodEnd,
        amount: periodTotal,
        status: "pending",
        team_splits: splits.map((s) => ({ name: s.name, percentage: s.percentage, amount: s.amount })),
      });
      load();
    } catch (err) {
      setError(err.message || "Failed to generate payout");
    } finally {
      setGenerating(false);
    }
  };

  const finalize = async (payoutId) => {
    setFinalizing(payoutId);
    try {
      await base44.entities.Payout.update(payoutId, { status: "completed" });
      load();
    } catch (err) {
      setError(err.message || "Failed to finalize payout");
    } finally {
      setFinalizing(null);
    }
  };

  if (loading) {
    return <Card><div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Card>;
  }

  if (!wallet) {
    return <Card><p className="text-sm text-muted-foreground">Connect your wallet to manage autosplit payouts.</p></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold">Autosplit Calculator</h3>
          <span className="text-xs text-muted-foreground ml-auto">{cycle}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Transactions</p>
            <p className="font-display font-bold text-lg">${txTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{transactions.length} txs</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Watch Time</p>
            <p className="font-display font-bold text-lg">${watchTimeTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{watchSessions.length} sessions</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Wallet className="w-3 h-3" /> Total</p>
            <p className="font-display font-bold text-lg text-accent">${periodTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">period earnings</p>
          </div>
        </div>

        {splits.length > 0 && (
          <div className="border-t border-border/50 pt-3">
            <p className="text-xs text-muted-foreground mb-2">Split Breakdown</p>
            <div className="space-y-2">
              {splits.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.type === "affiliate" && <Link2 className="w-3 h-3 text-muted-foreground" />}
                    {s.type === "platform" && <span className="text-xs text-muted-foreground">(fee)</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{s.percentage}%</span>
                    <span className="font-display font-semibold text-accent w-20 text-right">${s.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {participants.length === 0 && (
          <p className="text-sm text-muted-foreground">Add team members with split percentages to distribute earnings.</p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={generate}
          disabled={generating || periodTotal <= 0 || alreadyGenerated}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          {alreadyGenerated ? "Already Generated" : "Generate Payout"}
        </button>
        {alreadyGenerated && <p className="text-xs text-muted-foreground">A payout for {cycle} has already been generated.</p>}
      </Card>

      {payouts.length > 0 && (
        <Card className="space-y-3">
          <h3 className="font-display font-semibold flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /> Generated Payouts</h3>
          <div className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-medium text-sm">Cycle {p.cycle}</p>
                    {p.period_start && p.period_end && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.period_start).toLocaleDateString()} – {new Date(p.period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-accent">${Number(p.amount || 0).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.status === "completed" ? "bg-accent/15 text-accent" :
                      p.status === "pending" ? "bg-muted text-muted-foreground" :
                      "bg-primary/15 text-primary"
                    }`}>{p.status}</span>
                    {p.status === "pending" && (
                      <button
                        onClick={() => finalize(p.id)}
                        disabled={finalizing === p.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-xs hover:bg-accent/90 disabled:opacity-50"
                      >
                        {finalizing === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
                {p.team_splits && p.team_splits.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {p.team_splits.map((m, i) => (
                        <div key={i} className="text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium truncate">{m.name}</span>
                            <span className="text-muted-foreground">{m.percentage}%</span>
                          </div>
                          <p className="text-accent">${Number(m.amount || 0).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}