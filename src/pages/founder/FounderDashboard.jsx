import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  DollarSign, Users, TrendingUp, Zap, Globe, BarChart3,
  ShieldCheck, Layers, ArrowUpRight, Download, RefreshCw,
  Crown, Target, Rocket, Radio, Lock, ChevronRight, Activity, Mail,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ledgerApi, engineApi } from '@/lib/adminApi';

const TABS = ['Executive Summary', 'Growth Metrics', 'Token Economy', 'Roadmap'];

export default function FounderDashboard() {
  const [activeTab, setActiveTab] = useState('Executive Summary');
  const [loading, setLoading] = useState(true);
  const [ledger, setLedger] = useState(null);
  const [engineStatus, setEngineStatus] = useState(null);
  
  // Real data state
  const [founderKpis, setFounderKpis] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [revenueMix, setRevenueMix] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [tokenAllocation, setTokenAllocation] = useState([]);
  const [tokenMetrics, setTokenMetrics] = useState(null);

  // Fetch real production data
  useEffect(() => {
    fetchFounderData();
  }, [activeTab]);

  const fetchFounderData = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('tridentProxy', {
        method: 'GET',
        path: `/founder/overwatch`,
      });
      
      if (response.data) {
        const data = response.data;
        setFounderKpis(data.kpis);
        setGrowthData(data.growth_chart || []);
        setRevenueMix(data.revenue_mix || []);
        setRoadmap(data.roadmap || []);
        setTokenAllocation(data.token_allocation || []);
        setTokenMetrics(data.token_metrics);
      }
      
      // Fetch live ledger and engine status
      ledgerApi.overview().then(setLedger).catch(() => {});
      engineApi.status().then(setEngineStatus).catch(() => {});
    } catch (error) {
      console.error('Failed to fetch founder data:', error);
      toast.error('Failed to load founder dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      await fetchFounderData();
      toast.success('Data synced successfully');
    } catch (error) {
      toast.error('Failed to sync data');
    }
  };

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
          <Button variant="outline" size="sm" className="gap-2" onClick={handleSync} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Data
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Loading founder data...</p>
              </div>
            </div>
          ) : founderKpis ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-accent" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-accent" />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">${founderKpis.total_arr || '0'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total ARR</p>
                <p className="text-xs text-accent mt-1 font-medium">+{founderKpis.arr_growth || '0'}% YoY</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-accent" />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{founderKpis.creator_count || '0'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Creator Network</p>
                <p className="text-xs text-accent mt-1 font-medium">+{founderKpis.new_creators || '0'} this week</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-accent" />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{founderKpis.circulating_tokens || '0'}M</p>
                <p className="text-xs text-muted-foreground mt-0.5">$STREAMING Circulating</p>
                <p className="text-xs text-accent mt-1 font-medium">+{founderKpis.token_growth || '0'}M this month</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-chart-4/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-chart-4" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-accent" />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{founderKpis.platform_take_rate || '0'}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Platform Take Rate</p>
                <p className="text-xs text-accent mt-1 font-medium">Net margin {founderKpis.net_margin || '0'}%</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-muted-foreground">Failed to load platform data</p>
              <Button onClick={fetchFounderData} className="mt-4">Retry</Button>
            </div>
          )}

          {/* Revenue + Creator Chart */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-1">Monthly Revenue</h2>
              <p className="text-xs text-muted-foreground mb-4">Platform gross revenue (6 months)</p>
              {growthData.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={growthData}>
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
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-1">Creator Growth</h2>
              <p className="text-xs text-muted-foreground mb-4">Cumulative registered creators (6 months)</p>
              {growthData.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={v => [v.toLocaleString(), 'Creators']} />
                  <Line type="monotone" dataKey="creators" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Revenue Mix Pie */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-1">Revenue Mix</h2>
              <p className="text-xs text-muted-foreground mb-4">By monetization channel</p>
              {revenueMix.length > 0 && (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={revenueMix} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {revenueMix.map((_, i) => <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} formatter={v => [`${v}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {revenueMix.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: `hsl(var(--chart-${(i % 5) + 1}))` }} />
                          <span className="text-foreground">{item.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          {/* Live Control Plane */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Ledger */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Live Coin Ledger
                </h3>
                <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                  {ledger ? 'Live' : 'Loading…'}
                </Badge>
              </div>
              {ledger ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-foreground">{(ledger.totalsupply / 1e6).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">Total Supply</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-accent">{ledger.wallet_count?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Wallets</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-primary">{ledger.recent_transactions?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Recent Txs</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground animate-pulse">Fetching live data…</div>
              )}
            </div>

            {/* Engine Status */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Engine Status
                </h3>
                <Badge className={`text-xs ${engineStatus?.mode === 'REAL' ? 'bg-red-400/10 text-red-400 border-red-400/20' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'}`}>
                  {engineStatus?.mode ?? '…'} MODE
                </Badge>
              </div>
              {engineStatus ? (
                <div className="space-y-1.5">
                  {(engineStatus.engines ?? []).slice(0, 4).map(e => (
                    <div key={e.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{e.name}</span>
                      <span className={e.status === 'running' ? 'text-accent font-semibold' : e.status === 'standby' ? 'text-yellow-400' : 'text-muted-foreground'}>{e.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground animate-pulse">Fetching engine status…</div>
              )}
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
            {growthData.length > 0 && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={growthData}>
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
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {growthData && growthData.metrics ? (
              [
                { label: 'MoM Revenue Growth', data: growthData.metrics.revenue_growth || [] },
                { label: 'MoM Creator Growth', data: growthData.metrics.creator_growth || [] },
                { label: 'Avg Session Revenue', data: growthData.metrics.session_revenue || [] },
              ].map(({ label, data }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-sm text-foreground mb-4">{label}</h3>
                <div className="space-y-2">
                  {data.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.period}</span>
                      <span className="font-semibold text-accent">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
            ) : (
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">No growth metrics available</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-1">Creator Cohort Retention</h2>
            <p className="text-xs text-muted-foreground mb-6">% of creators still active 30/60/90 days after joining</p>
            {growthData && growthData.retention && growthData.retention.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={growthData.retention}>
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
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">No retention data available</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TOKEN ECONOMY */}
      {activeTab === 'Token Economy' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {tokenMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="font-display text-2xl font-bold text-primary">{tokenMetrics.total_supply || '500'}M</p>
                <p className="text-xs font-medium text-foreground mt-1">Total Supply</p>
                <p className="text-xs text-muted-foreground">$STREAMING</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="font-display text-2xl font-bold text-accent">{tokenMetrics.circulating || '0'}M</p>
                <p className="text-xs font-medium text-foreground mt-1">Circulating</p>
                <p className="text-xs text-muted-foreground">{tokenMetrics.circulating_pct || '0'}% of supply</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="font-display text-2xl font-bold text-yellow-400">{tokenMetrics.daily_volume || '0'}M</p>
                <p className="text-xs font-medium text-foreground mt-1">Avg Daily Volume</p>
                <p className="text-xs text-muted-foreground">tokens / day</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="font-display text-2xl font-bold text-chart-4">{tokenMetrics.burn_rate || '0'}M</p>
                <p className="text-xs font-medium text-foreground mt-1">Burn Rate (30d)</p>
                <p className="text-xs text-muted-foreground">tokens burned</p>
              </div>
            </div>
          )}

          {/* Token Circulation Over Time */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-1">Circulating Supply Growth</h2>
            <p className="text-xs text-muted-foreground mb-4">Tokens in active circulation (6 months)</p>
            {growthData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={growthData}>
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
            )}
          </div>

          {/* Token Allocation */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-4">Token Allocation</h2>
              {tokenAllocation && tokenAllocation.length > 0 ? (
                <div className="space-y-3">
                  {tokenAllocation.map(({ label, pct, color }) => (
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
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No token allocation data available</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-foreground">Utility Distribution</h2>
              <p className="text-xs text-muted-foreground">How circulating tokens are being used</p>
              {tokenMetrics && tokenMetrics.utility_distribution && tokenMetrics.utility_distribution.length > 0 ? (
                tokenMetrics.utility_distribution.map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground w-32">{label}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-foreground font-semibold text-xs w-8 text-right">{pct}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No utility distribution data</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ROADMAP */}
      {activeTab === 'Roadmap' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            {roadmap && roadmap.length > 0 ? roadmap.map((phase, i) => (
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
            )) : (
              <p className="text-sm text-muted-foreground text-center py-10">No roadmap data available</p>
            )}
          </div>

          {/* Next Milestones */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" /> Next 90-Day Milestones
            </h2>
            {roadmap && roadmap.milestones && roadmap.milestones.length > 0 ? (
              <div className="space-y-3">
                {roadmap.milestones.map((m, i) => (
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
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">No upcoming milestones</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}