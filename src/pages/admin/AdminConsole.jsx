import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, ShieldCheck, Zap, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Search, MoreHorizontal, Ban, Eye, RefreshCw, Download,
  Radio, ShoppingBag, DollarSign, Activity, Server, Database,
  ChevronRight, Clock, Filter, Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const PLATFORM_STATS = [
  { label: 'Total Creators', value: '14,829', change: '+248 this week', up: true, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Active Streams', value: '342', change: 'Live right now', up: true, icon: Radio, color: 'text-red-400', bg: 'bg-red-400/10' },
  { label: 'Platform Revenue', value: '$284,120', change: '+18% this month', up: true, icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
  { label: 'Pending Flags', value: '7', change: '2 critical', up: false, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
];

const REVENUE_CHART = [
  { day: 'Mon', revenue: 18400, creators: 210 },
  { day: 'Tue', revenue: 22100, creators: 234 },
  { day: 'Wed', revenue: 19800, creators: 198 },
  { day: 'Thu', revenue: 27600, creators: 287 },
  { day: 'Fri', revenue: 31200, creators: 312 },
  { day: 'Sat', revenue: 38900, creators: 356 },
  { day: 'Sun', revenue: 35100, creators: 328 },
];

const CREATOR_TABLE = [
  { id: 'CR-001', name: 'Alex Rivera', email: 'alex@creator.io', status: 'active', revenue: '$12,400', streams: 48, joined: 'Jan 2026', flag: null },
  { id: 'CR-002', name: 'Luna Storm', email: 'luna@streamlab.io', status: 'active', revenue: '$9,820', streams: 36, joined: 'Feb 2026', flag: null },
  { id: 'CR-003', name: 'NeonWolf99', email: 'neon@wolf.tv', status: 'flagged', revenue: '$4,100', streams: 12, joined: 'Mar 2026', flag: 'TOS Violation' },
  { id: 'CR-004', name: 'DarkByte_', email: 'dark@byte.live', status: 'active', revenue: '$7,650', streams: 29, joined: 'Jan 2026', flag: null },
  { id: 'CR-005', name: 'Pixel Queen', email: 'pixel@queen.me', status: 'suspended', revenue: '$2,900', streams: 8, joined: 'Mar 2026', flag: 'Payment Dispute' },
  { id: 'CR-006', name: 'CryptoSage', email: 'sage@crypto.live', status: 'active', revenue: '$18,200', streams: 67, joined: 'Dec 2025', flag: null },
  { id: 'CR-007', name: 'StreamKing', email: 'king@stream.gg', status: 'active', revenue: '$11,340', streams: 52, joined: 'Jan 2026', flag: null },
];

const SYSTEM_SERVICES = [
  { name: 'Trident API Gateway', status: 'operational', latency: '12ms', uptime: '99.98%' },
  { name: 'Stream Ingest Node', status: 'operational', latency: '8ms', uptime: '99.95%' },
  { name: 'Payment Processor', status: 'operational', latency: '45ms', uptime: '100%' },
  { name: 'Token Settlement Engine', status: 'degraded', latency: '210ms', uptime: '97.2%' },
  { name: 'CDN Edge Network', status: 'operational', latency: '3ms', uptime: '99.99%' },
  { name: 'Database Cluster', status: 'operational', latency: '6ms', uptime: '100%' },
];

const RECENT_FLAGS = [
  { id: 'F-001', creator: 'NeonWolf99', type: 'TOS Violation', severity: 'high', time: '2h ago', resolved: false },
  { id: 'F-002', creator: 'TempUser_4482', type: 'Spam Activity', severity: 'medium', time: '5h ago', resolved: false },
  { id: 'F-003', creator: 'Pixel Queen', type: 'Payment Dispute', severity: 'high', time: '1d ago', resolved: false },
  { id: 'F-004', creator: 'CyberRex', type: 'Fake Viewers', severity: 'low', time: '2d ago', resolved: true },
  { id: 'F-005', creator: 'AnonCast', type: 'DMCA Report', severity: 'medium', time: '3d ago', resolved: true },
];

const TABS = ['Overview', 'Creators', 'System Health', 'Flags & Moderation'];

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCreators = CREATOR_TABLE.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status) => {
    if (status === 'active') return <Badge className="bg-accent/15 text-accent border-accent/30">Active</Badge>;
    if (status === 'flagged') return <Badge className="bg-yellow-400/15 text-yellow-400 border-yellow-400/30">Flagged</Badge>;
    if (status === 'suspended') return <Badge className="bg-destructive/15 text-destructive border-destructive/30">Suspended</Badge>;
  };

  const severityBadge = (sev) => {
    if (sev === 'high') return <Badge className="bg-red-500/15 text-red-400 border-red-400/30">High</Badge>;
    if (sev === 'medium') return <Badge className="bg-yellow-400/15 text-yellow-400 border-yellow-400/30">Medium</Badge>;
    return <Badge className="bg-muted text-muted-foreground">Low</Badge>;
  };

  const serviceColor = (status) => {
    if (status === 'operational') return 'text-accent';
    if (status === 'degraded') return 'text-yellow-400';
    return 'text-destructive';
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Console</h1>
          <p className="text-muted-foreground mt-1">Platform-wide oversight, creator management & system health.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/email-os">
            <Button variant="outline" size="sm" className="gap-2">
              <Mail className="w-4 h-4" /> Email OS
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button size="sm" className="bg-primary gap-2">
            <RefreshCw className="w-4 h-4" /> Sync Data
          </Button>
        </div>
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

      {/* OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLATFORM_STATS.map(({ label, value, change, up, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                <p className={`text-xs mt-1 ${up ? 'text-accent' : 'text-yellow-400'}`}>{change}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-foreground">Platform Revenue — 7 Days</h2>
              <Badge className="bg-accent/10 text-accent border-accent/20">This Week</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REVENUE_CHART}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Creator Signups Bar */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Daily Active Creators</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={REVENUE_CHART}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="creators" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Flags Summary */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground">Open Flags</h2>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('Flags & Moderation')} className="text-primary text-xs">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {RECENT_FLAGS.filter(f => !f.resolved).map(flag => (
                <div key={flag.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{flag.creator}</p>
                      <p className="text-xs text-muted-foreground">{flag.type} · {flag.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {severityBadge(flag.severity)}
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* CREATORS TAB */}
      {activeTab === 'Creators' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creators..." className="pl-9 bg-secondary border-border" />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'flagged', 'suspended'].map(f => (
                <Button key={f} size="sm" variant={statusFilter === f ? 'default' : 'outline'} onClick={() => setStatusFilter(f)} className="capitalize text-xs">
                  {f}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Creator</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Streams</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Flag</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredCreators.map(creator => (
                    <tr key={creator.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {creator.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{creator.name}</p>
                            <p className="text-xs text-muted-foreground">{creator.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{statusBadge(creator.status)}</td>
                      <td className="p-4 text-accent font-semibold">{creator.revenue}</td>
                      <td className="p-4 text-foreground">{creator.streams}</td>
                      <td className="p-4 text-muted-foreground">{creator.joined}</td>
                      <td className="p-4">
                        {creator.flag ? (
                          <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/30 text-xs">{creator.flag}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-yellow-400"><AlertTriangle className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive"><Ban className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {filteredCreators.length} of {CREATOR_TABLE.length} creators</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* SYSTEM HEALTH TAB */}
      {activeTab === 'System Health' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_SERVICES.map(service => (
              <div key={service.name} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${service.status === 'operational' ? 'bg-accent' : service.status === 'degraded' ? 'bg-yellow-400' : 'bg-destructive'} ${service.status !== 'operational' ? '' : 'animate-pulse'}`} />
                  <div>
                    <p className="font-medium text-foreground text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Latency: {service.latency} · Uptime: {service.uptime}</p>
                  </div>
                </div>
                <Badge className={`${service.status === 'operational' ? 'bg-accent/15 text-accent border-accent/30' : service.status === 'degraded' ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30' : 'bg-destructive/15 text-destructive border-destructive/30'} capitalize`}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Server Metrics */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" /> Server Load (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={[
                { day: 'Mon', cpu: 42, memory: 61 }, { day: 'Tue', cpu: 55, memory: 68 },
                { day: 'Wed', cpu: 38, memory: 59 }, { day: 'Thu', cpu: 71, memory: 74 },
                { day: 'Fri', cpu: 66, memory: 72 }, { day: 'Sat', cpu: 48, memory: 65 },
                { day: 'Sun', cpu: 52, memory: 70 },
              ]}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#cpuGrad)" name="CPU" />
                <Area type="monotone" dataKey="memory" stroke="hsl(var(--chart-3))" strokeWidth={2} fill="url(#memGrad)" name="Memory" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-primary rounded inline-block" /> CPU Load</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-yellow-400 rounded inline-block" /> Memory Usage</span>
            </div>
          </div>

          {/* Incident Log */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" /> Recent Incidents
            </h2>
            <div className="space-y-3">
              {[
                { msg: 'Token Settlement Engine degraded — high queue depth', time: '1h ago', resolved: false },
                { msg: 'Stream Ingest latency spike on Node US-East-2', time: '6h ago', resolved: true },
                { msg: 'Scheduled maintenance: Database cluster patched', time: '2d ago', resolved: true },
              ].map((inc, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
                  {inc.resolved
                    ? <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    : <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  }
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{inc.msg}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.time}</p>
                  </div>
                  <Badge className={inc.resolved ? 'bg-accent/10 text-accent border-accent/20' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'}>
                    {inc.resolved ? 'Resolved' : 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* FLAGS TAB */}
      {activeTab === 'Flags & Moderation' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Open Flags', value: '7', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'High Severity', value: '2', color: 'text-destructive', bg: 'bg-destructive/10' },
              { label: 'Resolved (30d)', value: '48', color: 'text-accent', bg: 'bg-accent/10' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
                <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">All Moderation Flags</span>
            </div>
            <div className="divide-y divide-border/50">
              {RECENT_FLAGS.map(flag => (
                <div key={flag.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${flag.resolved ? 'bg-accent' : flag.severity === 'high' ? 'bg-destructive' : 'bg-yellow-400'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{flag.creator}</p>
                        {severityBadge(flag.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{flag.type} · {flag.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {flag.resolved
                      ? <Badge className="bg-accent/10 text-accent border-accent/20">Resolved</Badge>
                      : <>
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1"><Eye className="w-3 h-3" /> Review</Button>
                          <Button size="sm" className="text-xs h-7 bg-destructive hover:bg-destructive/90 gap-1"><Ban className="w-3 h-3" /> Suspend</Button>
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-accent gap-1"><CheckCircle2 className="w-3 h-3" /> Dismiss</Button>
                        </>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}