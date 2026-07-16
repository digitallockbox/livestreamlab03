import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Users, User, Wallet, Zap, TreePine, Settings2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { computeFullTree, DEFAULT_CONFIG } from "@/lib/coinTree";

// CoinTreeDashboard — visualizes the Streaming Coin Tree for a single stream.
// Root: distributable value (gross − fees − platform).
// Branches: creator, collab, community — each split across its leaves.
export default function CoinTreeDashboard() {
  const { streamId } = useParams();
  const [stream, setStream] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [watchSessions, setWatchSessions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    if (!streamId) return;
    let active = true;
    setLoading(true);
    Promise.all([
      base44.entities.Stream.get(streamId).catch(() => null),
      base44.entities.Transaction.filter({ stream_id: streamId }).catch(() => []),
      base44.entities.WatchSession.filter({ stream_id: streamId }).catch(() => []),
    ]).then(async ([s, txs, sessions]) => {
      if (!active) return;
      setStream(s);
      setTransactions(txs || []);
      setWatchSessions(sessions || []);
      if (s?.creator_wallet) {
        const members = await base44.entities.TeamMember.filter({ creator_wallet: s.creator_wallet }).catch(() => []);
        if (active) setTeamMembers(members || []);
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [streamId]);

  const tree = useMemo(() => {
    if (!stream) return null;
    return computeFullTree({ stream, transactions, watchSessions, teamMembers, config });
  }, [stream, transactions, watchSessions, teamMembers, config]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="max-w-5xl mx-auto p-4 py-20 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Stream not found.</p>
        <Link to="/streams" className="text-primary hover:underline text-sm">← Back to streams</Link>
      </div>
    );
  }

  const fmtCoins = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const fmtUsd = (n) => `$${Number(n).toFixed(2)}`;
  const b = tree.branches;
  const pct = (r) => `${Math.round(r * 100)}%`;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to={`/streams/analytics/${streamId}`} className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Stream Analytics
        </Link>
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <TreePine className="w-6 h-6 text-primary" /> Streaming Coin Tree
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{stream.title}</p>
      </div>

      {/* Root node */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Root · Stream</p>
            <p className="font-display font-bold">Distributable Value</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Gross Revenue</p>
            <p className="font-display font-bold">{fmtUsd(tree.valueBreakdown.gross)}</p>
            <p className="text-xs text-muted-foreground">{fmtCoins(tree.valueBreakdown.grossCoins)} ◎</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Processing Fee ({pct(config.feeRate)})</p>
            <p className="font-display font-bold text-destructive">−{fmtUsd(tree.valueBreakdown.fees)}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Platform ({pct(config.platformRate)})</p>
            <p className="font-display font-bold text-destructive">−{fmtUsd(tree.valueBreakdown.platformShare)}</p>
          </div>
          <div className="rounded-lg bg-accent/10 border border-accent/30 p-3">
            <p className="text-xs text-muted-foreground">Distributable</p>
            <p className="font-display font-bold text-accent">{fmtUsd(tree.valueBreakdown.distributable)}</p>
            <p className="text-xs text-accent">{fmtCoins(tree.valueBreakdown.distributableCoins)} ◎</p>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Creator */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /><span className="font-display font-semibold">Creator</span></div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{pct(config.branchRates.creator)}</span>
          </div>
          <p className="font-display text-xl font-bold text-accent">{fmtCoins(b.creator.coins)} ◎</p>
          <p className="text-xs text-muted-foreground">{fmtUsd(b.creator.amount)}</p>
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
            {b.creator.leaves.map((leaf, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs truncate">{leaf.wallet?.slice(0, 10)}…</span>
                <span className="text-accent font-medium">{fmtCoins(leaf.coins)} ◎</span>
              </div>
            ))}
          </div>
        </div>

        {/* Collab */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="font-display font-semibold">Collab</span></div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{pct(config.branchRates.collab)}</span>
          </div>
          <p className="font-display text-xl font-bold text-accent">{fmtCoins(b.collab.coins)} ◎</p>
          <p className="text-xs text-muted-foreground">{fmtUsd(b.collab.amount)}</p>
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
            {b.collab.leaves.length === 0 ? (
              <p className="text-xs text-muted-foreground">No team members configured.</p>
            ) : b.collab.leaves.map((leaf, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate">{leaf.name}</span>
                <span className="text-accent font-medium">{fmtCoins(leaf.coins)} ◎</span>
              </div>
            ))}
          </div>
        </div>

        {/* Community */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /><span className="font-display font-semibold">Community</span></div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{pct(config.branchRates.community)}</span>
          </div>
          <p className="font-display text-xl font-bold text-accent">{fmtCoins(b.community.coins)} ◎</p>
          <p className="text-xs text-muted-foreground">{fmtUsd(b.community.amount)}</p>
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5 max-h-48 overflow-y-auto">
            {b.community.leaves.length === 0 ? (
              <p className="text-xs text-muted-foreground">No viewer sessions recorded.</p>
            ) : b.community.leaves.slice(0, 10).map((leaf, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="truncate">
                  <span className="font-mono text-xs">{leaf.viewer_wallet?.slice(0, 10)}…</span>
                  <span className="text-xs text-muted-foreground ml-1">p={leaf.participationScore?.toFixed(2)}</span>
                </div>
                <span className="text-accent font-medium">{fmtCoins(leaf.coins)} ◎</span>
              </div>
            ))}
            {b.community.leaves.length > 10 && (
              <p className="text-xs text-muted-foreground text-center pt-1">+{b.community.leaves.length - 10} more</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold mb-3">Distribution Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><p className="text-xs text-muted-foreground">Total Recipients</p><p className="font-display font-bold">{tree.totalLeaves}</p></div>
          <div><p className="text-xs text-muted-foreground">Community Viewers</p><p className="font-display font-bold">{b.community.leaves.length}</p></div>
          <div><p className="text-xs text-muted-foreground">Team Members</p><p className="font-display font-bold">{b.collab.leaves.length}</p></div>
          <div><p className="text-xs text-muted-foreground">Coins Distributed</p><p className="font-display font-bold text-accent">{fmtCoins(tree.valueBreakdown.distributableCoins)} ◎</p></div>
        </div>
      </div>

      {/* Config */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Branch Rates</h3>
        <p className="text-xs text-muted-foreground mb-3">Adjust the split between creator, collaborators, and community. Rates should sum to 100%.</p>
        <div className="grid grid-cols-3 gap-3">
          {["creator", "collab", "community"].map((key) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground capitalize">{key}</label>
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(config.branchRates[key] * 100)}
                onChange={(e) => {
                  const val = Number(e.target.value) / 100;
                  setConfig((c) => ({ ...c, branchRates: { ...c.branchRates, [key]: val } }));
                }}
                className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm mt-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}