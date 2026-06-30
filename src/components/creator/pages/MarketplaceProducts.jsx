import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useViewerWallet, marketplaceAPI, Page, Card, Spinner } from "@/components/creator/os";
import ProductCard from "@/components/creator/marketplace/ProductCard";

export default function MarketplaceProducts() {
  const wallet = useViewerWallet();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    marketplaceAPI.list(wallet).then((r) => setProducts(r.products || [])).finally(() => setLoading(false));
  }, [wallet]);

  if (loading) return <Page title="Products" subtitle="Your marketplace catalog"><Spinner /></Page>;

  return (
    <Page title="Products" subtitle="Your marketplace catalog">
      <div className="flex justify-end">
        <Link to="/marketplace/add" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>
      {products.length === 0 ? (
        <Card><p className="text-sm text-muted-foreground">No products yet. Add your first.</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </Page>
  );
}