import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { economy } from "@/lib/web3/economy";
import EconomyCard from "@/components/web3/EconomyCard";
import RevenueChart from "@/components/web3/RevenueChart";

export default function EconomyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    economy()
      .then((res) => active && setData(res))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const chartData = (data.recent || [])
    .slice()
    .reverse()
    .map((t, i) => ({ name: `#${i + 1}`, value: t.amount || 0 }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Creator Economy</h1>
        <p className="text-sm text-muted-foreground mt-1">Revenue, streaming tokens, and transaction activity.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EconomyCard label="Total Revenue" value={`$${(data.total_revenue || 0).toFixed(2)}`} sub="All time" />
        <EconomyCard
          label="Streaming Revenue"
          value={`${(data.streaming_revenue || 0).toFixed(2)}`}
          sub="$STREAMING tokens"
          accent="accent"
        />
        <EconomyCard
          label="Boosts Received"
          value={`${(data.boosts_total || 0).toFixed(0)} ⚡`}
          sub={`${data.boost_count || 0} boosts`}
        />
        <EconomyCard
          label="Subscribers"
          value={data.subscriber_count || 0}
          sub={`$${(data.subs_mrr || 0).toFixed(2)} MRR`}
        />
        <EconomyCard label="Transactions" value={data.transaction_count || 0} sub="Recent activity" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold mb-4">Revenue Trend</h3>
        <RevenueChart data={chartData} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold mb-4">Revenue by Type</h3>
        <div className="space-y-2">
          {Object.entries(data.by_type || {}).map(([type, amount]) => (
            <div
              key={type}
              className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0"
            >
              <span className="text-muted-foreground capitalize">{type.replace(/_/g, " ")}</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
          ))}
          {Object.keys(data.by_type || {}).length === 0 && (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}