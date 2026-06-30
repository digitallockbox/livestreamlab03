import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { DollarSign, ShoppingBag, MousePointerClick, TrendingUp, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Spinner } from "@/components/creator/os";

const DAYS = 14;

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}
const dayKey = (d) => d.toISOString().slice(0, 10);
const dayLabel = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
const usd = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function SalesDashboard() {
  const { walletAddress } = useIdentity();
  const [tx, setTx] = useState([]);
  const [products, setProducts] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [storeSales, affiliateSales, prods, affs] = await Promise.all([
          base44.asServiceRole.entities.Transaction.filter({ type: "store_sale" }, "-created_date", 200).catch(() => []),
          base44.asServiceRole.entities.Transaction.filter({ type: "affiliate" }, "-created_date", 200).catch(() => []),
          walletAddress
            ? base44.asServiceRole.entities.Product.filter({ creator_wallet: walletAddress }, "-revenue", 50).catch(() => [])
            : [],
          base44.asServiceRole.entities.AffiliateLink.list("-commission_earned", 50).catch(() => []),
        ]);
        setTx([...(storeSales || []), ...(affiliateSales || [])]);
        setProducts(prods || []);
        setLinks(affs || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [walletAddress]);

  const { chartData, storeRevenue, affiliateRevenue, txCount } = useMemo(() => {
    const days = lastNDays(DAYS);
    const byDay = {};
    days.forEach((d) => { byDay[dayKey(d)] = { date: dayLabel(d), store: 0, affiliate: 0 }; });
    let sRev = 0, aRev = 0;
    (tx || []).forEach((t) => {
      if (!t.created_date) return;
      const k = dayKey(new Date(t.created_date));
      const amt = Number(t.amount || 0);
      if (t.type === "store_sale") { sRev += amt; if (byDay[k]) byDay[k].store += amt; }
      else if (t.type === "affiliate") { aRev += amt; if (byDay[k]) byDay[k].affiliate += amt; }
    });
    return { chartData: days.map((d) => byDay[dayKey(d)]), storeRevenue: sRev, affiliateRevenue: aRev, txCount: (tx || []).length };
  }, [tx]);

  if (loading) return <Page title="Sales Dashboard" subtitle="Daily revenue from products & affiliate links"><Spinner /></Page>;

  const totalRevenue = storeRevenue + affiliateRevenue;

  return (
    <Page title="Sales Dashboard" subtitle="Daily revenue from products & affiliate links">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><p className="text-xs text-muted-foreground inline-flex items-center gap-1"><DollarSign className="w-3 h-3" /> Total Revenue</p><p className="text-xl sm:text-2xl font-display font-bold text-accent">{usd(totalRevenue)}</p></Card>
        <Card><p className="text-xs text-muted-foreground inline-flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Product Sales</p><p className="text-xl sm:text-2xl font-display font-bold">{usd(storeRevenue)}</p></Card>
        <Card><p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> Affiliate</p><p className="text-xl sm:text-2xl font-display font-bold">{usd(affiliateRevenue)}</p></Card>
        <Card><p className="text-xs text-muted-foreground inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Transactions</p><p className="text-xl sm:text-2xl font-display font-bold">{txCount}</p></Card>
      </div>

      <Card>
        <h3 className="font-display font-semibold mb-4">Daily Revenue — Last {DAYS} Days</h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} interval="preserveStartEnd" />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }}
                formatter={(v) => usd(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="store" name="Products" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="affiliate" name="Affiliate" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-3">Top Products</h3>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          ) : (
            <div className="space-y-2">
              {products.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/50 last:border-0 text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">{p.sales_count || 0} sold · {usd(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="font-display font-semibold mb-3">Affiliate Links</h3>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracked affiliate links yet.</p>
          ) : (
            <div className="space-y-2">
              {links.slice(0, 8).map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/50 last:border-0 text-sm">
                  <span className="truncate flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                    {l.title || l.url}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">{l.clicks || 0} clicks · {usd(l.commission_earned)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}