import React, { useEffect, useMemo, useState } from "react";
import { MousePointerClick, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Card, Spinner, storeAPI } from "@/components/creator/os";

const usd = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function ProductAnalytics() {
  const { walletAddress } = useIdentity();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    storeAPI.list(walletAddress).then((r) => setProducts(r.products || [])).finally(() => setLoading(false));
  }, [walletAddress]);

  const totals = useMemo(() => {
    const clicks = products.reduce((a, p) => a + (p.clicks || 0), 0);
    const conversions = products.reduce((a, p) => a + (p.conversions || 0), 0);
    const revenue = products.reduce((a, p) => a + (p.revenue || 0), 0);
    return { clicks, conversions, revenue, rate: clicks ? (conversions / clicks) * 100 : 0 };
  }, [products]);

  if (loading) return <Spinner />;

  const stats = [
    { label: "Clicks", value: totals.clicks.toLocaleString(), icon: MousePointerClick, color: "text-primary" },
    { label: "Conversions", value: totals.conversions.toLocaleString(), icon: ShoppingBag, color: "text-foreground" },
    { label: "Revenue", value: usd(totals.revenue), icon: DollarSign, color: "text-accent" },
    { label: "Conv. Rate", value: `${totals.rate.toFixed(1)}%`, icon: TrendingUp, color: "text-foreground" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}><Icon className="w-5 h-5" /></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-display font-bold">{s.value}</p></div>
            </Card>
          );
        })}
      </div>
      <Card>
        <h3 className="font-display font-semibold mb-3">Per-Product Performance</h3>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 px-3 text-right">Clicks</th>
                  <th className="py-2 px-3 text-right">Sales</th>
                  <th className="py-2 px-3 text-right">Conv. Rate</th>
                  <th className="py-2 pl-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const rate = p.clicks ? ((p.conversions || 0) / p.clicks) * 100 : 0;
                  return (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-3 truncate max-w-[200px]">{p.name}</td>
                      <td className="py-2 px-3 text-right">{p.clicks || 0}</td>
                      <td className="py-2 px-3 text-right">{p.conversions || 0}</td>
                      <td className="py-2 px-3 text-right">{rate.toFixed(1)}%</td>
                      <td className="py-2 pl-3 text-right text-accent">{usd(p.revenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}