import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Zap, TrendingUp, BarChart3, ArrowDownLeft, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const MONTHLY = [
  { month: 'Jan', usd: 3200, tokens: 12400 },
  { month: 'Feb', usd: 4100, tokens: 16200 },
  { month: 'Mar', usd: 3800, tokens: 14900 },
  { month: 'Apr', usd: 5200, tokens: 20800 },
  { month: 'May', usd: 6100, tokens: 24400 },
  { month: 'Jun', usd: 7400, tokens: 29600 },
];

const SOURCES = [
  { source: 'Stream Tips', usd: 2840, tokens: 11360, pct: 38 },
  { source: 'PPV Unlocks', usd: 1920, tokens: 7680, pct: 26 },
  { source: 'Store Sales', usd: 1480, tokens: 5920, pct: 20 },
  { source: 'Affiliates', usd: 740, tokens: 2960, pct: 10 },
  { source: 'Memberships', usd: 420, tokens: 1680, pct: 6 },
];

const RECENT_EARNS = [
  { label: 'Stream Tip — viewer_99', time: '2m ago', amount: '+$25.00', tokens: '+250 $STREAM', status: 'confirmed' },
  { label: 'PPV Unlock — luna_premium.mp4', time: '18m ago', amount: '+$19.99', tokens: '+199 $STREAM', status: 'confirmed' },
  { label: 'Auto-Split Settled', time: '1h ago', amount: '+$140.00', tokens: '+1,400 $STREAM', status: 'confirmed' },
  { label: 'Affiliate Commission — CryptoKit', time: '3h ago', amount: '+$32.50', tokens: '+325 $STREAM', status: 'confirmed' },
  { label: 'Membership — pixel_sub', time: '5h ago', amount: '+$9.99', tokens: '+99 $STREAM', status: 'pending' },
];

export default function Earnings() {
  const [period, setPeriod] = useState('6M');

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Earnings</h1>
            <p className="text-muted-foreground text-sm mt-0.5">All revenue streams across your Trident profile.</p>
          </div>
          <div className="flex gap-1.5">
            {['7D', '30D', '6M', '1Y'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${period === p ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground bg-card hover:text-foreground'}`}>
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Earned', value: '$7,400', sub: '+21% vs last month', icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
            { label: '$STREAMING Earned', value: '29,600', sub: 'this month', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Growth Rate', value: '+21%', sub: 'month-over-month', icon: TrendingUp, color: 'text-chart-4', bg: 'bg-chart-4/10' },
            { label: 'Pending', value: '$430', sub: '~3 transactions', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xs text-accent">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Revenue Over Time */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground text-sm mb-4">USD Revenue</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={MONTHLY}>
                <defs>
                  <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} formatter={v => [`$${v}`, 'Earned']} />
                <Area type="monotone" dataKey="usd" stroke="hsl(var(--accent))" fill="url(#earnGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Token Earnings */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground text-sm mb-4">$STREAMING Token Earnings</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} formatter={v => [`${v} $STREAM`, '']} />
                <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Sources */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground text-sm mb-4">Revenue Breakdown by Source</h2>
          <div className="space-y-3">
            {SOURCES.map(s => (
              <div key={s.source} className="flex items-center gap-4">
                <p className="text-sm text-foreground w-32 flex-shrink-0">{s.source}</p>
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${s.pct}%` }} />
                </div>
                <p className="text-sm font-semibold text-foreground w-20 text-right">${s.usd.toLocaleString()}</p>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs w-10 justify-center">{s.pct}%</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm">Recent Earnings</h2>
          </div>
          <div className="divide-y divide-border/50">
            {RECENT_EARNS.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <ArrowDownLeft className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{e.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">{e.amount}</p>
                  <p className="text-xs text-muted-foreground">{e.tokens}</p>
                </div>
                <Badge className={e.status === 'confirmed' ? 'bg-accent/10 text-accent border-accent/20 text-xs' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs'}>
                  {e.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                  {e.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}