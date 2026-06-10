import { Wallet, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { creatorWalletApi } from '@/lib/creatorApi';

function CycleRow({ cycle, amount, streaming, status, splits }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-3">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{cycle}</p>
            <p className="text-xs text-muted-foreground">{splits?.length || 0} collaborator{splits?.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-bold text-accent">${amount?.toLocaleString() || 0}</p>
            <p className="text-xs text-primary">{streaming?.toLocaleString() || 0} $STREAMING</p>
          </div>
          <Badge className="bg-accent/15 text-accent border-accent/30">{status}</Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && splits && splits.length > 0 && (
        <div className="border-t border-border p-4 bg-muted/10">
          <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Team Splits</p>
          <div className="space-y-2">
            {splits.map(({ name, pct }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm w-40">{name}</span>
                <span className="text-sm font-semibold text-accent w-12 text-right">{pct}%</span>
                <span className="text-sm text-muted-foreground w-20 text-right">${Math.round((amount || 0) * pct / 100).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PayoutHistory() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await creatorWalletApi.payouts();
        setPayouts(data || []);
      } catch (err) {
        console.error('Payouts load error:', err);
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

  const totalPaid = payouts.reduce((s, p) => s + (p.amount || 0), 0);
  const avgPerCycle = payouts.length > 0 ? totalPaid / payouts.length : 0;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader title="Payout History" subtitle="All completed and pending payout cycles." />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Paid Out" value={`$${totalPaid.toLocaleString()}`} icon={Wallet} trend="All cycles" trendUp />
        <StatCard title="Avg Per Cycle" value={`$${Math.round(avgPerCycle).toLocaleString()}`} icon={Wallet} trend="Last 4 cycles" trendUp />
        <StatCard title="Next Payout" value="Apr 30" icon={Wallet} sub="Est. $6,800" />
      </div>
      <div className="space-y-2">
        {payouts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No payouts yet</div>
        ) : (
          payouts.map(c => <CycleRow key={c.cycle} {...c} />)
        )}
      </div>
    </div>
  );
}