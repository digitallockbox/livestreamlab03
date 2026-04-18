import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Cpu, Zap, Activity, Server, Database, Globe,
  Lock, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Radio, Users, DollarSign, TrendingUp, Eye, EyeOff,
  Terminal, ToggleLeft, ToggleRight, Download, Play, Square
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion as m } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ENGINE_NODES = [
  { id: 'trident-gateway', name: 'Trident API Gateway', status: 'online', latency: '12ms', requests: '48.2K/min', region: 'US-East' },
  { id: 'stream-ingest', name: 'Stream Ingest Engine', status: 'online', latency: '8ms', requests: '312 streams', region: 'Global' },
  { id: 'payment-bridge', name: 'Payment Bridge', status: 'online', latency: '45ms', requests: '$18.4K/hr', region: 'US-West' },
  { id: 'token-settlement', name: 'Token Settlement Engine', status: 'degraded', latency: '210ms', requests: '4.2M tkn/hr', region: 'Solana' },
  { id: 'cdn-edge', name: 'CDN Edge Network', status: 'online', latency: '3ms', requests: '2.1TB/day', region: 'Multi-region' },
  { id: 'aegis-security', name: 'Aegis Security Layer', status: 'online', latency: '1ms', requests: '100% uptime', region: 'All Nodes' },
  { id: 'vault-engine', name: 'CreatorVault Engine', status: 'online', latency: '22ms', requests: '$284K managed', region: 'US-East' },
  { id: 'overwatch-ai', name: 'Overwatch Intelligence', status: 'standby', latency: '—', requests: 'Idle', region: 'Internal' },
];

const LIVE_EVENTS = [
  { type: 'settlement', msg: 'Token settlement confirmed — 500 $STREAMING · luna_stream', time: '0s ago' },
  { type: 'stream', msg: 'New stream session started — CryptoSage · 2,431 viewers', time: '3s ago' },
  { type: 'payment', msg: 'PPV unlock processed — $19.99 · viewer_99', time: '8s ago' },
  { type: 'security', msg: 'Aegis: Auth handshake verified — node US-East-2', time: '12s ago' },
  { type: 'settlement', msg: 'Auto-split complete — Creator 70% / Platform 20% / Heirs 10%', time: '18s ago' },
  { type: 'stream', msg: 'Stream ended — DarkByte_ · peak 1,840 viewers · $890 tips', time: '34s ago' },
  { type: 'alert', msg: 'Token Settlement Engine: queue depth elevated (210ms)', time: '1m ago' },
  { type: 'payment', msg: 'Store sale — $39.99 · StreamOverlay Bundle · pixel_queen', time: '2m ago' },
];

const LATENCY_DATA = Array.from({ length: 20 }, (_, i) => ({
  t: i,
  gateway: Math.floor(Math.random() * 20 + 8),
  settlement: Math.floor(Math.random() * 100 + 150),
  ingest: Math.floor(Math.random() * 10 + 4),
}));

const FEATURE_FLAGS = [
  { id: 'token_tipping', label: 'Token Tipping', desc: 'Allow $STREAMING tips on streams', enabled: true },
  { id: 'ppv_unlocks', label: 'PPV Video Unlocks', desc: 'Pay-per-view content gating', enabled: true },
  { id: 'auto_split', label: 'Auto-Split Payouts', desc: 'Automatic team revenue splitting', enabled: true },
  { id: 'overwatch_ai', label: 'Overwatch AI', desc: 'Real-time engagement intelligence', enabled: false },
  { id: 'onchain_settle', label: 'On-Chain Settlement', desc: 'Solana mainnet token settlements', enabled: false },
  { id: 'dao_voting', label: 'DAO Governance', desc: 'Creator governance voting layer', enabled: false },
];

const TABS = ['Node Status', 'Live Events', 'Latency Monitor', 'Feature Flags'];

