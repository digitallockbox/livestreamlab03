import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package, Zap, Download, CheckCircle2, Loader2, ShoppingBag, ArrowRight, ExternalLink, Clock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Spinner } from "@/components/creator/os";

const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return String(d); }
};

// OrderHistory — a viewer's past digital purchases from the storefront.
// Lists store_sale Transactions where sender_wallet is the connected wallet,
// joined to their Product records for cover art and download links.
export default function OrderHistory() {
  const { walletAddress } = useIdentity();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    let active = true;
    base44.entities.Transaction.filter({ type: "store_sale", sender_wallet: walletAddress }, "-created_date", 100)
      .then(async (txns) => {
        if (!active) return;
        // Join each order to its product (for cover art + download link).
        const withProducts = await Promise.all((txns || []).map(async (t) => {
          let product = null;
          if (t.product_id) {
            try { product = await base44.entities.Product.get(t.product_id); } catch (_e) { product = null; }
          }
          return { ...t, product };
        }));
        if (active) setOrders(withProducts);
      })
      .catch(() => { if (active) setOrders([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [walletAddress]);

  const totals = useMemo(() => ({
    count: orders.length,
    spent: orders.reduce((s, o) => s + (o.streaming_amount || 0), 0),
  }), [orders]);

  if (!walletAddress) return <Page title="Order History"><Card><p className="text-sm text-muted-foreground">Connect your wallet to view your purchases.</p></Card></Page>;
  if (loading) return <Page title="Order History"><Spinner /></Page>;

  return (
    <Page title="Order History" subtitle="Your past digital purchases and download links">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShoppingBag className="w-3.5 h-3.5 text-primary" /> Orders</div>
          <p className="text-2xl font-display font-bold mt-1">{totals.count}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Zap className="w-3.5 h-3.5 text-accent" /> $STREAMING Spent</div>
          <p className="text-2xl font-display font-bold mt-1 text-accent">{totals.spent} ◎</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Completed</div>
          <p className="text-2xl font-display font-bold mt-1">{orders.filter((o) => o.status === "completed").length}</p>
        </Card>
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <Card className="text-center py-16">
          <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No purchases yet.</p>
          <p className="text-xs text-muted-foreground mb-4">Browse the catalog to find digital products.</p>
          <Link to="/store/catalog" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
            Browse Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const p = o.product;
            return (
              <Card key={o.id} className="flex flex-col sm:flex-row gap-4">
                <Link to={p ? `/store/${p.id}` : "#"} className="w-full sm:w-28 h-28 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                  {p?.image_url ? <img src={p.image_url} alt={p?.name || "Product"} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground/40" />}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold truncate">{p?.name || o.description || "Digital product"}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent inline-flex items-center gap-1"><Zap className="w-3 h-3" /> {o.streaming_amount} ◎</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {fmtDate(o.created_date)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "completed" ? "bg-accent/15 text-accent" : o.status === "pending" ? "bg-chart-3/15 text-chart-3" : "bg-destructive/15 text-destructive"}`}>
                        {o.status}
                      </span>
                      {o.recipient_wallet && <span className="text-xs text-muted-foreground font-mono">from {o.recipient_wallet.slice(0, 6)}…{o.recipient_wallet.slice(-4)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p?.file_url && (
                      <a href={p.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                        <Download className="w-4 h-4" /> Download
                      </a>
                    )}
                    {p?.external_url && (
                      <a href={p.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">
                        <ExternalLink className="w-4 h-4" /> Open
                      </a>
                    )}
                    {p && (
                      <Link to={`/store/${p.id}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-muted-foreground text-sm hover:text-foreground hover:bg-muted">
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
    </Page>
  );
}