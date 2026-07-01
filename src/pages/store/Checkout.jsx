import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Package, Zap, CheckCircle2, Loader2, ShieldCheck, Wallet, AlertCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";

// Checkout — viewers purchase a $STREAMING-priced digital product.
// Confirms the transaction via the web3Store 'purchase' action, which records
// a store_sale Transaction and increments the creator's product earnings.
export default function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { walletAddress, signedInvoke } = useIdentity();
  const { wallet, balance, refreshBalance } = useStreamingIdentity();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    setLoading(true);
    base44.entities.Product.get(productId)
      .then((p) => { if (!active) return; if (!p) setNotFound(true); else setProduct(p); })
      .catch(() => { if (active) setNotFound(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  const price = Number(product?.streaming_price || 0);
  const insufficient = walletAddress && balance < price;

  const handlePurchase = async () => {
    if (!walletAddress) { setError("Connect your wallet to purchase."); return; }
    if (price <= 0) { setError("This product isn't available for $STREAMING purchase."); return; }
    if (insufficient) { setError(`Insufficient $STREAMING balance. You need ${price} ◎ but have ${balance} ◎.`); return; }
    setPurchasing(true);
    setError("");
    try {
      const res = await signedInvoke("web3Store", { action: "purchase", productId });
      setSuccess({ transaction: res.transaction, product: res.product, price_streaming: res.price_streaming });
      refreshBalance?.();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-2xl mx-auto p-4 py-20 text-center space-y-3">
        <Package className="w-10 h-10 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Link to="/store/catalog" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to catalog
        </Link>
      </div>
    );
  }

  // Confirmation screen after successful purchase.
  if (success) {
    return (
      <div className="max-w-md mx-auto p-4 py-12">
        <div className="rounded-2xl border border-accent/30 bg-card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Purchase Confirmed</h1>
            <p className="text-sm text-muted-foreground mt-1">Your transaction has been recorded.</p>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium truncate max-w-[60%] text-right">{success.product?.name || product.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium text-accent inline-flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {success.price_streaming} $STREAMING</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-accent">Completed</span></div>
          </div>
          {product.file_url && (
            <a href={product.file_url} target="_blank" rel="noopener noreferrer" className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
              <Package className="w-4 h-4" /> Download Your File
            </a>
          )}
          <div className="flex gap-2">
            <Link to={`/store/${productId}`} className="flex-1 h-11 inline-flex items-center justify-center rounded-md border border-border text-sm hover:bg-muted">View Product</Link>
            <Link to="/store/catalog" className="flex-1 h-11 inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">Back to Catalog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to={`/store/${productId}`} className="hover:text-foreground transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> {product.name}
        </Link>
      </div>

      <h1 className="font-display text-2xl font-bold">Checkout</h1>

      {/* Order summary */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground/40" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold">{product.name}</p>
            {product.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>}
            <p className="text-xs text-muted-foreground mt-1 capitalize">{product.source || "own"} · {product.category || "uncategorized"}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium inline-flex items-center gap-1.5 text-accent"><Zap className="w-4 h-4" /> {price} $STREAMING</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network fee</span>
            <span className="text-muted-foreground">Included</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-medium">Total</span>
            <span className="font-display font-bold text-lg inline-flex items-center gap-1.5 text-accent"><Zap className="w-5 h-5" /> {price} $STREAMING</span>
          </div>
        </div>
      </div>

      {/* Payment method + balance */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-display font-semibold flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /> Payment Method</h3>
        <div className="rounded-lg bg-muted p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center"><Zap className="w-4 h-4 text-accent" /></div>
            <div>
              <p className="text-sm font-medium">$STREAMING Balance</p>
              <p className="text-xs text-muted-foreground">{walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Wallet not connected"}</p>
            </div>
          </div>
          <span className={`text-sm font-display font-bold ${insufficient ? "text-destructive" : "text-accent"}`}>{Number(balance).toFixed(2)} ◎</span>
        </div>
        {insufficient && (
          <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Insufficient balance — you need {price} ◎ to complete this purchase.</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={handlePurchase}
        disabled={purchasing || !walletAddress || insufficient || price <= 0}
        className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {purchasing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : <><ShieldCheck className="w-5 h-5" /> Confirm Purchase · {price} ◎</>}
      </button>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" /> Secure transaction · Creator earnings update instantly
      </p>
    </div>
  );
}