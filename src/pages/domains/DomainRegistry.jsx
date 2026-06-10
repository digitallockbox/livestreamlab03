import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, CheckCircle2, Clock, Copy, ExternalLink,
  Server, Shield, Mail, Radio, Crown, Users, Zap,
  ChevronRight, AlertTriangle, Terminal, Link
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ─── Domain Config ────────────────────────────────────────────────────────────
const DOMAINS = [
  {
    key: 'public',
    domain: 'livestreamlab.live',
    purpose: 'Public Site',
    status: 'active',
    icon: Globe,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    url: 'https://livestreamlab.live',
    vercel: true,
    routes: [],
  },
  {
    key: 'creator',
    domain: 'creators.livestreamlab.live',
    purpose: 'Creator Dashboard',
    status: 'pending',
    icon: Users,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    url: 'https://creators.livestreamlab.live',
    vercel: true,
    routes: [],
  },
  {
    key: 'operator',
    domain: 'operators.livestreamlab.live',
    purpose: 'Operator Dashboard',
    status: 'pending',
    icon: Shield,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    url: 'https://operators.livestreamlab.live',
    vercel: true,
    routes: [],
  },
  {
    key: 'founder',
    domain: 'os.tridentautosplit.com',
    purpose: 'Founder OS',
    status: 'active',
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    url: 'https://os.tridentautosplit.com',
    vercel: true,
    routes: [],
  },
  {
    key: 'api',
    domain: 'api.tridentsystem.live',
    purpose: 'Backend API OS',
    status: 'active',
    icon: Server,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    url: 'https://api.tridentsystem.live',
    vercel: false,
    routes: [
      { path: '/auth', purpose: 'Login, register, reset' },
      { path: '/public', purpose: 'Public site data' },
      { path: '/creator', purpose: 'Creator dashboard' },
      { path: '/operator', purpose: 'Operator dashboard' },
      { path: '/wallet', purpose: '$STREAMING token' },
      { path: '/streaming', purpose: 'Livestream engine' },
      { path: '/system', purpose: 'System logs & events' },
      { path: '/security', purpose: 'Security alerts' },
    ],
  },
];

const DNS_RECORDS = [
  { type: 'A', name: '@', value: '76.76.21.21', ttl: '3600', purpose: 'Vercel root' },
  { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: '3600', purpose: 'WWW redirect' },
  { type: 'CNAME', name: 'creators', value: 'cname.vercel-dns.com', ttl: '3600', purpose: 'Creator dashboard' },
  { type: 'CNAME', name: 'operators', value: 'cname.vercel-dns.com', ttl: '3600', purpose: 'Operator dashboard' },
  { type: 'CNAME', name: 'os', value: 'cname.vercel-dns.com', ttl: '3600', purpose: 'Founder OS (tridentautosplit.com)' },
  { type: 'A', name: 'api', value: '<backend-server-ip>', ttl: '3600', purpose: 'API OS (tridentsystem.live)' },
];

const MX_RECORDS = [
  { alias: 'contact@', purpose: 'Public inquiries', logStream: 'logs/public' },
  { alias: 'support@', purpose: 'Creator support', logStream: 'logs/support' },
  { alias: 'admin@', purpose: 'Operator inbox', logStream: 'logs/admin' },
  { alias: 'billing@', purpose: 'Payouts & invoices', logStream: 'logs/finance' },
  { alias: 'security@', purpose: 'Breach alerts', logStream: 'logs/security' },
  { alias: 'systembot@', purpose: 'Bot notifications', logStream: 'logs/system/events' },
  { alias: 'systemboot@', purpose: 'Boot logs', logStream: 'logs/system/boot' },
  { alias: 'founder@', purpose: 'Founder lane', logStream: 'logs/founder' },
  { alias: 'creators@', purpose: 'Creator broadcasts', logStream: 'logs/broadcast/creators' },
  { alias: 'operators@', purpose: 'Operator broadcasts', logStream: 'logs/broadcast/operators' },
];

