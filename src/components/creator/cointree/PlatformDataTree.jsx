import React, { useEffect, useState } from "react";
import { TreePine, Zap, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import { processStreamDistribution, DEFAULT_CONFIG, usdToCoins } from "@/lib/coinTree";
import TreeBranchNode from "@/components/creator/cointree/TreeBranchNode";

const fmtCoins = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtUsd = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function PlatformDataTree() {
  const { walletAddress } = useIdentity();
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState(null);
  const [expanded, setExpanded] = useState({ creator: true, collab: false, community: false, platform: false, sponsor: false });

  const load = async () => {
    if (!walletAddress) { setLoading(false); return; }
    setLoading(true);
    try {
      const streams = await base44.entities.Stream.filter({ creator_wallet: walletAddress }).catch(() => []);
      if (!streams || streams.length === 0) { setTree(null); return; }

      const teamMembers = await base44.entities.TeamMember.filter({ creator_wallet: walletAddress }).catch(() => []);

      const perStream = await Promise.all(
        streams.map(async (s) => {
          const [txs, sessions] = await Promise.all([
            base44.entities.Transaction.filter({ stream_id: s.id }).catch(() => []),
            base44.entities.WatchSession.filter({ stream_id: s.id }).catch(() => []),
          ]);
          return processStreamDistribution({
            stream: s,
            transactions: txs,
            watchSessions: sessions,
            teamMembers,
            config: DEFAULT_CONFIG,
          });
        })
      );

      const merged = perStream.reduce(
        (acc, t) => {
          acc.gross += t.valueBreakdown.gross;
          acc.fees += t.valueBreakdown.fees;
          acc.platformShare += t.valueBreakdown.platformShare;
          acc.distributable += t.valueBreakdown.distributable;
          t.branches.forEach((b) => {
            if (!acc.branches[b.type]) {
              acc.branches[b.type] = { type: b.type, label: b.label, ratio: b.ratio, branchValue: 0, coins: 0, leaves: [] };
            }
            acc.branches[b.type].branchValue += b.branchValue;
            acc.branches[b.type].coins += b.coins;
            acc.branches[b.type].leaves.push(
              ...b.leaves.map((l) => ({ ...l, streamId: t.stream.id, streamTitle: t.stream.title }))
            );
          });
          return acc;
        },
        { gross: 0, fees: 0, platformShare: 0, distributable: 0, branches: {} }
      );

      setTree(merged);
    } catch (e) {
      console.warn("PlatformDataTree load failed:", e?.message || e);
      setTree(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  // Real-time refresh on ledger changes
  useEffect(() => {
    if (!walletAddress) return;
    const unsubAlloc = base44.entities.CoinAllocation.subscribe(() => load());
    const unsubAcct = base44.entities.CoinAccount.subscribe(() => load());
    return () => { unsubAlloc?.(); unsubAcct?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <TreePine className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No revenue data yet. Start a stream to grow your tree.
        </p>
      </div>
    );
  }

  const branchList = Object.values(tree.branches).filter(
    (b) => b.branchValue > 0 || (b.leaves && b.leaves.length > 0)
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <TreePine className="w-5 h-5 text-primary" />
        <h2 className="font-display font-bold">Platform Data Tree</h2>
        <span className="text-xs text-muted-foreground ml-auto">LiveStreamLab</span>
      </div>

      {/* Root node */}
      <div className="rounded-xl bg-gradient-card border border-primary/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Root · Platform</p>
            <p className="font-display font-bold text-sm">Distributable Value</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Gross</p>
            <p className="font-display font-bold text-sm">{fmtUsd(tree.gross)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Fees</p>
            <p className="font-display font-bold text-sm text-destructive">−{fmtUsd(tree.fees)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Platform</p>
            <p className="font-display font-bold text-sm text-destructive">−{fmtUsd(tree.platformShare)}</p>
          </div>
          <div className="rounded-lg bg-accent/10 border border-accent/30 p-2">
            <p className="text-xs text-muted-foreground">Distributable</p>
            <p className="font-display font-bold text-sm text-accent">{fmtUsd(tree.distributable)}</p>
            <p className="text-xs text-accent">{fmtCoins(usdToCoins(tree.distributable))} ◎</p>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="space-y-2">
        {branchList.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">No active branches.</p>
        ) : (
          branchList.map((branch) => (
            <TreeBranchNode
              key={branch.type}
              branch={branch}
              expanded={!!expanded[branch.type]}
              onToggle={() => setExpanded((e) => ({ ...e, [branch.type]: !e[branch.type] }))}
            />
          ))
        )}
      </div>
    </div>
  );
}