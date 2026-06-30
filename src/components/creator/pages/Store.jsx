import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink, Package } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Spinner, Input, storeAPI } from "@/components/creator/os";

export default function Store() {
  const { walletAddress } = useIdentity();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");

  const load = (searchTerm) => {
    setLoading(true);
    storeAPI.list(walletAddress, searchTerm)
      .then((r) => setProducts(r.products || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(""); /* eslint-disable-next-line */ }, [walletAddress]);

  const submitSearch = (e) => {
    e.preventDefault();
    setTerm(search.trim());
    load(search.trim());
  };

  const viewAmazon = (p) => {
    storeAPI.click({ title: p.title, url: p.url, source: "amazon", asin: p.asin }).catch(() => {});
    window.open(p.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Page title="Store" subtitle="Your products + Amazon affiliate catalog">
      <Card className="space-y-3">
        <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Amazon (e.g. streaming equipment)" />
          <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm whitespace-nowrap inline-flex items-center justify-center gap-1">
            <Search className="w-4 h-4" /> Search
          </button>
        </form>
        <p className="text-xs text-muted-foreground">
          {term ? `Amazon results for "${term}" + your store items` : "Recommended Amazon products + your own store items"}
        </p>
      </Card>

      {loading ? <Spinner /> : products.length === 0 ? (
        <Card><p className="text-sm text-muted-foreground">No products found. Try a different search.</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id || p.asin} className="flex flex-col gap-3">
              <div className="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm line-clamp-2">{p.title}</p>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <span className="text-accent font-medium text-sm whitespace-nowrap">
                    {p.source === "amazon" ? (p.price || "—") : (p.streaming_price ? `${p.streaming_price} ◎` : `$${Number(p.price || 0).toFixed(2)}`)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${p.source === "amazon" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>
                    {p.source === "amazon" ? "Amazon" : "Yours"}
                  </span>
                </div>
              </div>
              {p.source === "amazon" ? (
                <button onClick={() => viewAmazon(p)} className="mt-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">
                  <ExternalLink className="w-4 h-4" /> View on Amazon
                </button>
              ) : (
                <Link to="/marketplace/products" className="mt-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">
                  <Package className="w-4 h-4" /> Manage in Marketplace
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}