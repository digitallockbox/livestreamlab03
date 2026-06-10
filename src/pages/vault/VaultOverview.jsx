import { Wallet, Zap, TrendingUp, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { creatorWalletApi, creatorDashboardApi } from '@/lib/creatorApi';

export default function VaultOverview() {
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [wallet, overview] = await Promise.all([
          creatorWalletApi.balance(),
          creatorDashboardApi.overview(),
        ]);
        setVaultData({ wallet, overview });
      } catch (err) {
        console.error('Vault load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader title="CreatorVault" subtitle="Your sovereign earnings hub.">
        <Button variant="outline" className="gap-2 border-border"><Download className="w-4 h-4" /> Export</Button>
        <Button className="bg-primary hover:bg-primary/90 gap-2"><Wallet className="w-4 h-4" /> Withdraw</Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Wallet Balance" value={`$${(vaultData?.wallet?.balance ?? 0).toLocaleString()}`} icon={Wallet} trend="+$1,240 this week" trendUp accent />
        <StatCard title="$STREAMING Balance" value={`${(vaultData?.wallet?.streaming_balance ?? 0).toLocaleString()}`} icon={Zap} trend="+890 today" trendUp />
        <StatCard title="This Cycle" value={`$${(vaultData?.overview?.cycle_revenue ?? 0).toLocaleString()}`} icon={TrendingUp} trend="+22% vs last" trendUp />
        <StatCard title="Total Earned" value={`$${(vaultData?.overview?.total_earned ?? 0).toLocaleString()}`} icon={TrendingUp} trend="All time" trendUp />
      </div>

      {/* Earnings Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display font-semibold mb-6">Earnings Breakdown</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={vaultData?.overview?.monthly_revenue ?? []}>
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
          {vaultData?.overview?.revenue_sources?.map(({ label, amount, pct, color }) => (
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