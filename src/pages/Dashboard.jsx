import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Wallet, Zap, Radio, Video, ShoppingBag, Link2, TrendingUp, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import { creatorDashboardApi, creatorWalletApi } from '@/lib/creatorApi';

const QUICK_ACTIONS = [
  { label: 'Go Live', icon: Radio, path: '/go-live', color: 'bg-red-500/20 text-red-400' },
  { label: 'Upload Video', icon: Video, path: '/upload-video', color: 'bg-primary/20 text-primary' },
  { label: 'Add Product', icon: ShoppingBag, path: '/store/add', color: 'bg-accent/20 text-accent' },
  { label: 'Add Affiliate', icon: Link2, path: '/affiliates/add', color: 'bg-yellow-500/20 text-yellow-400' },
];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [overview, wallet, streams, videos, products] = await Promise.all([
          creatorDashboardApi.overview(),
          creatorWalletApi.balance(),
          creatorDashboardApi.analytics({ type: 'streams', limit: 3 }),
          creatorDashboardApi.analytics({ type: 'videos', limit: 3 }),
          creatorDashboardApi.analytics({ type: 'products', limit: 3 }),
        ]);
        setDashboardData({ overview, wallet, streams, videos, products });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const vaultBalance = dashboardData?.wallet?.balance ?? 0;
  const streamingBalance = dashboardData?.wallet?.streaming_balance ?? 0;
  const monthRevenue = dashboardData?.overview?.month_revenue ?? 0;
  const affiliateEarned = dashboardData?.overview?.affiliate_earned ?? 0;

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
        <StatCard title="CreatorVault Balance" value={loading ? "…" : `$${vaultBalance.toLocaleString()}`} sub="Available to withdraw" icon={Wallet} trend="+12% this cycle" trendUp accent />
        <StatCard title="$STREAMING Balance" value={loading ? "…" : streamingBalance.toLocaleString()} sub="STREAMING tokens" icon={Zap} trend="+890 today" trendUp />
        <StatCard title="This Month Revenue" value={loading ? "…" : `$${monthRevenue.toLocaleString()}`} sub="All channels combined" icon={TrendingUp} trend="+22% vs last month" trendUp />
        <StatCard title="Total Affiliate" value={loading ? "…" : `$${affiliateEarned.toLocaleString()}`} sub="Earned this cycle" icon={Link2} trend="+5% conversion" trendUp />
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
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : dashboardData?.streams?.length > 0 ? (
              dashboardData.streams.map((stream) => (
                <div key={stream.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{stream.title}</p>
                    <p className="text-xs text-muted-foreground">{stream.viewers.toLocaleString()} viewers · {new Date(stream.ended_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className="bg-accent/15 text-accent border-accent/30 text-xs">
                    <Zap className="w-2.5 h-2.5 mr-1" />${stream.tips_earned?.toLocaleString() ?? 0}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No recent streams</div>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Recent Uploads</h2>
            <Link to="/videos"><Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : dashboardData?.videos?.length > 0 ? (
              dashboardData.videos.map((video) => (
                <div key={video.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.views.toLocaleString()} views · {video.type}</p>
                  </div>
                  <span className="text-sm font-semibold text-accent">${video.revenue?.toLocaleString() ?? 0}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No recent uploads</div>
            )}
          </div>
        </div>

        {/* Store Sales */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Store Sales</h2>
            <Link to="/store"><Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : dashboardData?.products?.length > 0 ? (
              dashboardData.products.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales_count} sales</p>
                  </div>
                  <span className="text-sm font-semibold text-accent">${product.revenue?.toLocaleString() ?? 0}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No recent sales</div>
            )}
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
              {loading ? (
                <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Loading...</td></tr>
              ) : dashboardData?.overview?.payouts?.length > 0 ? (
                dashboardData.overview.payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="py-3 pr-4 font-medium">{payout.cycle}</td>
                    <td className="py-3 pr-4 text-accent">${payout.amount?.toLocaleString() ?? 0}</td>
                    <td className="py-3 pr-4 text-primary">{payout.streaming_amount?.toLocaleString() ?? 0}</td>
                    <td className="py-3"><Badge className="bg-accent/15 text-accent border-accent/30">{payout.status}</Badge></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No payouts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}