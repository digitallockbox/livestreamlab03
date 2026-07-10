import { motion } from 'framer-motion';
import {
  BarChart3, Users, DollarSign, Zap, Radio, Crown, Trophy,
  Loader2, RefreshCw, Award, Layers, TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useGlobalAnalytics } from '@/hooks/web3/useGlobalAnalytics';

const BADGE_COLORS = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  diamond: '#67e8f9',
};

const SOURCE_LABELS = {
  streams: 'Streams (◎)',
  store: 'Store ($)',
  affiliate: 'Affiliate ($)',
  subscription: 'Subs ($)',
  other: 'Other ($)',
};

const PIE_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#60a5fa', '#f472b6'];

const CATEGORY_LABELS = {
  gaming: 'Gaming',
  music: 'Music',
  talk_show: 'Talk Show',
  education: 'Education',
  creative: 'Creative',
  sports: 'Sports',
  tech: 'Tech',
  other: 'Other',
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="font-display text-xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function GlobalAnalyticsDashboard() {
  const { data, loading, error, refresh } = useGlobalAnalytics();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-muted-foreground">Unable to load analytics.</p>;
  }

  const revenueData = Object.entries(data.revenueBySource || {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: SOURCE_LABELS[key] || key, value: Math.round(value * 100) / 100 }));

  const badgeData = Object.entries(data.badgeTiers || {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: key, value }));

  const categoryData = Object.entries(data.categoryDist || {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: CATEGORY_LABELS[key] || key, value }));

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="space-y-4">
      {/* Refresh bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.computed_at
            ? `Computed locally · ${new Date(data.computed_at).toLocaleTimeString()}`
            : 'Live from analytics engine'}
        </p>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="gap-1.5 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Creators" value={data.totalCreators || 0} sub={`${data.onboarded || 0} onboarded`} color="bg-primary/10 text-primary" />
        <StatCard icon={Award} label="Verified" value={data.verified || 0} sub="identity verified" color="bg-accent/10 text-accent" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${(data.totalRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub="all sources" color="bg-chart-4/10 text-chart-4" />
        <StatCard icon={Zap} label="$STREAMING" value={`${(data.totalStreamingDistributed || 0).toLocaleString()} ◎`} sub="distributed" color="bg-chart-2/10 text-chart-2" />
        <StatCard icon={Radio} label="Live Now" value={data.liveStreams || 0} sub={`${data.totalStreams || 0} total streams`} color="bg-destructive/10 text-destructive" />
        <StatCard icon={TrendingUp} label="Viewers" value={(data.totalViewers || 0).toLocaleString()} sub="aggregate reach" color="bg-chart-3/10 text-chart-3" />
      </div>

      {/* Revenue breakdown + Badge tier distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {revenueData.length > 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <h3 className="font-display font-semibold text-sm mb-3">Revenue by Source</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={revenueData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                    {revenueData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {revenueData.map((entry, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {entry.name}: {entry.name.includes('◎') ? `${entry.value.toLocaleString()} ◎` : `$${entry.value.toLocaleString()}`}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {badgeData.length > 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <h3 className="font-display font-semibold text-sm mb-3">Badge Tier Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={badgeData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, textTransform: 'capitalize' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {badgeData.map((entry, i) => (
                      <Cell key={i} fill={BADGE_COLORS[entry.name] || '#a78bfa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top creators leaderboard */}
      {data.topCreators && data.topCreators.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-chart-3" />
              <h3 className="font-display font-semibold text-sm">Top Creators by Earnings</h3>
            </div>
            <div className="space-y-1">
              {data.topCreators.map((creator, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-mono w-6 ${i < 3 ? 'text-chart-3 font-bold' : 'text-muted-foreground'}`}>
                      {i < 3 ? <Trophy className="w-3.5 h-3.5 inline" /> : `#${i + 1}`}
                    </span>
                    <span className="text-sm font-medium truncate">{creator.display_name}</span>
                    {creator.verified && <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] py-0">✓</Badge>}
                    <span className="text-[10px] capitalize text-muted-foreground">{creator.badge_tier}</span>
                  </div>
                  <span className="text-sm font-semibold text-accent whitespace-nowrap">
                    {creator.earnings.toLocaleString()} ◎
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category distribution */}
      {categoryData.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">Stream Category Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}