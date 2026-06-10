import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity, Flame, CheckCircle2, XCircle, Clock, Zap,
  Copy, ExternalLink, RefreshCw, Search, Wifi, WifiOff,
  ArrowRightLeft, TrendingDown, Shield, Hash
} from 'lucide-react';
import { STREAMING_TOKEN_MINT, STREAMING_TOKEN_SYMBOL } from '@/lib/constants/tokens';

// ─── Helpers ────────────────────────────────────────────────────────────────
const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
const SOLSCAN_BASE      = 'https://solscan.io/tx';

const shortHash = (h) => h ? `${h.slice(0, 8)}…${h.slice(-6)}` : '—';
const shortAddr  = (a) => a ? `${a.slice(0, 4)}…${a.slice(-4)}` : '—';

function randomHex(len = 64) {
  const chars = '0123456789abcdef';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * 16)]).join('');
}

function randomBase58(len = 44) {
  const alpha = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return Array.from({ length: len }, () => alpha[Math.floor(Math.random() * alpha.length)]).join('');
}

const TX_TYPES = ['transfer', 'transfer', 'transfer', 'burn', 'burn', 'transfer', 'validation'];
const PROGRAMS  = ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', '11111111111111111111111111111111', STREAMING_TOKEN_MINT];

function generateTx(overrides = {}) {
  const type   = TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)];
  const status = Math.random() > 0.08 ? 'confirmed' : Math.random() > 0.5 ? 'pending' : 'failed';
  const amount = parseFloat((Math.random() * 50000 + 10).toFixed(2));
  const burnAmt = parseFloat((amount * 0.015).toFixed(4));
  const slot   = 340_000_000 + Math.floor(Math.random() * 100_000);
  const fee    = parseFloat((Math.random() * 0.002 + 0.0001).toFixed(6));
  return {
    id:          randomBase58(44),
    signature:   randomBase58(88),
    type,
    status,
    amount,
    burnAmount:  type === 'burn' ? amount : burnAmt,
    from:        randomBase58(44),
    to:          type === 'burn' ? 'burn111111111111111111111111111111111111111' : randomBase58(44),
    slot,
    fee,
    block_time:  Date.now() - Math.floor(Math.random() * 60_000),
    program:     PROGRAMS[Math.floor(Math.random() * PROGRAMS.length)],
    confirmations: status === 'confirmed' ? Math.floor(Math.random() * 200 + 1) : 0,
    ...overrides,
  };
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    confirmed: { label: 'Confirmed', icon: CheckCircle2, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    pending:   { label: 'Pending',   icon: Clock,        cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    failed:    { label: 'Failed',    icon: XCircle,      cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  };
  const cfg = map[status] ?? map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    transfer:   { label: 'Transfer',   icon: ArrowRightLeft, cls: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
    burn:       { label: 'Burn',       icon: Flame,          cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    validation: { label: 'Validation', icon: Shield,         cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  };
  const cfg = map[type] ?? map.transfer;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-accent transition-colors ml-1">
      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function TxRow({ tx, onClick, isNew }) {
  const age = Math.floor((Date.now() - tx.block_time) / 1000);
  const ageStr = age < 60 ? `${age}s ago` : `${Math.floor(age / 60)}m ago`;

  return (
    <motion.tr
      initial={isNew ? { opacity: 0, backgroundColor: 'hsl(165 82% 51% / 0.15)' } : { opacity: 1 }}
      animate={{ opacity: 1, backgroundColor: 'transparent' }}
      transition={{ duration: isNew ? 1.2 : 0 }}
      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer group"
      onClick={() => onClick(tx)}
    >
      <td className="py-3 px-4 font-mono text-xs text-primary">
        <div className="flex items-center gap-1">
          <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="group-hover:text-accent transition-colors">{shortHash(tx.signature)}</span>
          <CopyBtn value={tx.signature} />
        </div>
      </td>
      <td className="py-3 px-4"><TypeBadge type={tx.type} /></td>
      <td className="py-3 px-4"><StatusBadge status={tx.status} /></td>
      <td className="py-3 px-4 font-mono text-sm font-semibold text-foreground">
        {tx.amount.toLocaleString()} <span className="text-muted-foreground text-xs">$STREAM</span>
      </td>
      {tx.type === 'burn' ? (
        <td className="py-3 px-4 font-mono text-sm text-orange-400 font-semibold">
          🔥 {tx.burnAmount.toLocaleString()}
        </td>
      ) : (
        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
          {tx.confirmations > 0 ? `${tx.confirmations} confs` : '—'}
        </td>
      )}
      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{tx.slot.toLocaleString()}</td>
      <td className="py-3 px-4 text-xs text-muted-foreground">{ageStr}</td>
      <td className="py-3 px-4">
        <a
          href={`${SOLSCAN_BASE}/${tx.signature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </td>
    </motion.tr>
  );
}

function TxDetail({ tx, onClose }) {
  if (!tx) return null;
  const age = Math.floor((Date.now() - tx.block_time) / 1000);

  const rows = [
    { label: 'Signature',      value: tx.signature,  mono: true, copy: true },
    { label: 'Type',           value: <TypeBadge type={tx.type} /> },
    { label: 'Status',         value: <StatusBadge status={tx.status} /> },
    { label: 'Amount',         value: `${tx.amount.toLocaleString()} $STREAMING`, mono: true },
    ...(tx.type === 'burn' ? [{ label: 'Burned',      value: `${tx.burnAmount.toLocaleString()} $STREAMING`, mono: true }] : []),
    { label: 'From',           value: tx.from,       mono: true, copy: true, shorten: true },
    { label: 'To',             value: tx.to,         mono: true, copy: true, shorten: true },
    { label: 'Slot',           value: tx.slot.toLocaleString(), mono: true },
    { label: 'Fee (SOL)',      value: tx.fee,        mono: true },
    { label: 'Confirmations',  value: tx.confirmations > 0 ? tx.confirmations : 'N/A', mono: true },
    { label: 'Program',        value: tx.program,    mono: true, copy: true, shorten: true },
    { label: 'Age',            value: age < 60 ? `${age}s` : `${Math.floor(age / 60)}m ${age % 60}s` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
    >
      <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <h2 className="font-display font-bold text-foreground text-lg">Transaction Detail</h2>
        <Button size="sm" variant="ghost" onClick={onClose}>✕</Button>
      </div>

      {/* Solscan link */}
      <div className="px-6 pt-4">
        <a
          href={`${SOLSCAN_BASE}/${tx.signature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-accent hover:underline mb-4"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View on Solscan (devnet)
        </a>
      </div>

      <div className="px-6 pb-8 space-y-1">
        {rows.map(({ label, value, mono, copy, shorten }) => (
          <div key={label} className="flex items-start justify-between py-2.5 border-b border-border/40">
            <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
            <div className="flex items-center gap-1 flex-1 justify-end">
              {typeof value === 'string' || typeof value === 'number' ? (
                <span className={`text-xs text-right break-all ${mono ? 'font-mono text-foreground' : 'text-foreground'}`}>
                  {shorten ? shortAddr(String(value)) : String(value)}
                </span>
              ) : value}
              {copy && typeof value === 'string' && <CopyBtn value={value} />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Burn Ticker ────────────────────────────────────────────────────────────
function BurnTicker({ txList }) {
  const totalBurned = txList
    .filter(t => t.type === 'burn' && t.status === 'confirmed')
    .reduce((sum, t) => sum + t.burnAmount, 0);
  const burnTxCount = txList.filter(t => t.type === 'burn').length;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/25 rounded-xl">
      <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
      <span className="text-xs text-muted-foreground">Total Burned (session):</span>
      <span className="font-mono font-bold text-orange-400 text-sm">
        {totalBurned.toLocaleString(undefined, { maximumFractionDigits: 2 })} $STREAM
      </span>
      <span className="text-xs text-muted-foreground ml-2">in {burnTxCount} events</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function BlockExplorer() {
  const [txList, setTxList]           = useState(() => Array.from({ length: 20 }, () => generateTx()));
  const [newIds, setNewIds]           = useState(new Set());
  const [selectedTx, setSelectedTx]  = useState(null);
  const [filter, setFilter]          = useState('all');     // all | transfer | burn | validation
  const [statusFilter, setStatusFilter] = useState('all'); // all | confirmed | pending | failed
  const [search, setSearch]          = useState('');
  const [live, setLive]              = useState(true);
  const [tps, setTps]                = useState(0);
  const [totalTx, setTotalTx]        = useState(0);
  const intervalRef                  = useRef(null);
  const tpsCountRef                  = useRef(0);

  const addTx = useCallback(() => {
    const count = Math.random() > 0.6 ? 2 : 1;
    const fresh = Array.from({ length: count }, () => generateTx());
    tpsCountRef.current += count;
    setNewIds(prev => {
      const next = new Set(fresh.map(t => t.id));
      return next;
    });
    setTxList(prev => [...fresh, ...prev].slice(0, 200));
    setTotalTx(prev => prev + count);
  }, []);

  // TPS counter resets every second
  useEffect(() => {
    const tpsTick = setInterval(() => {
      setTps(tpsCountRef.current);
      tpsCountRef.current = 0;
    }, 1000);
    return () => clearInterval(tpsTick);
  }, []);

  useEffect(() => {
    if (live) {
      intervalRef.current = setInterval(addTx, 1800);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [live, addTx]);

  const filteredTx = txList.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!tx.signature.toLowerCase().includes(q) &&
          !tx.from.toLowerCase().includes(q) &&
          !tx.to.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const confirmedCount = txList.filter(t => t.status === 'confirmed').length;
  const pendingCount   = txList.filter(t => t.status === 'pending').length;
  const failedCount    = txList.filter(t => t.status === 'failed').length;
  const burnCount      = txList.filter(t => t.type === 'burn').length;
  const totalBurnedAll = txList
    .filter(t => t.type === 'burn' && t.status === 'confirmed')
    .reduce((s, t) => s + t.burnAmount, 0);

  const TYPE_FILTERS = ['all', 'transfer', 'burn', 'validation'];
  const STATUS_FILTERS = ['all', 'confirmed', 'pending', 'failed'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-xl leading-tight">
                Trident Block Explorer
              </h1>
              <p className="text-xs text-muted-foreground">
                $STREAMING settlements · Solana Devnet ·{' '}
                <span className="font-mono text-violet-400">{STREAMING_TOKEN_MINT.slice(0, 10)}…</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live toggle */}
            <button
              onClick={() => setLive(v => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                live
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              {live ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {live ? 'Live' : 'Paused'}
            </button>

            {/* TPS */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs font-mono font-semibold text-primary">
              <Zap className="w-3 h-3" />
              {tps} TPS
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => { const t = generateTx(); setTxList(p => [t, ...p].slice(0, 200)); setNewIds(new Set([t.id])); setTotalTx(p => p + 1); }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Inject Tx
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Seen',   value: totalTx.toLocaleString(),          icon: Hash,           cls: 'text-foreground' },
            { label: 'Confirmed',    value: confirmedCount,                     icon: CheckCircle2,   cls: 'text-emerald-400' },
            { label: 'Pending',      value: pendingCount,                       icon: Clock,          cls: 'text-yellow-400' },
            { label: 'Failed',       value: failedCount,                        icon: XCircle,        cls: 'text-red-400' },
            { label: 'Burn Events',  value: burnCount,                          icon: Flame,          cls: 'text-orange-400' },
            { label: 'Total Burned', value: `${totalBurnedAll.toFixed(0)} $S`,  icon: TrendingDown,   cls: 'text-orange-400' },
          ].map(({ label, value, icon: Icon, cls }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${cls}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className={`font-display font-bold text-lg ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Burn ticker */}
        <BurnTicker txList={txList} />

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Type filter */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {TYPE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  statusFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hash / address…"
              className="pl-8 text-xs h-8"
            />
          </div>

          <span className="text-xs text-muted-foreground ml-auto">
            {filteredTx.length} / {txList.length} transactions
          </span>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Tx Hash', 'Type', 'Status', 'Amount', 'Burn / Confs', 'Slot', 'Age', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredTx.slice(0, 100).map(tx => (
                    <TxRow
                      key={tx.id}
                      tx={tx}
                      onClick={setSelectedTx}
                      isNew={newIds.has(tx.id)}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredTx.length === 0 && (
              <div className="py-16 text-center text-muted-foreground text-sm">
                No transactions match your filters.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Streaming settlements tracked on{' '}
          <a href={`https://solscan.io/token/${STREAMING_TOKEN_MINT}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Solana Devnet
          </a>{' '}
          · Mint: <span className="font-mono">{STREAMING_TOKEN_MINT}</span>
        </p>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedTx && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedTx(null)}
            />
            <TxDetail tx={selectedTx} onClose={() => setSelectedTx(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}