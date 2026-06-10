import { useState, useEffect } from 'react';
import { Download, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import { creatorWalletApi } from '@/lib/creatorApi';

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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await creatorWalletApi.transactions();
        setTransactions(data || []);
      } catch (err) {
        console.error('Transactions load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

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
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No transactions found</td></tr>
              ) : (
                filtered.map(({ id, type, description, amount, streaming, date, status }) => (
                  <tr key={id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium">{description}</td>
                    <td className="py-3 px-4"><Badge className={`${TYPE_COLORS[type]} capitalize`}>{type}</Badge></td>
                    <td className={`py-3 px-4 font-semibold ${amount < 0 ? 'text-destructive' : 'text-accent'}`}>
                      {amount < 0 ? '-' : '+'}${Math.abs(amount)}
                    </td>
                    <td className="py-3 px-4 text-primary">{streaming > 0 ? `+${streaming}` : '—'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(date).toLocaleDateString()}</td>
                    <td className="py-3 px-4"><Badge className="bg-accent/15 text-accent border-accent/30 capitalize">{status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}