export default function TridentAdmin() {
  const [activeTab, setActiveTab] = useState('Node Status');
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [events, setEvents] = useState(LIVE_EVENTS);
  const [latencyData, setLatencyData] = useState(LATENCY_DATA);
  const [liveMonitor, setLiveMonitor] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [authError, setAuthError] = useState('');

  // Simulate live event ticker
  useEffect(() => {
    if (!liveMonitor) return;
    const NEW_EVENTS = [
      'Token settlement confirmed — 250 $STREAMING · cyber_rex',
      'Stream tip received — $50 USD · stream_junkie',
      'Affiliate conversion — $125.50 · neon_wolf',
      'Aegis: Suspicious login blocked — IP 45.12.xx.xx',
      'Vault payout queued — $4,200 · cycle March 2026',
      'CDN cache cleared — US-East edge nodes',
    ];
    const interval = setInterval(() => {
      const types = ['settlement', 'stream', 'payment', 'security', 'alert'];
      const newEvent = {
        type: types[Math.floor(Math.random() * types.length)],
        msg: NEW_EVENTS[Math.floor(Math.random() * NEW_EVENTS.length)],
        time: 'just now',
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
    }, 3500);
    return () => clearInterval(interval);
  }, [liveMonitor]);

  // Simulate latency updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyData(prev => [
        ...prev.slice(1),
        {
          t: prev[prev.length - 1].t + 1,
          gateway: Math.floor(Math.random() * 20 + 8),
          settlement: Math.floor(Math.random() * 100 + 150),
          ingest: Math.floor(Math.random() * 10 + 4),
        }
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleFlag = (id) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleAuth = (e) => {
    e.preventDefault();
    if (adminKey === 'TRIDENT-ADMIN' || adminKey === 'trident') {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Trident admin key. Try: TRIDENT-ADMIN');
    }
  };

  const statusColor = (s) => {
    if (s === 'online') return 'text-accent';
    if (s === 'degraded') return 'text-yellow-400';
    if (s === 'standby') return 'text-muted-foreground';
    return 'text-destructive';
  };

  const statusDot = (s) => {
    if (s === 'online') return 'bg-accent animate-pulse';
    if (s === 'degraded') return 'bg-yellow-400';
    if (s === 'standby') return 'bg-border';
    return 'bg-destructive';
  };

  const eventColor = (type) => {
    if (type === 'alert') return 'text-yellow-400';
    if (type === 'security') return 'text-primary';
    if (type === 'settlement') return 'text-accent';
    if (type === 'stream') return 'text-red-400';
    return 'text-muted-foreground';
  };

  // Auth Gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative bg-card border border-border rounded-2xl p-8 space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Trident Admin</h1>
                <p className="text-muted-foreground text-sm mt-1">Enter your admin key to access the Trident OS console.</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs gap-1">
                <Cpu className="w-3 h-3" /> Trident OS — Restricted Zone
              </Badge>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <div className="relative">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={adminKey}
                    onChange={e => setAdminKey(e.target.value)}
                    placeholder="Enter admin key..."
                    className="bg-secondary border-border h-11 font-mono pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authError && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> {authError}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 gap-2 font-semibold">
                <Lock className="w-4 h-4" /> Authenticate
              </Button>
            </form>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
              <Lock className="w-3 h-3" />
              <span>AES-256 encrypted · Trident OS v2.4.1</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Trident Admin Topbar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-sm">Trident OS Admin</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
                <span className="text-xs text-muted-foreground font-mono">All systems nominal</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-accent/10 text-accent border-accent/20 font-mono text-xs gap-1">
              <Cpu className="w-3 h-3" /> v2.4.1
            </Badge>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Download className="w-3.5 h-3.5" /> Export Logs
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAuthenticated(false)} className="text-muted-foreground text-xs gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Lock
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* System Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Nodes Online', value: `${ENGINE_NODES.filter(n => n.status === 'online').length}/${ENGINE_NODES.length}`, icon: Server, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Live Streams', value: '342', icon: Radio, color: 'text-red-400', bg: 'bg-red-400/10' },
            { label: 'Token Volume/hr', value: '4.2M', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Active Creators', value: '14,829', icon: Users, color: 'text-chart-4', bg: 'bg-chart-4/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="font-display font-bold text-xl text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* NODE STATUS */}
        {activeTab === 'Node Status' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-4">
            {ENGINE_NODES.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border bg-card p-5 ${node.status === 'degraded' ? 'border-yellow-400/30' : node.status === 'offline' ? 'border-destructive/30' : 'border-border'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${statusDot(node.status)}`} />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{node.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.region}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs capitalize ${
                    node.status === 'online' ? 'bg-accent/10 text-accent border-accent/20' :
                    node.status === 'degraded' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                    node.status === 'standby' ? 'bg-muted text-muted-foreground' :
                    'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                    {node.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-secondary rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">Latency</p>
                    <p className={`text-sm font-bold mt-0.5 ${statusColor(node.status)}`}>{node.latency}</p>
                  </div>
                  <div className="bg-secondary rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">Throughput</p>
                    <p className="text-sm font-bold mt-0.5 text-foreground">{node.requests}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* LIVE EVENTS */}
        {activeTab === 'Live Events' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Live Event Stream</span>
                <Badge className="bg-red-400/10 text-red-400 border-red-400/20 text-xs">LIVE</Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLiveMonitor(!liveMonitor)}
                className="gap-2 text-xs"
              >
                {liveMonitor ? <><Square className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Resume</>}
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2 border-b border-border flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">trident-os :: event-log</span>
              </div>
              <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto">
                {events.map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/20 transition-colors"
                  >
                    <span className="font-mono text-xs text-muted-foreground w-16 flex-shrink-0 pt-0.5">{ev.time}</span>
                    <span className={`text-xs font-mono uppercase tracking-wider w-20 flex-shrink-0 pt-0.5 ${eventColor(ev.type)}`}>[{ev.type}]</span>
                    <span className="text-xs text-foreground font-mono">{ev.msg}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* LATENCY MONITOR */}
        {activeTab === 'Latency Monitor' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-1">Real-Time Node Latency</h2>
              <p className="text-xs text-muted-foreground mb-5">Live rolling window — updates every 2s</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}ms`} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={v => [`${v}ms`, '']} />
                  <Line type="monotone" dataKey="gateway" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Gateway" />
                  <Line type="monotone" dataKey="settlement" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Settlement" />
                  <Line type="monotone" dataKey="ingest" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Ingest" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded inline-block" /> Gateway</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-yellow-400 rounded inline-block" /> Settlement</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent rounded inline-block" /> Ingest</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { node: 'API Gateway', current: '12ms', avg: '11ms', p99: '28ms', status: 'healthy' },
                { node: 'Token Settlement', current: '210ms', avg: '198ms', p99: '380ms', status: 'degraded' },
                { node: 'Stream Ingest', current: '8ms', avg: '7ms', p99: '18ms', status: 'healthy' },
              ].map(n => (
                <div key={n.node} className={`rounded-xl border bg-card p-5 ${n.status === 'degraded' ? 'border-yellow-400/30' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">{n.node}</p>
                    <Badge className={n.status === 'healthy' ? 'bg-accent/10 text-accent border-accent/20 text-xs' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs'}>
                      {n.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className="font-bold text-foreground">{n.current}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg (1hr)</span><span className="text-foreground">{n.avg}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">p99</span><span className="text-foreground">{n.p99}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FEATURE FLAGS */}
        {activeTab === 'Feature Flags' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-semibold text-foreground">Feature Flag Control</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle platform features in real-time — changes apply instantly.</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                {flags.filter(f => f.enabled).length}/{flags.length} enabled
              </Badge>
            </div>

            <div className="rounded-xl border border-border bg-card divide-y divide-border/50 overflow-hidden">
              {flags.map((flag, i) => (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${flag.enabled ? 'bg-accent' : 'bg-border'}`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{flag.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{flag.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${flag.enabled ? 'text-accent' : 'text-muted-foreground'}`}>
                      {flag.enabled ? 'ON' : 'OFF'}
                    </span>
                    <button
                      onClick={() => toggleFlag(flag.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${flag.enabled ? 'bg-primary' : 'bg-secondary border border-border'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">Caution</p>
                <p className="text-xs text-muted-foreground mt-1">Toggling production flags affects all active users immediately. On-Chain Settlement and DAO Governance are pending mainnet deployment.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}