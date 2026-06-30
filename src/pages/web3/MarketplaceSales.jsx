import { useState, useEffect } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCreator } from "@/hooks/web3/useCreator";
import { marketplace } from "@/lib/web3/marketplace";

export default function MarketplaceSales() {
  const { profile } = useCreator();
  const [data, setData] = useState({ sales: [], count: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!profile?.wallet_address) {
      setLoading(false);
      return;
    }
    marketplace
      .sales(profile.wallet_address)
      .then((res) => active && setData(res))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [profile?.wallet_address]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Sales</h1>
        <p className="text-sm text-muted-foreground mt-1">Transaction history for your marketplace.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-display font-bold mt-1">{data.count}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-2xl font-display font-bold mt-1 text-accent">${(data.total || 0).toFixed(2)}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
          <ShoppingBag className="w-4 h-4 text-primary" /> Transactions
        </h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : data.sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales yet.</p>
        ) : (
          <div className="space-y-2">
            {data.sales.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm truncate">{s.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.created_date ? new Date(s.created_date).toLocaleDateString() : ""}
                  </p>
                </div>
                <span className="text-sm font-medium text-accent shrink-0">+${(s.amount || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}