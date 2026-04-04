import { Link } from 'react-router-dom';
import { Wallet, Zap, Radio, Video, ShoppingBag, Link2, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import { useMockTridentData } from '@/hooks/useMockTridentData';
import { useMockDataHydration } from '@/hooks/useMockDataHydration';
import RevenuePumping from '@/components/dashboard/RevenuePumping';
import OversightMomentum from '@/components/dashboard/OversightMomentum';
import AegisSecurityStatus from '@/components/dashboard/AegisSecurityStatus';
import StreamingTokenFlow from '@/components/dashboard/StreamingTokenFlow';
import MockDataPanel from '@/components/dashboard/MockDataPanel';

const QUICK_ACTIONS = [
  { label: 'Go Live', icon: Radio, path: '/go-live', color: 'bg-red-500/20 text-red-400' },
  { label: 'Upload Video', icon: Video, path: '/upload-video', color: 'bg-primary/20 text-primary' },
  { label: 'Add Product', icon: ShoppingBag, path: '/store/add', color: 'bg-accent/20 text-accent' },
  { label: 'Add Affiliate', icon: Link2, path: '/affiliates/add', color: 'bg-yellow-500/20 text-yellow-400' },
];

const RECENT_STREAMS = [
  { title: 'Late Night Q&A', viewers: 1240, tips: 320, date: '2h ago', status: 'ended' },
  { title: 'Gaming Marathon', viewers: 3500, tips: 890, date: '1d ago', status: 'ended' },
  { title: 'Product Drop Reveal', viewers: 800, tips: 210, date: '3d ago', status: 'ended' },
];

const RECENT_UPLOADS = [
  { title: 'How I Built My Empire', views: 12400, revenue: 540, type: 'video' },
  { title: 'Episode 42 — Sovereignty', views: 3200, revenue: 120, type: 'podcast' },
  { title: 'Mindset Masterclass', views: 8900, revenue: 890, type: 'video' },
];

const STORE_SALES = [
  { product: 'Creator Starter Kit', sales: 34, revenue: 1020 },
  { product: 'Premium Preset Pack', sales: 18, revenue: 540 },
  { product: 'Stream Overlay Bundle', sales: 27, revenue: 810 },
];

export default function Dashboard() {
  const { realtimeTransaction, viewerCount, engagementVelocity, systemHealth, topFans, tokenSettlements } = useMockTridentData();
  const { processingTransactions } = useMockDataHydration();

  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader title="Dashboard" subtitle="Welcome back — here's your empire at a glance.">
        <Link to="/go-live">
          <Button className="bg-red-500 hover:bg-red-600 gap-2 glow-green">
            <Radio className="w-4 h-4" /> Go Live
          </Button>
        </Link>
      </PageHeader>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="CreatorVault Balance" value="$24,810" sub="Available to withdraw" icon={Wallet} trend="+12% this cycle" trendUp accent />
        <StatCard title="$STREAMING Balance" value="48,200" sub="STREAMING tokens" icon={Zap} trend="+890 today" trendUp />
        <StatCard title="This Month Revenue" value="$6,340" sub="All channels combined" icon={TrendingUp} trend="+22% vs last month" trendUp />
        <StatCard title="Total Affiliate" value="$1,280" sub="Earned this cycle" icon={Link2} trend="+5% conversion" trendUp />
      </div>

      {/* Pulse — Trident OS Mock Layer */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Revenue Pumping (AutoSplit)</h2>
          <RevenuePumping transaction={realtimeTransaction} />
        </div>
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Aegis Security Status</h2>
          <AegisSecurityStatus systemHealth={systemHealth} />
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Overwatch Momentum</h2>
        <OversightMomentum viewerCount={viewerCount} engagementVelocity={engagementVelocity} topFans={topFans} />
      </div>

      <div>
        <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">$STREAMING Token Flow</h2>
        <StreamingTokenFlow tokenSettlements={tokenSettlements} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
            <Link key={label} to={path}>
              <div className="rounded-xl border border-border bg-card hover:border-primary/40 p-4 flex items-center gap-3 transition-all cursor-pointer group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{label}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Streams */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Recent Streams</h2>
            <Link to="/stream-analytics"><Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {RECENT_STREAMS.map(({ title, viewers, tips, date }) => (
              <div key={title} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{viewers.toLocaleString()} viewers · {date}</p>
                </div>
                <Badge className="bg-accent/15 text-accent border-accent/30 text-xs">
                  <Zap className="w-2.5 h-2.5 mr-1" />${tips}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Recent Uploads</h2>
            <Link to="/videos"><Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {RECENT_UPLOADS.map(({ title, views, revenue, type }) => (
              <div key={title} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{views.toLocaleString()} views · {type}</p>
                </div>
                <span className="text-sm font-semibold text-accent">${revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Store Sales */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Store Sales</h2>
            <Link to="/store"><Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {STORE_SALES.map(({ product, sales, revenue }) => (
              <div key={product} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{product}</p>
                  <p className="text-xs text-muted-foreground">{sales} sales</p>
                </div>
                <span className="text-sm font-semibold text-accent">${revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Recent Payouts</h2>
          <Link to="/vault/payouts"><Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-3 pr-4 font-medium">Cycle</th>
              <th className="pb-3 pr-4 font-medium">Amount</th>
              <th className="pb-3 pr-4 font-medium">$STREAMING</th>
              <th className="pb-3 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border/50">
              {[
                { cycle: 'March 2026', amount: '$4,200', streaming: '12,400', status: 'Completed' },
                { cycle: 'February 2026', amount: '$3,840', streaming: '9,800', status: 'Completed' },
                { cycle: 'January 2026', amount: '$3,100', streaming: '8,200', status: 'Completed' },
              ].map(({ cycle, amount, streaming, status }) => (
                <tr key={cycle}>
                  <td className="py-3 pr-4 font-medium">{cycle}</td>
                  <td className="py-3 pr-4 text-accent">{amount}</td>
                  <td className="py-3 pr-4 text-primary">{streaming}</td>
                  <td className="py-3"><Badge className="bg-accent/15 text-accent border-accent/30">{status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mock Transaction Monitor — Live Moke Layer Visibility */}
      {processingTransactions.length > 0 && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
          <MockDataPanel transactions={processingTransactions} />
        </div>
      )}
    </div>
  );
}