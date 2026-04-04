import { Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';

const CYCLES = [
  { cycle: 'March 2026', amount: 4200, streaming: 12400, status: 'completed', splits: [{ name: 'You', pct: 70 }, { name: 'Alex (Editor)', pct: 20 }, { name: 'Jamie (Mod)', pct: 10 }] },
  { cycle: 'February 2026', amount: 3840, streaming: 9800, status: 'completed', splits: [{ name: 'You', pct: 70 }, { name: 'Alex (Editor)', pct: 20 }, { name: 'Jamie (Mod)', pct: 10 }] },
  { cycle: 'January 2026', amount: 3100, streaming: 8200, status: 'completed', splits: [{ name: 'You', pct: 80 }, { name: 'Alex (Editor)', pct: 20 }] },
  { cycle: 'December 2025', amount: 5600, streaming: 15000, status: 'completed', splits: [{ name: 'You', pct: 100 }] },
];

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
            <p className="text-xs text-muted-foreground">{splits.length} collaborator{splits.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-bold text-accent">${amount.toLocaleString()}</p>
            <p className="text-xs text-primary">{streaming.toLocaleString()} $STREAMING</p>
          </div>
          <Badge className="bg-accent/15 text-accent border-accent/30">{status}</Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
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
                <span className="text-sm text-muted-foreground w-20 text-right">${Math.round(amount * pct / 100).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PayoutHistory() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader title="Payout History" subtitle="All completed and pending payout cycles." />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Paid Out" value="$16,740" icon={Wallet} trend="All cycles" trendUp />
        <StatCard title="Avg Per Cycle" value="$4,185" icon={Wallet} trend="Last 4 cycles" trendUp />
        <StatCard title="Next Payout" value="Apr 30" icon={Wallet} sub="Est. $6,800" />
      </div>
      <div className="space-y-2">
        {CYCLES.map(c => <CycleRow key={c.cycle} {...c} />)}
      </div>
    </div>
  );
}