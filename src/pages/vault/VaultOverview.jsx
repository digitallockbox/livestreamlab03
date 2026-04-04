import { Wallet, Zap, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const earningsData = [
  { month: 'Oct', streams: 1200, store: 400, affiliate: 200, video: 600 },
  { month: 'Nov', streams: 1800, store: 600, affiliate: 350, video: 900 },
  { month: 'Dec', streams: 2400, store: 900, affiliate: 480, video: 1200 },
  { month: 'Jan', streams: 2100, store: 750, affiliate: 400, video: 1100 },
  { month: 'Feb', streams: 3200, store: 1100, affiliate: 550, video: 1400 },
  { month: 'Mar', streams: 3800, store: 1400, affiliate: 720, video: 1800 },
];

const SOURCES = [
  { label: 'Live Streams', amount: '$3,800', pct: 47, color: 'bg-primary' },
  { label: 'Video Content', amount: '$1,800', pct: 22, color: 'bg-chart-2' },
  { label: 'Creator Store', amount: '$1,400', pct: 17, color: 'bg-chart-3' },
  { label: 'Affiliates', amount: '$720', pct: 9, color: 'bg-chart-4' },
  { label: 'Podcast', amount: '$420', pct: 5, color: 'bg-chart-5' },
];

export default function VaultOverview() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader title="CreatorVault" subtitle="Your sovereign earnings hub.">
        <Button variant="outline" className="gap-2 border-border"><Download className="w-4 h-4" /> Export</Button>
        <Button className="bg-primary hover:bg-primary/90 gap-2"><Wallet className="w-4 h-4" /> Withdraw</Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Wallet Balance" value="$24,810" icon={Wallet} trend="+$1,240 this week" trendUp accent />
        <StatCard title="$STREAMING Balance" value="48,200" icon={Zap} trend="+890 today" trendUp />
        <StatCard title="This Cycle" value="$8,140" icon={TrendingUp} trend="+22% vs last" trendUp />
        <StatCard title="Total Earned" value="$142,300" icon={TrendingUp} trend="All time" trendUp />
      </div>

      {/* Earnings Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display font-semibold mb-6">Earnings Breakdown</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={earningsData}>
            <defs>
              {[['streams','#7C3AED'],['store','#34D399'],['affiliate','#F59E0B'],['video','#3B82F6']].map(([k,c]) => (
                <linearGradient key={k} id={`g_${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="month" stroke="#4B5563" tick={{ fontSize: 12 }} />
            <YAxis stroke="#4B5563" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 8 }} />
            <Area type="monotone" dataKey="streams" stroke="#7C3AED" fill="url(#g_streams)" name="Streams" />
            <Area type="monotone" dataKey="store" stroke="#34D399" fill="url(#g_store)" name="Store" />
            <Area type="monotone" dataKey="affiliate" stroke="#F59E0B" fill="url(#g_affiliate)" name="Affiliate" />
            <Area type="monotone" dataKey="video" stroke="#3B82F6" fill="url(#g_video)" name="Video" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Sources */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display font-semibold mb-6">Revenue Sources — This Cycle</h2>
        <div className="space-y-4">
          {SOURCES.map(({ label, amount, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{pct}%</span>
                  <span className="font-semibold text-accent">{amount}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}