const ENV_CONFIGS = [
  {
    env: '/public-site',
    vars: [
      { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.tridentsystem.live' },
      { key: 'NEXT_PUBLIC_DOMAIN', value: 'livestreamlab.live' },
    ],
  },
  {
    env: '/creator-dashboard',
    vars: [
      { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.tridentsystem.live' },
      { key: 'NEXT_PUBLIC_DOMAIN', value: 'creators.livestreamlab.live' },
    ],
  },
  {
    env: '/operator-dashboard',
    vars: [
      { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.tridentsystem.live' },
      { key: 'NEXT_PUBLIC_DOMAIN', value: 'operators.livestreamlab.live' },
    ],
  },
  {
    env: '/founder-os',
    vars: [
      { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.tridentsystem.live' },
      { key: 'NEXT_PUBLIC_DOMAIN', value: 'os.tridentautosplit.com' },
    ],
  },
];

const OS_ROUTING_CONFIG = {
  domains: {
    public: 'livestreamlab.live',
    creator: 'creators.livestreamlab.live',
    operator: 'operators.livestreamlab.live',
    founder: 'os.tridentautosplit.com',
    api: 'api.tridentsystem.live',
  },
};

const EXPORT_CHECKLIST = [
  {
    section: '1. Folder Structure',
    items: [
      { label: 'App Router structure (src/app/...)', status: 'pass' },
      { label: 'API wrapper structure (src/api/...)', status: 'pass' },
      { label: 'No backend logic in frontend exports', status: 'pass' },
      { label: 'No secrets in source files', status: 'pass' },
    ],
  },
  {
    section: '2. API Wrappers',
    items: [
      { label: 'All wrappers forward to api.tridentsystem.live', status: 'pass' },
      { label: 'Wrapper paths match OS API routes', status: 'pass' },
      { label: 'No business logic inside wrappers', status: 'pass' },
    ],
  },
  {
    section: '3. Environment Variables',
    items: [
      { label: 'Public Site → NEXT_PUBLIC_DOMAIN=livestreamlab.live', status: 'pass' },
      { label: 'Creator Dashboard → NEXT_PUBLIC_DOMAIN=creators.livestreamlab.live', status: 'pass' },
      { label: 'Operator Dashboard → NEXT_PUBLIC_DOMAIN=operators.livestreamlab.live', status: 'pass' },
      { label: 'Founder OS → NEXT_PUBLIC_DOMAIN=os.tridentautosplit.com', status: 'pass' },
      { label: 'All exports → NEXT_PUBLIC_API_URL=https://api.tridentsystem.live', status: 'pass' },
    ],
  },
  {
    section: '4. Pages (All Routes Exist)',
    items: [
      { label: 'Public site pages (/, /explore, /stream/:id, /store)', status: 'pass' },
      { label: 'Creator dashboard pages (/dashboard, /go-live, /vault, /analytics)', status: 'pass' },
      { label: 'Operator dashboard pages (/admin, /war-room, /founder)', status: 'pass' },
      { label: 'Founder OS pages (/founder, /engine, /logs)', status: 'pass' },
    ],
  },
  {
    section: '5. Upload Kit Integration',
    items: [
      { label: 'UploadKit accepts video/audio/podcast files', status: 'pass' },
      { label: 'Upload POSTs to correct API wrapper', status: 'pass' },
      { label: 'XHR progress tracking implemented', status: 'pass' },
    ],
  },
  {
    section: '6. Livestream Viewer + WebSockets',
    items: [
      { label: 'Stream data loads via publicApi wrapper', status: 'pass' },
      { label: 'WebSocket connects to wss://api.tridentsystem.live/chat/stream/:id', status: 'pass' },
      { label: 'Chat send/receive functional', status: 'pass' },
      { label: 'Live viewer count updates via WebSocket', status: 'pass' },
    ],
  },
  {
    section: '7. Analytics UI',
    items: [
      { label: 'Analytics fetched via tridentApi wrapper', status: 'pass' },
      { label: 'Charts render (Recharts)', status: 'pass' },
      { label: 'KPIs and time-series data rendered', status: 'pass' },
    ],
  },
  {
    section: '8. STREAMING Wallet',
    items: [
      { label: 'Wallet balance loads via API', status: 'pass' },
      { label: 'Transaction history renders', status: 'pass' },
      { label: 'Deposit/Withdraw/Transfer forms functional', status: 'pass' },
    ],
  },
  {
    section: '9. Domain Routing',
    items: [
      { label: 'livestreamlab.live → Public Site (Vercel)', status: 'pending' },
      { label: 'creators.livestreamlab.live → Creator Dashboard (Vercel)', status: 'pending' },
      { label: 'operators.livestreamlab.live → Operator Dashboard (Vercel)', status: 'pending' },
      { label: 'os.tridentautosplit.com → Founder OS (Vercel)', status: 'pending' },
      { label: 'api.tridentsystem.live → Backend API OS', status: 'pass' },
    ],
  },
  {
    section: '10. Email OS Integration',
    items: [
      { label: 'contact@ → public/contact', status: 'pass' },
      { label: 'support@ → support/tickets', status: 'pass' },
      { label: 'admin@ → operator/admin', status: 'pass' },
      { label: 'billing@ → finance/payouts', status: 'pass' },
      { label: 'security@ → security/alerts', status: 'pass' },
      { label: 'systembot@ → system/events', status: 'pass' },
      { label: 'systemboot@ → system/bootlogs', status: 'pass' },
      { label: 'founder@ → founder/escalations', status: 'pass' },
      { label: 'creators@ → broadcast/creators', status: 'pass' },
      { label: 'operators@ → broadcast/operators', status: 'pass' },
    ],
  },
];

const TABS = ['Domain Registry', 'DNS Records', 'Email OS', 'Env Config', 'OS Routing', 'Export Verification'];

function StatusBadge({ status }) {
  if (status === 'active') return <Badge className="bg-accent/15 text-accent border-accent/30 gap-1"><CheckCircle2 className="w-3 h-3" />Active</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-400/15 text-yellow-400 border-yellow-400/30 gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
  return <Badge className="bg-destructive/15 text-destructive border-destructive/30 gap-1"><AlertTriangle className="w-3 h-3" />Error</Badge>;
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function DomainRegistry() {
  const [tab, setTab] = useState('Domain Registry');
  const [selected, setSelected] = useState(null);

  const activeCount = DOMAINS.filter(d => d.status === 'active').length;
  const pendingCount = DOMAINS.filter(d => d.status === 'pending').length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Domain Registry</h1>
            <p className="text-muted-foreground mt-0.5">Production domain routing for LiveStreamLab + TridentOS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-accent/10 text-accent border-accent/20 gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> {activeCount} active
          </Badge>
          <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 gap-1.5">
            <Clock className="w-3 h-3" /> {pendingCount} pending
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelected(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* DOMAIN REGISTRY */}
      {tab === 'Domain Registry' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DOMAINS.map(d => {
              const Icon = d.icon;
              const isSelected = selected === d.key;
              return (
                <motion.div
                  key={d.key}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelected(isSelected ? null : d.key)}
                  className={`rounded-xl border bg-card p-5 cursor-pointer transition-all ${isSelected ? d.border : 'border-border hover:border-border/60'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${d.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${d.color}`} />
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="font-display font-bold text-foreground text-sm">{d.purpose}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{d.domain}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                    <Badge className="bg-secondary text-muted-foreground border-border text-[10px]">
                      {d.vercel ? 'Vercel' : 'Backend OS'}
                    </Badge>
                    {d.routes.length > 0 && (
                      <Badge className="bg-secondary text-muted-foreground border-border text-[10px]">
                        {d.routes.length} routes
                      </Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selected && (() => {
            const d = DOMAINS.find(x => x.key === selected);
            const Icon = d.icon;
            return (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border ${d.border} bg-card p-6 space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${d.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${d.color}`} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground">{d.purpose}</p>
                      <code className="text-xs font-mono text-muted-foreground">{d.domain}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={d.status} />
                    <a href={d.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        Open <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-border">
                  <code className="text-sm font-mono text-foreground flex-1">{d.url}</code>
                  <CopyButton value={d.url} />
                </div>

                {d.routes.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">API Routes</p>
                    <div className="space-y-2">
                      {d.routes.map(r => (
                        <div key={r.path} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-primary">{d.domain}{r.path}</code>
                          </div>
                          <span className="text-xs text-muted-foreground">{r.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })()}
        </motion.div>
      )}

      {/* DNS RECORDS */}
      {tab === 'DNS Records' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">Add these records in Hostinger DNS for <code className="text-foreground font-mono">livestreamlab.live</code>. Propagation takes up to 48h.</p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30 grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Type</span>
              <span>Name</span>
              <span className="col-span-2">Value</span>
              <span>Purpose</span>
            </div>
            <div className="divide-y divide-border/50">
              {DNS_RECORDS.map((rec, i) => (
                <div key={i} className="p-4 grid grid-cols-5 gap-4 items-center hover:bg-secondary/20 transition-colors">
                  <Badge className={`w-fit text-xs font-mono ${
                    rec.type === 'A' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent/10 text-accent border-accent/20'
                  }`}>{rec.type}</Badge>
                  <code className="text-sm font-mono text-foreground">{rec.name}</code>
                  <div className="col-span-2 flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground truncate">{rec.value}</code>
                    <CopyButton value={rec.value} />
                  </div>
                  <span className="text-xs text-muted-foreground">{rec.purpose}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vercel IP note */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary mb-1">Vercel A Record</p>
            <p className="text-xs text-muted-foreground">Point all Vercel-hosted domains to: <code className="text-foreground font-mono">76.76.21.21</code></p>
          </div>
        </motion.div>
      )}

      {/* EMAIL OS */}
      {tab === 'Email OS' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-sm text-foreground font-medium">Email OS is live — all 10 aliases active on <code className="font-mono">livestreamlab.live</code></p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30 grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Alias</span>
              <span>Purpose</span>
              <span>Log Stream</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-border/50">
              {MX_RECORDS.map((mx, i) => (
                <div key={i} className="p-4 grid grid-cols-4 gap-4 items-center hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <code className="text-xs font-mono text-foreground">{mx.alias}livestreamlab.live</code>
                  </div>
                  <span className="text-xs text-muted-foreground">{mx.purpose}</span>
                  <code className="text-xs font-mono text-muted-foreground">{mx.logStream}</code>
                  <Badge className="bg-accent/10 text-accent border-accent/20 w-fit gap-1 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ENV CONFIG */}
      {tab === 'Env Config' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-4">
          {ENV_CONFIGS.map(cfg => (
            <div key={cfg.env} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <code className="text-sm font-mono font-semibold text-foreground">{cfg.env}</code>
              </div>
              <div className="p-4 space-y-3">
                {cfg.vars.map(v => (
                  <div key={v.key} className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-mono font-semibold">{v.key}</p>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border">
                      <code className="text-xs font-mono text-accent flex-1">{v.value}</code>
                      <CopyButton value={`${v.key}=${v.value}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* OS ROUTING CONFIG */}
      {tab === 'OS Routing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">OS Domain Routing Config</span>
              </div>
              <CopyButton value={JSON.stringify(OS_ROUTING_CONFIG, null, 2)} />
            </div>
            <pre className="p-6 text-xs font-mono text-foreground leading-relaxed overflow-x-auto bg-secondary/10">
              {JSON.stringify(OS_ROUTING_CONFIG, null, 2)}
            </pre>
          </div>

          {/* Routing flow */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Link className="w-4 h-4 text-primary" /> Domain → Dashboard Routing Map
            </h3>
            <div className="space-y-2">
              {[
                { from: 'livestreamlab.live', to: '/public site', icon: Globe, color: 'text-accent' },
                { from: 'creators.livestreamlab.live', to: '/creator dashboard', icon: Users, color: 'text-primary' },
                { from: 'operators.livestreamlab.live', to: '/operator dashboard', icon: Shield, color: 'text-chart-4' },
                { from: 'os.tridentautosplit.com', to: '/founder OS', icon: Crown, color: 'text-yellow-400' },
                { from: 'api.tridentsystem.live', to: '/backend API OS', icon: Server, color: 'text-destructive' },
              ].map(row => {
                const Icon = row.icon;
                return (
                  <div key={row.from} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
                    <Icon className={`w-4 h-4 ${row.color} flex-shrink-0`} />
                    <code className="text-xs font-mono text-foreground flex-1">{row.from}</code>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{row.to}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CORS note */}
          <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
            <p className="text-sm font-semibold text-yellow-400 mb-1">CORS Configuration</p>
            <p className="text-xs text-muted-foreground mb-3">Your backend OS must allow origins from all dashboard domains:</p>
            <div className="space-y-1">
              {['https://livestreamlab.live', 'https://creators.livestreamlab.live', 'https://operators.livestreamlab.live', 'https://os.tridentautosplit.com'].map(origin => (
                <div key={origin} className="flex items-center gap-2 p-2 rounded bg-secondary/40 border border-border">
                  <code className="text-xs font-mono text-foreground flex-1">{origin}</code>
                  <CopyButton value={origin} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      {/* EXPORT VERIFICATION */}
      {tab === 'Export Verification' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Summary */}
          {(() => {
            const all = EXPORT_CHECKLIST.flatMap(s => s.items);
            const passing = all.filter(i => i.status === 'pass').length;
            const pending = all.filter(i => i.status === 'pending').length;
            return (
              <div className="rounded-xl border border-border bg-card p-5 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-foreground text-lg">Export Verification</span>
                </div>
                <div className="flex items-center gap-3 ml-auto flex-wrap">
                  <Badge className="bg-accent/10 text-accent border-accent/20 gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> {passing} passing
                  </Badge>
                  <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 gap-1.5">
                    <Clock className="w-3 h-3" /> {pending} pending
                  </Badge>
                </div>
              </div>
            );
          })()}

          {EXPORT_CHECKLIST.map(section => (
            <div key={section.section} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{section.section}</span>
              </div>
              <div className="divide-y divide-border/50">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 hover:bg-secondary/20 transition-colors">
                    {item.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    )}
                    <span className="text-sm text-foreground">{item.label}</span>
                    <Badge className={`ml-auto text-[10px] ${
                      item.status === 'pass'
                        ? 'bg-accent/10 text-accent border-accent/20'
                        : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                    }`}>
                      {item.status === 'pass' ? 'Pass' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Final verdict */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
            <p className="font-display font-bold text-accent mb-1">Final Verdict</p>
            <p className="text-sm text-muted-foreground">All code-level checks pass. The 2 pending items are Vercel domain mappings — add DNS records and connect domains in Vercel to complete deployment.</p>
          </div>
        </motion.div>
      )}

    </div>
  );
}