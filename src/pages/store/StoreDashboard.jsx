import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package, Plus, BarChart3, ShoppingBag, Zap, TrendingUp, MousePointerClick,
  DollarSign, ArrowRight, ExternalLink, Star, Store as StoreIcon,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Spinner } from "@/components/creator/os";

const usd = (n) => (Number(n) > 0 ? `$${Number(n).toFixed(2)}` : "—");

// StoreDashboard — management hub for the creator's storefront.
// Overview stats, quick actions, recent products, and top performers.
// Bound to the Product entity (filtered by creator_wallet).
export default function StoreDashboard() {
  const { walletAddress } = useIdentity();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    let active = true;
    base44.entities.Product.filter({ creator_wallet: walletAddress }, "-created_date", 100)
      .then((data) => { if (active) setProducts(data || []); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [walletAddress]);

  const stats = useMemo(() => {
    const published = products.filter((p) => p.status === "published").length;
    const revenue = products.reduce((s, p) => s + (p.revenue || 0), 0);
    const clicks = products.reduce((s, p) => s + (p.clicks || 0), 0);
    const sales = products.reduce((s, p) => s + (p.sales_count || 0), 0);
    const streaming = products.filter((p) => (p.streaming_price || 0) > 0).length;
    return { total: products.length, published, revenue, clicks, sales, streaming };
  }, [products]);

  const recent = useMemo(
    () => [...products].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)).slice(0, 5),
    [products]
  );
  const topPerformers = useMemo(
    () => [...products].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0) || (b.revenue || 0) - (a.revenue || 0)).slice(0, 5),
    [products]
  );

  if (!walletAddress) return <Page title="Storefront"><Card><p className="text-sm text-muted-foreground">Connect your wallet to manage your store.</p></Card></Page>;
  if (loading) return <Page title="Storefront"><Spinner /></Page>;

  return (
    <Page title="Storefront" subtitle="List and manage your digital assets for sale">
      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/store/add" className="group">
          <Card className="h-full hover:border-primary/40 transition-colors flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/15 text-primary"><Plus className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="font-display font-semibold text-sm">Add Product</p>
              <p className="text-xs text-muted-foreground">Amazon import or custom</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Card>
        </Link>
        <Link to="/store/catalog" className="group">
          <Card className="h-full hover:border-primary/40 transition-colors flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/15 text-accent"><Package className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="font-display font-semibold text-sm">Browse Catalog</p>
              <p className="text-xs text-muted-foreground">{stats.total} products listed</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Card>
        </Link>
        <Link to="/marketplace/sales" className="group">
          <Card className="h-full hover:border-primary/40 transition-colors flex items-center gap-3">
            <div className="p-3 rounded-lg bg-chart-4/15 text-chart-4"><BarChart3 className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="font-display font-semibold text-sm">Sales Analytics</p>
              <p className="text-xs text-muted-foreground">Revenue & conversions</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Card>
        </Link>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><StoreIcon className="w-3.5 h-3.5 text-primary" /> Total Products</div>
          <p className="text-2xl font-display font-bold mt-1">{stats.total}</p>
          <p className="text-xs text-accent mt-0.5">{stats.published} published</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><DollarSign className="w-3.5 h-3.5 text-accent" /> Revenue</div>
          <p className="text-2xl font-display font-bold mt-1 text-accent">{usd(stats.revenue)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stats.sales} units sold</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MousePointerClick className="w-3.5 h-3.5 text-chart-4" /> Clicks</div>
          <p className="text-2xl font-display font-bold mt-1">{stats.clicks.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stats.clicks ? ((stats.sales / stats.clicks) * 100).toFixed(1) : 0}% conv.</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Zap className="w-3.5 h-3.5 text-primary" /> $STREAMING Priced</div>
          <p className="text-2xl font-display font-bold mt-1 text-primary">{stats.streaming}</p>
          <p className="text-xs text-muted-foreground mt-0.5">token-priced items</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Recently Added</h3>
            <Link to="/store/catalog" className="text-xs text-primary hover:underline inline-flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No products yet.</p>
              <Link to="/store/add" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add your first product
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((p) => (
                <Link key={p.id} to={`/store/${p.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group">
                  <div className="w-12 h-12 rounded-md bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-muted-foreground/40" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.source || "own"} · {p.category || "uncategorized"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-accent">{p.source === "own" && (p.streaming_price ? `${p.streaming_price} ◎` : usd(p.price))}{p.source !== "own" && usd(p.price)}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${p.status === "published" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Top performers */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Top Performers</h3>
            <span className="text-xs text-muted-foreground">By sales</span>
          </div>
          {topPerformers.filter((p) => (p.sales_count || 0) > 0).length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No sales recorded yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Sales will appear here once viewers start buying.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topPerformers.map((p, i) => (
                <Link key={p.id} to={`/store/${p.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-yellow-500/20 text-yellow-500" : i === 1 ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                  <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-muted-foreground/40" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sales_count || 0} sold · {p.clicks || 0} clicks</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-accent">{usd(p.revenue)}</p>
                    {p.rating > 0 && <p className="text-xs text-muted-foreground inline-flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-current text-yellow-500" /> {p.rating.toFixed(1)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* CTA banner */}
      <Card className="bg-gradient-card border-primary/20">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/15 text-primary"><Plus className="w-6 h-6" /></div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display font-bold">Grow your catalog</h3>
            <p className="text-sm text-muted-foreground">Add digital downloads, courses, memberships, or Amazon affiliate products to start earning.</p>
          </div>
          <Link to="/store/add" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shrink-0">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </Card>
    </Page>
  );
}