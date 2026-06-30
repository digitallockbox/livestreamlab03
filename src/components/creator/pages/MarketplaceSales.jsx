import React, { useEffect, useState } from "react";
import { useViewerWallet, marketplaceAPI, Page, Card, Spinner } from "@/components/creator/os";

export default function MarketplaceSales() {
  const wallet = useViewerWallet();
  const [data, setData] = useState({ sales: [], count: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    marketplaceAPI.sales(wallet).then(setData).finally(() => setLoading(false));
  }, [wallet]);

  if (loading) return <Page title="Sales" subtitle="Transaction history"><Spinner /></Page>;

  return (
    <Page title="Sales" subtitle="Transaction history">
      <div className="grid grid-cols-2 gap-4">
        <Card><p className="text-xs text-muted-foreground">Transactions</p><p className="text-xl sm:text-2xl font-display font-bold">{data.count || 0}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Total</p><p className="text-xl sm:text-2xl font-display font-bold text-accent">${(data.total || 0).toFixed(2)}</p></Card>
      </div>
      <Card>
        {data.sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales yet.</p>
        ) : data.sales.map((s) => (
          <div key={s.id} className="flex justify-between items-center gap-3 py-2 border-b border-border/50 last:border-0">
            <span className="text-sm truncate">{s.description}</span>
            <span className="text-sm text-accent whitespace-nowrap">+${(s.amount || 0).toFixed(2)}</span>
          </div>
        ))}
      </Card>
    </Page>
  );
}