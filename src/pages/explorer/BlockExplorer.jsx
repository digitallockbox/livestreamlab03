import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import {
  Activity, CheckCircle2, RefreshCw, Search, Wifi, WifiOff,
  Hash, X, Users, Copy, ExternalLink, ArrowRightLeft, Flame, Shield, Clock, XCircle
} from 'lucide-react';
import { STREAMING_TOKEN_MINT, STREAMING_TOKEN_SYMBOL } from '@/lib/constants/tokens';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SOLSCAN_BASE = 'https://solscan.io/tx';

const shortHash = (h) => h ? `${h.slice(0, 8)}…${h.slice(-6)}` : '—';
const shortAddr  = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—';
const timeAgo    = (ts) => {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 1400); };
  return (
    <button onClick={(e) => { e.stopPropagation(); copy(); }} className="text-muted-foreground hover:text-accent transition-colors ml-1 flex-shrink-0">
      {ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

const TYPE_CFG = {
  transfer:   { label: 'Transfer',   Icon: ArrowRightLeft, bg: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  burn:       { label: 'Burn',       Icon: Flame,          bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  validation: { label: 'Validation', Icon: Shield,         bg: 'bg-cyan-500/15   text-cyan-400   border-cyan-500/30'   },
};
const STATUS_CFG = {
  confirmed: { label: 'Confirmed', Icon: CheckCircle2, bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  pending:   { label: 'Pending',   Icon: Clock,        bg: 'bg-yellow-500/15  text-yellow-400  border-yellow-500/30'  },
  failed:    { label: 'Failed',    Icon: XCircle,      bg: 'bg-red-500/15     text-red-400     border-red-500/30'     },
};

function Pill({ cfg }) {
  const { label, Icon, bg } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${bg}`}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function TxRow({ tx, isNew, onSelect }) {
  return (
    <motion.tr
      layout
      initial={isNew ? { opacity: 0, backgroundColor: 'hsl(165 82% 51% / 0.12)' } : { opacity: 1 }}
      animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
      transition={{ duration: isNew ? 1.4 : 0 }}
      className="border-b border-border/40 hover:bg-muted/25 cursor-pointer group"
      onClick={() => onSelect(tx)}
    >
      <td className="py-2.5 px-4 font-mono text-xs text-primary">
        <div className="flex items-center gap-1">
          <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="group-hover:text-accent transition-colors">{shortHash(tx.sig)}</span>
          <CopyBtn value={tx.sig} />
        </div>
      </td>
      <td className="py-2.5 px-4"><Pill cfg={TYPE_CFG[tx.type]} /></td>
      <td className="py-2.5 px-4"><Pill cfg={STATUS_CFG[tx.status]} /></td>
      <td className="py-2.5 px-4 font-mono text-sm font-semibold">
        {tx.amount.toLocaleString()}&nbsp;<span className="text-muted-foreground text-xs">$S</span>
      </td>
      <td className="py-2.5 px-4 font-mono text-xs">
        {tx.type === 'burn'
          ? <span className="text-orange-400 font-semibold">🔥 {tx.burn.toLocaleString()}</span>
          : <span className="text-muted-foreground">{tx.confs > 0 ? `${tx.confs} confs` : '—'}</span>}
      </td>
      <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">{tx.slot.toLocaleString()}</td>
      <td className="py-2.5 px-4 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(tx.ts)}</td>
      <td className="py-2.5 px-4">
        <a
          href={`${SOLSCAN_BASE}/${tx.sig}?cluster=devnet`}
          target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-accent"
        ><ExternalLink className="w-3.5 h-3.5" /></a>
      </td>
    </motion.tr>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function TxDrawer({ tx, onClose }) {
  if (!tx) return null;
  const fields = [
    { label: 'Signature', value: tx.sig,     mono: true, copy: true },
    { label: 'Type',      value: <Pill cfg={TYPE_CFG[tx.type]} /> },
    { label: 'Status',    value: <Pill cfg={STATUS_CFG[tx.status]} /> },
    { label: 'Amount',    value: `${tx.amount.toLocaleString()} $STREAMING`, mono: true },
    ...(tx.type === 'burn' ? [{ label: 'Burned', value: `🔥 ${tx.burn.toLocaleString()} $STREAMING`, mono: true }] : []),
    { label: 'From',      value: tx.from,    mono: true, copy: true, shorten: true },
    { label: 'To',        value: tx.to,      mono: true, copy: true, shorten: true },
    { label: 'Slot',      value: tx.slot.toLocaleString(), mono: true },
    { label: 'Fee (SOL)', value: tx.fee,     mono: true },
    { label: 'Confs',     value: tx.confs || 'N/A', mono: true },
    { label: 'Program',   value: tx.program, mono: true, copy: true, shorten: true },
    { label: 'Age',       value: timeAgo(tx.ts) },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-display font-bold text-lg">Transaction Detail</h2>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="px-6 pt-3 pb-1">
          <a
            href={`${SOLSCAN_BASE}/${tx.sig}?cluster=devnet`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> View on Solscan (devnet)
          </a>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {fields.map(({ label, value, mono, copy, shorten }) => (
            <div key={label} className="flex items-start justify-between py-3 border-b border-border/40">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0 pt-0.5">{label}</span>
              <div className="flex items-center gap-1 flex-1 justify-end">
                {typeof value === 'string' || typeof value === 'number'
                  ? <span className={`text-xs text-right break-all ${mono ? 'font-mono text-foreground' : 'text-foreground'}`}>
                      {shorten ? shortAddr(String(value)) : String(value)}
                    </span>
                  : value}
                {copy && typeof value === 'string' && <CopyBtn value={value} />}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, cls }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-4 h-4 ${cls}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`font-display font-bold text-xl ${cls}`}>{value}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BlockExplorer() {
  const [chainStats, setChainStats] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);
  const timerRef = useRef(null);

  // Fetch real chain data
  const fetchChainData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, blocksRes] = await Promise.all([
        base44.functions.invoke('explorerApi', { path: '/explorer/stats' }),
        base44.functions.invoke('explorerApi', { path: '/explorer/blocks' }),
      ]);

      if (statsRes.data?.success) {
        setChainStats(statsRes.data.stats);
      }
      if (blocksRes.data?.success) {
        setBlocks(blocksRes.data.blocks);
      }
    } catch (error) {
      console.error('Failed to fetch chain data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChainData();
    if (live) {
      timerRef.current = setInterval(fetchChainData, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [live, fetchChainData]);

  // Derived stats
  const confirmed = blocks.length;
  const totalTransactions = chainStats?.totalTransactions || 0;
  const totalAddresses = chainStats?.totalAddresses || 0;
  const latestHeight = chainStats?.latestHeight || 0;



  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/70 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-tight">Trident Block Explorer</h1>
              <p className="text-xs text-muted-foreground">
                Real-time chain data · Block height {latestHeight}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLive(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                live ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              {live ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {live ? 'Live' : 'Paused'}
            </button>
            <Button size="sm" variant="outline" onClick={fetchChainData} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* Stat cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground ml-3">Loading chain data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Latest Block" value={latestHeight.toLocaleString()} icon={Hash} cls="text-foreground" />
            <StatCard label="Total Transactions" value={totalTransactions.toLocaleString()} icon={Activity} cls="text-primary" />
            <StatCard label="Total Addresses" value={totalAddresses.toLocaleString()} icon={Users} cls="text-accent" />
            <StatCard label="Blocks Tracked" value={confirmed.toLocaleString()} icon={CheckCircle2} cls="text-emerald-400" />
          </div>
        )}

        {/* Latest Blocks */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-semibold text-lg">Latest Blocks</h2>
            <p className="text-xs text-muted-foreground">Most recent blocks on the Trident network</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Height', 'Hash', 'Timestamp', 'Transactions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blocks.map((block, idx) => (
                  <tr key={block.hash} className="border-b border-border/40 hover:bg-muted/25 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary">{block.height.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-foreground">{shortHash(block.hash)}</span>
                        <CopyBtn value={block.hash} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{timeAgo(block.timestamp)}</td>
                    <td className="py-3 px-4 font-mono text-sm">{block.txCount}</td>
                  </tr>
                ))}
                {blocks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                      No blocks available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Trident Block Explorer · Powered by Trident Ledger
        </p>
      </div>
    </div>
  );
}