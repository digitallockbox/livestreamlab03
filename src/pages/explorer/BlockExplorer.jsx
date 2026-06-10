import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity, Flame, CheckCircle2, XCircle, Clock, Zap,
  Copy, ExternalLink, RefreshCw, Search, Wifi, WifiOff,
  ArrowRightLeft, TrendingDown, Shield, Hash, ChevronDown, X
} from 'lucide-react';
import { STREAMING_TOKEN_MINT, STREAMING_TOKEN_SYMBOL } from '@/lib/constants/tokens';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SOLSCAN_BASE = 'https://solscan.io/tx';

const shortHash = (h) => h ? `${h.slice(0, 8)}…${h.slice(-6)}` : '—';
const shortAddr  = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—';
const timeAgo    = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const randB58 = (len) => Array.from({ length: len }, () => B58[Math.floor(Math.random() * B58.length)]).join('');

const TX_TYPES   = ['transfer', 'transfer', 'transfer', 'burn', 'burn', 'validation'];
const STATUSES   = ['confirmed', 'confirmed', 'confirmed', 'confirmed', 'pending', 'failed'];
const BURN_ADDR  = 'burnAddr1111111111111111111111111111111111111';

let _id = 0;
function makeTx() {
  const type   = TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)];
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const amount = +(Math.random() * 80_000 + 50).toFixed(2);
  const burn   = type === 'burn' ? amount : +(amount * 0.015).toFixed(4);
  return {
    _key:     ++_id,
    sig:      randB58(88),
    from:     randB58(44),
    to:       type === 'burn' ? BURN_ADDR : randB58(44),
    type, status, amount, burn,
    slot:     341_200_000 + Math.floor(Math.random() * 500_000),
    fee:      +(Math.random() * 0.0025 + 0.0001).toFixed(6),
    confs:    status === 'confirmed' ? Math.floor(Math.random() * 400 + 1) : 0,
    ts:       Date.now() - Math.floor(Math.random() * 45_000),
    program:  [STREAMING_TOKEN_MINT, '11111111111111111111111111111111', 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'][Math.floor(Math.random() * 3)],
  };
}

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
const INIT_TXS = Array.from({ length: 25 }, makeTx);

export default function BlockExplorer() {
  const [txs, setTxs]           = useState(INIT_TXS);
  const [newKeys, setNewKeys]   = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [live, setLive]         = useState(true);
  const [tps, setTps]           = useState(0);
  const [typeF, setTypeF]       = useState('all');
  const [statusF, setStatusF]   = useState('all');
  const [search, setSearch]     = useState('');
  const tpsRef                  = useRef(0);
  const timerRef                = useRef(null);

  // TPS ticker
  useEffect(() => {
    const id = setInterval(() => { setTps(tpsRef.current); tpsRef.current = 0; }, 1000);
    return () => clearInterval(id);
  }, []);

  // Live feed
  const inject = useCallback((n = 1) => {
    const fresh = Array.from({ length: n }, makeTx);
    tpsRef.current += n;
    setNewKeys(new Set(fresh.map(t => t._key)));
    setTxs(prev => [...fresh, ...prev].slice(0, 300));
  }, []);

  useEffect(() => {
    if (live) { timerRef.current = setInterval(() => inject(Math.random() > 0.55 ? 2 : 1), 1700); }
    else       { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [live, inject]);

  // Derived stats
  const confirmed    = txs.filter(t => t.status === 'confirmed').length;
  const pending      = txs.filter(t => t.status === 'pending').length;
  const failed       = txs.filter(t => t.status === 'failed').length;
  const burnEvents   = txs.filter(t => t.type === 'burn').length;
  const totalBurned  = txs.filter(t => t.type === 'burn' && t.status === 'confirmed')
                          .reduce((s, t) => s + t.burn, 0);

  const filtered = txs.filter(t => {
    if (typeF   !== 'all' && t.type   !== typeF)   return false;
    if (statusF !== 'all' && t.status !== statusF) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.sig.toLowerCase().includes(q) || t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q);
    }
    return true;
  });

  const FilterBar = ({ options, active, onChange }) => (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {options.map(o => (
        <button key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${active === o ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >{o}</button>
      ))}
    </div>
  );

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
                $STREAMING settlements · Solana Devnet ·{' '}
                <span className="font-mono text-violet-400">{STREAMING_TOKEN_MINT.slice(0, 12)}…</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono font-semibold text-primary">
              <Zap className="w-3 h-3" />{tps} TPS
            </div>
            <button
              onClick={() => setLive(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                live ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              {live ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {live ? 'Live' : 'Paused'}
            </button>
            <Button size="sm" variant="outline" onClick={() => inject(1)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />Inject Tx
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Tracked" value={txs.length.toLocaleString()} icon={Hash}        cls="text-foreground" />
          <StatCard label="Confirmed"     value={confirmed}                   icon={CheckCircle2} cls="text-emerald-400" />
          <StatCard label="Pending"       value={pending}                     icon={Clock}        cls="text-yellow-400" />
          <StatCard label="Failed"        value={failed}                      icon={XCircle}      cls="text-red-400" />
          <StatCard label="Burn Events"   value={burnEvents}                  icon={Flame}        cls="text-orange-400" />
          <StatCard label="Total Burned"  value={`${totalBurned.toFixed(0)} $S`} icon={TrendingDown} cls="text-orange-400" />
        </div>

        {/* Burn ticker */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-500/10 border border-orange-500/25 rounded-xl">
          <Flame className="w-4 h-4 text-orange-400 flex-shrink-0 animate-pulse" />
          <span className="text-xs text-muted-foreground">Session Burn Total:</span>
          <span className="font-mono font-bold text-orange-400">
            {totalBurned.toLocaleString(undefined, { maximumFractionDigits: 2 })} $STREAMING
          </span>
          <span className="text-xs text-muted-foreground">across {burnEvents} burn events</span>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono text-violet-400">Mint:</span>
            <span className="font-mono">{STREAMING_TOKEN_MINT.slice(0, 16)}…</span>
            <CopyBtn value={STREAMING_TOKEN_MINT} />
          </div>
        </div>

        {/* Filters + search */}
        <div className="flex flex-wrap gap-3 items-center">
          <FilterBar options={['all','transfer','burn','validation']} active={typeF}   onChange={setTypeF} />
          <FilterBar options={['all','confirmed','pending','failed']} active={statusF} onChange={setStatusF} />
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hash / address…" className="pl-8 h-8 text-xs" />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {txs.length} txs</span>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Tx Hash','Type','Status','Amount','Burn / Confs','Slot','Age',''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.slice(0, 150).map(tx => (
                    <TxRow key={tx._key} tx={tx} isNew={newKeys.has(tx._key)} onSelect={setSelected} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">No transactions match your filters.</p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Settlements tracked on{' '}
          <a href={`https://solscan.io/token/${STREAMING_TOKEN_MINT}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Solana Devnet
          </a>
          {' '}· Mint: <span className="font-mono">{STREAMING_TOKEN_MINT}</span>
        </p>
      </div>

      <AnimatePresence>
        {selected && <TxDrawer tx={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}