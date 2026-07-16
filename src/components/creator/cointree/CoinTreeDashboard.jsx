import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Zap, TreePine, Settings2, AlertTriangle, CheckCircle2, Database, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { processStreamDistribution, validateBranchConfig, DEFAULT_CONFIG, BRANCH_TYPES } from "@/lib/coinTree";

export default function CoinTreeDashboard() {
  const { streamId } = useParams();
  const [stream, setStream] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [watchSessions, setWatchSessions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [existingAllocations, setExistingAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState(null);
  const [processError, setProcessError] = useState("");

  useEffect(() => {
    if (!streamId) return;
    let active = true;
    setLoading(true);
    Promise.all([
      base44.entities.Stream.get(streamId).catch(() => null),
      base44.entities.Transaction.filter({ stream_id: streamId }).catch(() => []),
      base44.entities.WatchSession.filter({ stream_id: streamId }).catch(() => []),
      base44.entities.CoinAllocation.filter({ stream_id: streamId }).catch(() => []),
    ]).then(async ([s, txs, sessions, allocs]) => {
      if (!active) return;
      setStream(s);
      setTransactions(txs || []);
      setWatchSessions(sessions || []);
      setExistingAllocations(allocs || []);
      if (s?.creator_wallet) {
        const members = await base44.entities.TeamMember.filter({ creator_wallet: s.creator_wallet }).catch(() => []);
        if (active) setTeamMembers(members || []);
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [streamId]);

  const tree = useMemo(() => {
    if (!stream) return null;
    return processStreamDistribution({ stream, transactions, watchSessions, teamMembers, config });
  }, [stream, transactions, watchSessions, teamMembers, config]);

  const governance = useMemo(() => validateBranchConfig(config.branches, config.governance), [config]);

  const fmtCoins = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const fmtUsd = (n) => `$${Number(n).toFixed(2)}`;
  const pct = (r) => `${Math.round(r * 100)}%`;

  const updateBranchRatio = (index, value) => {
    setConfig((c) => {
      const branches = [...c.branches];
      branches[index] = { ...branches[index], ratio: Number(value) / 100 };
      return { ...c, branches };
    });
  };

  const addBranch = (type) => {
    setConfig((c) => {
      if (c.branches.some((b) => b.type === type)) return c;
      return { ...c, branches: [...c.branches, { type, ratio: 0 }] };
    });
  };

  const removeBranch = (index) => {
    setConfig((c) => ({ ...c, branches: c.branches.filter((_, i) => i !== index) }));
  };

  // Step 7–8: Persist allocations to ledger + update account balances
  const processDistribution = async () => {
    if (!tree || !governance.valid) return;
    setProcessing(true);
    setProcessError("");
    try {
      // Step 7: Persist allocations to the ledger
      const records = tree.allocations.map((a) => ({
        stream_id: a.streamId,
        branch_type: a.branchType,
        branch_id: a.branchId,
        account_id: a.accountId,
        account_name: a.accountName || "",
        weight: a.weight,
        normalized_weight: a.normalizedWeight,
        coins_allocated: a.coinsAllocated,
        usd_value: a.usdValue,
        status: "processed",
      }));
      await base44.entities.CoinAllocation.bulkCreate(records);

      // Step 8: Update account balances
      const balanceMap = {};
      tree.allocations.forEach((a) => {
        if (!balanceMap[a.accountId]) balanceMap[a.accountId] = { coins: 0, streams: new Set() };
        balanceMap[a.accountId].coins += a.coinsAllocated;
        balanceMap[a.accountId].streams.add(a.streamId);
      });

      for (const [accountId, data] of Object.entries(balanceMap)) {
        if (!accountId) continue;
        const existing = await base44.entities.CoinAccount.filter({ account_id: accountId }).catch(() => []);
        if (existing.length > 0) {
          const acct = existing[0];
          await base44.entities.CoinAccount.update(acct.id, {
            balance_coins: (acct.balance_coins || 0) + data.coins,
            total_earned_coins: (acct.total_earned_coins || 0) + data.coins,
            streams_participated: (acct.streams_participated || 0) + data.streams.size,
          });
        } else {
          await base44.entities.CoinAccount.create({
            account_id: accountId,
            balance_coins: data.coins,
            total_earned_coins: data.coins,
            streams_participated: data.streams.size,
          });
        }
      }

      setProcessResult({ allocated: records.length, accounts: Object.keys(balanceMap).length });
      // Refresh existing allocations
      const allocs = await base44.entities.CoinAllocation.filter({ stream_id: streamId }).catch(() => []);
      setExistingAllocations(allocs || []);
    } catch (e) {
      setProcessError(e?.message || "Failed to process distribution");
    } finally {
      setProcessing(false);
    }
  };

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

      {/* Governance validation */}
      <div className={`rounded-xl border p-4 ${governance.valid ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"}`}>
        <div className="flex items-center gap-2">
          {governance.valid ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
          <span className="font-display font-semibold text-sm">{governance.valid ? "Configuration Valid" : "Configuration Errors"}</span>
        </div>
        {governance.errors.length > 0 && (
          <ul className="mt-2 space-y-1">
            {governance.errors.map((err, i) => <li key={i} className="text-xs text-destructive">• {err}</li>)}
          </ul>
        )}
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
            <p className="text-xs text-muted-foreground">Fees ({pct(config.feeRate)})</p>
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
        {tree.branches.map((branch, idx) => (
          <div key={branch.type} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-semibold capitalize">{branch.label || branch.type}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{pct(branch.ratio)}</span>
            </div>
            <p className="font-display text-xl font-bold text-accent">{fmtCoins(branch.coins)} ◎</p>
            <p className="text-xs text-muted-foreground">{fmtUsd(branch.branchValue)}</p>
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5 max-h-48 overflow-y-auto">
              {branch.leaves.length === 0 ? (
                <p className="text-xs text-muted-foreground">No leaves in this branch.</p>
              ) : branch.leaves.slice(0, 10).map((leaf) => (
                <div key={leaf.leafId} className="flex items-center justify-between text-sm">
                  <div className="truncate">
                    <span className="font-mono text-xs">{leaf.accountId?.slice(0, 12)}</span>
                    {leaf.participationScore != null && (
                      <span className="text-xs text-muted-foreground ml-1">p={leaf.participationScore.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-accent font-medium">{fmtCoins(leaf.coins)} ◎</span>
                </div>
              ))}
              {branch.leaves.length > 10 && (
                <p className="text-xs text-muted-foreground text-center pt-1">+{branch.leaves.length - 10} more</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Branch config editor */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Branch Configuration</h3>
        <div className="space-y-2">
          {config.branches.map((branch, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-sm capitalize w-24">{BRANCH_TYPES[branch.type]?.label || branch.type}</span>
              <input
                type="number" min="0" max="100" value={Math.round(branch.ratio * 100)}
                onChange={(e) => updateBranchRatio(idx, e.target.value)}
                className="w-20 rounded-md border border-input bg-muted px-3 py-1.5 text-sm"
              />
              <span className="text-xs text-muted-foreground">%</span>
              {config.branches.length > 1 && (
                <button onClick={() => removeBranch(idx)} className="ml-auto p-1 rounded hover:bg-destructive/10 text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {Object.entries(BRANCH_TYPES).filter(([type]) => !config.branches.some((b) => b.type === type)).map(([type, info]) => (
            <button key={type} onClick={() => addBranch(type)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted">
              <Plus className="w-3 h-3" /> {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Process distribution */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-display font-semibold flex items-center gap-2"><Database className="w-4 h-4" /> Persist Allocations</h3>
        <p className="text-xs text-muted-foreground">
          Runs the full pipeline: compute → normalize → allocate → write {tree.allocations.length} CoinAllocation records to the ledger and update {new Set(tree.allocations.map((a) => a.accountId)).size} CoinAccount balances.
        </p>
        <button
          onClick={processDistribution}
          disabled={processing || !governance.valid || tree.allocations.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          {processing ? "Processing…" : "Process Distribution"}
        </button>
        {processError && <p className="text-sm text-destructive">{processError}</p>}
        {processResult && (
          <p className="text-sm text-accent flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Persisted {processResult.allocated} allocations across {processResult.accounts} accounts.
          </p>
        )}
      </div>

      {/* Existing allocations (ledger) */}
      {existingAllocations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display font-semibold mb-3">Ledger · {existingAllocations.length} Allocations</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {existingAllocations.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{a.branch_type}</span>
                  <span className="font-mono text-xs truncate">{a.account_id?.slice(0, 14)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{fmtUsd(a.usd_value)}</span>
                  <span className="text-accent font-medium">{fmtCoins(a.coins_allocated)} ◎</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}