import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Users, TrendingUp, Zap, Globe, BarChart3,
  ShieldCheck, Layers, ArrowUpRight, Download, RefreshCw,
  Crown, Target, Rocket, Radio, Lock, ChevronRight, Activity, Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const FOUNDER_KPIS = [
  { label: 'Total ARR', value: '$3.41M', change: '+38% YoY', up: true, icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
  { label: 'Creator Network', value: '14,829', change: '+248 this week', up: true, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { label: '$STREAMING Circulating', value: '182.4M', change: '+12M this month', up: true, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { label: 'Platform Take Rate', value: '8.4%', change: 'Net margin 31%', up: true, icon: Target, color: 'text-chart-4', bg: 'bg-chart-4/10' },
];

const GROWTH_DATA = [
  { month: 'Oct', revenue: 210000, creators: 9800, tokens: 120000000 },
  { month: 'Nov', revenue: 238000, creators: 10900, tokens: 134000000 },
  { month: 'Dec', revenue: 271000, creators: 11800, tokens: 148000000 },
  { month: 'Jan', revenue: 290000, creators: 12600, tokens: 158000000 },
  { month: 'Feb', revenue: 312000, creators: 13500, tokens: 168000000 },
  { month: 'Mar', revenue: 341000, creators: 14829, tokens: 182400000 },
];

const REVENUE_MIX = [
  { name: 'Stream Tips', value: 34 },
  { name: 'VOD Unlocks', value: 22 },
  { name: 'Store Sales', value: 18 },
  { name: 'Affiliates', value: 14 },
  { name: 'Subscriptions', value: 12 },
];

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const ROADMAP = [
  { phase: 'Phase 1', title: 'Foundation', status: 'complete', items: ['Creator onboarding', 'Vault & payouts', 'VOD & streaming', 'Store & affiliates'] },
  { phase: 'Phase 2', title: 'Token Ecosystem', status: 'complete', items: ['$STREAMING SPL token', 'Token velocity engine', 'Trident OS bridge', 'Auto-split settlement'] },
  { phase: 'Phase 3', title: 'Overwatch Intelligence', status: 'active', items: ['War Room dashboard', 'Bridge stress testing', 'Aegis security layer', 'Overwatch momentum'] },
  { phase: 'Phase 4', title: 'Scale & Decentralize', status: 'upcoming', items: ['On-chain settlements', 'DAO governance', 'Multi-chain bridge', 'Creator NFT drops'] },
];

const TOKEN_ALLOCATION = [
  { label: 'Creator Rewards', pct: 35, color: 'bg-primary' },
  { label: 'Platform Treasury', pct: 20, color: 'bg-accent' },
  { label: 'Team & Founders', pct: 15, color: 'bg-yellow-400' },
  { label: 'Ecosystem Fund', pct: 20, color: 'bg-chart-4' },
  { label: 'Public Sale', pct: 10, color: 'bg-chart-5' },
];

const TABS = ['Executive Summary', 'Growth Metrics', 'Token Economy', 'Roadmap'];

export default function FounderDashboard() {
  const [activeTab, setActiveTab] = useState('Executive Summary');

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Founder Console</h1>
            <p className="text-muted-foreground mt-0.5">Strategic overview — platform health, token economy & roadmap.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/30 gap-1.5">
            <Lock className="w-3 h-3" /> Founder Access
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export Deck
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

      {/* EXECUTIVE SUMMARY */}
      {activeTab === 'Executive Summary' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FOUNDER_KPIS.map(({ label, value, change, up, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <ArrowUpRight className={`w-4 h-4 ${up ? 'text-accent' : 'text-destructive'}`} />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                <p className="text-xs text-accent mt-1 font-medium">{change}</p>
              </div>
            ))}
          </div>

          {/* Revenue + Creator Chart */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-1">Monthly Revenue</h2>
              <p className="text-xs text-muted-foreground mb-4">Platform gross revenue (6 months)</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={GROWTH_DATA}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-1">Creator Growth</h2>
              <p className="text-xs text-muted-foreground mb-4">Cumulative registered creators (6 months)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={GROWTH_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={v => [v.toLocaleString(), 'Creators']} />
                  <Line type="monotone" dataKey="creators" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Mix Pie */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-1">Revenue Mix</h2>
              <p className="text-xs text-muted-foreground mb-4">By monetization channel</p>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={REVENUE_MIX} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {REVENUE_MIX.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={v => [`${v}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {REVENUE_MIX.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-foreground">Key Health Metrics</h2>
              {[
                { label: 'Creator Retention (90d)', value: '84%', bar: 84, color: 'bg-accent' },
                { label: 'Avg Revenue / Creator', value: '$23.40/mo', bar: 62, color: 'bg-primary' },
                { label: 'Token Velocity Index', value: '7.2x', bar: 72, color: 'bg-yellow-400' },
                { label: 'Stream-to-Sale Conv.', value: '12.8%', bar: 48, color: 'bg-chart-4' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold text-foreground">{m.value}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${m.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Admin Console', path: '/admin', icon: ShieldCheck, color: 'text-primary bg-primary/10' },
              { label: 'War Room', path: '/war-room', icon: Activity, color: 'text-red-400 bg-red-400/10' },
              { label: 'Vault Overview', path: '/vault', icon: DollarSign, color: 'text-accent bg-accent/10' },
              { label: 'Analytics', path: '/analytics', icon: BarChart3, color: 'text-chart-4 bg-chart-4/10' },
              { label: 'Email OS', path: '/email-os', icon: Mail, color: 'text-chart-4 bg-chart-4/10' },
            ].map(({ label, path, icon: Icon, color }) => (
              <Link key={label} to={path}>
                <div className="rounded-xl border border-border bg-card hover:border-primary/40 p-4 flex items-center gap-3 transition-all cursor-pointer group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto group-hover:text-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* GROWTH METRICS */}
      {activeTab === 'Growth Metrics' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-1">Revenue vs Creator Growth</h2>
            <p className="text-xs text-muted-foreground mb-6">Dual-axis view — 6 months</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }} />
                <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Revenue ($)" opacity={0.85} />
                <Bar yAxisId="right" dataKey="creators" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Creators" opacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'MoM Revenue Growth', values: ['+13%', '+14%', '+7%', '+8%', '+9%'], months: ['Oct→Nov', 'Nov→Dec', 'Dec→Jan', 'Jan→Feb', 'Feb→Mar'] },
              { label: 'MoM Creator Growth', values: ['+11%', '+8%', '+7%', '+7%', '+10%'], months: ['Oct→Nov', 'Nov→Dec', 'Dec→Jan', 'Jan→Feb', 'Feb→Mar'] },
              { label: 'Avg Session Revenue', values: ['$21.4', '$22.9', '$23.0', '$23.1', '$22.8', '$23.0'], months: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] },
            ].map(({ label, values, months }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-sm text-foreground mb-4">{label}</h3>
                <div className="space-y-2">
                  {values.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{months[i]}</span>
                      <span className="font-semibold text-accent">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-1">Creator Cohort Retention</h2>
            <p className="text-xs text-muted-foreground mb-6">% of creators still active 30/60/90 days after joining</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { cohort: 'Oct', d30: 92, d60: 87, d90: 81 },
                { cohort: 'Nov', d30: 90, d60: 85, d90: 80 },
                { cohort: 'Dec', d30: 93, d60: 88, d90: 83 },
                { cohort: 'Jan', d30: 91, d60: 86, d90: 84 },
                { cohort: 'Feb', d30: 94, d60: 89, d90: null },
                { cohort: 'Mar', d30: 93, d60: null, d90: null },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="cohort" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={v => v ? [`${v}%`, ''] : ['N/A', '']} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }} />
                <Bar dataKey="d30" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} name="Day 30" opacity={0.9} />
                <Bar dataKey="d60" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Day 60" opacity={0.8} />
                <Bar dataKey="d90" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} name="Day 90" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* TOKEN ECONOMY */}
      {activeTab === 'Token Economy' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Supply', value: '500M', sub: '$STREAMING', color: 'text-primary' },
              { label: 'Circulating', value: '182.4M', sub: '36.5% of supply', color: 'text-accent' },
              { label: 'Avg Daily Volume', value: '4.2M', sub: 'tokens / day', color: 'text-yellow-400' },
              { label: 'Burn Rate (30d)', value: '1.8M', sub: 'tokens burned', color: 'text-chart-4' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5 text-center">
                <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs font-medium text-foreground mt-1">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          {/* Token Circulation Over Time */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-1">Circulating Supply Growth</h2>
            <p className="text-xs text-muted-foreground mb-4">Tokens in active circulation (6 months)</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={GROWTH_DATA}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={v => [`${(v/1000000).toFixed(1)}M`, '$STREAMING']} />
                <Area type="monotone" dataKey="tokens" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#tokenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Token Allocation */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-4">Token Allocation</h2>
              <div className="space-y-3">
                {TOKEN_ALLOCATION.map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-foreground">Utility Distribution</h2>
              <p className="text-xs text-muted-foreground">How circulating tokens are being used</p>
              {[
                { label: 'Stream Tips', pct: 42 },
                { label: 'Content Unlocks', pct: 28 },
                { label: 'Staking / Held', pct: 18 },
                { label: 'Marketplace Gas', pct: 12 },
              ].map(({ label, pct }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground w-32">{label}</span>
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-foreground font-semibold text-xs w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ROADMAP */}
      {activeTab === 'Roadmap' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            {ROADMAP.map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border bg-card p-6 ${
                  phase.status === 'active' ? 'border-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]' :
                  phase.status === 'complete' ? 'border-accent/40' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{phase.phase}</p>
                    <h3 className="font-display font-bold text-lg text-foreground mt-0.5">{phase.title}</h3>
                  </div>
                  <Badge className={
                    phase.status === 'complete' ? 'bg-accent/15 text-accent border-accent/30' :
                    phase.status === 'active' ? 'bg-primary/15 text-primary border-primary/30' :
                    'bg-muted text-muted-foreground'
                  }>
                    {phase.status === 'complete' ? '✓ Complete' : phase.status === 'active' ? '⚡ Active' : 'Upcoming'}
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {phase.items.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        phase.status === 'complete' ? 'bg-accent' :
                        phase.status === 'active' ? 'bg-primary' : 'bg-border'
                      }`} />
                      <span className={phase.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Next Milestones */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" /> Next 90-Day Milestones
            </h2>
            <div className="space-y-3">
              {[
                { goal: 'Launch live Trident OS API integration', target: 'May 2026', priority: 'critical' },
                { goal: 'On-chain $STREAMING settlement (Solana mainnet)', target: 'May 2026', priority: 'critical' },
                { goal: 'Creator DAO governance v1 launch', target: 'Jun 2026', priority: 'high' },
                { goal: 'Multi-chain bridge (ETH ↔ SOL)', target: 'Jun 2026', priority: 'high' },
                { goal: 'NFT drop tooling for creators', target: 'Jul 2026', priority: 'medium' },
                { goal: '20,000 creator network milestone', target: 'Jul 2026', priority: 'medium' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${m.priority === 'critical' ? 'bg-red-400' : m.priority === 'high' ? 'bg-yellow-400' : 'bg-accent'}`} />
                    <p className="text-sm text-foreground">{m.goal}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${m.priority === 'critical' ? 'bg-red-400/10 text-red-400 border-red-400/20' : m.priority === 'high' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
                      {m.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{m.target}</span>
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