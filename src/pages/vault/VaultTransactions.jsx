import { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';

const ALL_TXS = [
  { id: 1, type: 'stream', desc: 'Live Stream Tips — Late Night Q&A', amount: 320, streaming: 960, date: '2026-04-03', status: 'completed' },
  { id: 2, type: 'store', desc: 'Creator Starter Kit — Sale', amount: 29, streaming: 0, date: '2026-04-03', status: 'completed' },
  { id: 3, type: 'affiliate', desc: 'TechGear Pro — Commission', amount: 44, streaming: 130, date: '2026-04-02', status: 'completed' },
  { id: 4, type: 'video', desc: 'Premium Video Unlock — Mindset Masterclass', amount: 15, streaming: 450, date: '2026-04-02', status: 'completed' },
  { id: 5, type: 'podcast', desc: 'Podcast Boost — Episode 42', amount: 8, streaming: 240, date: '2026-04-01', status: 'completed' },
  { id: 6, type: 'audio', desc: 'Audio Content Subscription', amount: 12, streaming: 360, date: '2026-04-01', status: 'completed' },
  { id: 7, type: 'stream', desc: 'Live Stream Tips — Gaming Marathon', amount: 890, streaming: 2670, date: '2026-03-30', status: 'completed' },
  { id: 8, type: 'payout', desc: 'March Cycle Payout', amount: -4200, streaming: 0, date: '2026-03-31', status: 'completed' },
];

const TYPE_COLORS = {
  stream: 'bg-red-500/20 text-red-400',
  store: 'bg-accent/20 text-accent',
  affiliate: 'bg-yellow-500/20 text-yellow-400',
  video: 'bg-primary/20 text-primary',
  podcast: 'bg-pink-500/20 text-pink-400',
  audio: 'bg-blue-500/20 text-blue-400',
  payout: 'bg-muted text-muted-foreground',
};

const FILTERS = ['all', 'stream', 'store', 'affiliate', 'video', 'audio', 'podcast'];

export default function VaultTransactions() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? ALL_TXS : ALL_TXS.filter(t => t.type === filter);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader title="Transactions" subtitle="Full history of your CreatorVault activity.">
        <Button variant="outline" className="gap-2 border-border"><Download className="w-4 h-4" /> Export CSV</Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="py-3 px-4 font-medium">Description</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">$STREAMING</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(({ id, type, desc, amount, streaming, date, status }) => (
                <tr key={id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-medium">{desc}</td>
                  <td className="py-3 px-4"><Badge className={`${TYPE_COLORS[type]} capitalize`}>{type}</Badge></td>
                  <td className={`py-3 px-4 font-semibold ${amount < 0 ? 'text-destructive' : 'text-accent'}`}>
                    {amount < 0 ? '-' : '+'}${Math.abs(amount)}
                  </td>
                  <td className="py-3 px-4 text-primary">{streaming > 0 ? `+${streaming}` : '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{date}</td>
                  <td className="py-3 px-4"><Badge className="bg-accent/15 text-accent border-accent/30 capitalize">{status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}