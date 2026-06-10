import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Zap, TrendingUp, BarChart3, ArrowDownLeft, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { creatorDashboardApi, creatorWalletApi } from '@/lib/creatorApi';

export default function Earnings() {
  const [period, setPeriod] = useState('6M');
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [overview, wallet, transactions] = await Promise.all([
          creatorDashboardApi.overview(),
          creatorWalletApi.balance(),
          creatorWalletApi.transactions(),
        ]);
        setEarningsData({ overview, wallet, transactions });
      } catch (err) {
        console.error('Earnings load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

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
            { label: 'Total Earned', value: `$${earningsData?.overview?.total_earned?.toLocaleString() ?? '0'}`, sub: '+21% vs last month', icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
            { label: '$STREAMING Earned', value: `${(earningsData?.wallet?.streaming_balance ?? 0).toLocaleString()}`, sub: 'this month', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Growth Rate', value: '+21%', sub: 'month-over-month', icon: TrendingUp, color: 'text-chart-4', bg: 'bg-chart-4/10' },
            { label: 'Pending', value: `$${(earningsData?.wallet?.pending ?? 0).toLocaleString()}`, sub: '~3 transactions', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
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
              <AreaChart data={earningsData?.overview?.monthly_revenue ?? []}>
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
              <BarChart data={earningsData?.overview?.monthly_tokens ?? []}>
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
            {earningsData?.overview?.revenue_sources?.map(s => (
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
            {earningsData?.transactions?.slice(0, 5).map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <ArrowDownLeft className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{e.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">+${e.amount}</p>
                  <p className="text-xs text-muted-foreground">+{e.streaming} $STREAM</p>
                </div>
                <Badge className={e.status === 'completed' ? 'bg-accent/10 text-accent border-accent/20 text-xs' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs'}>
                  {e.status === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
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