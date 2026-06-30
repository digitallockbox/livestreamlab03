import React, { useState } from "react";
import { Search, Plus, Loader2, Upload, Link2 } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Card, Input, storeAPI } from "@/components/creator/os";
import { base44 } from "@/api/base44Client";

export default function AddProduct({ onAdded }) {
  const { walletAddress, signedInvoke } = useIdentity();

  // Amazon search + ASIN import
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [asinInput, setAsinInput] = useState("");
  const [addingAsin, setAddingAsin] = useState(false);

  // Custom product
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);

  const [status, setStatus] = useState("");

  const runSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    setStatus("");
    try {
      const res = await storeAPI.searchAmazon(search.trim());
      setResults(res.results || []);
      setStatus((res.results || []).length ? "" : "No results found");
    } catch {
      setStatus("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const addByAsin = async (asin) => {
    if (!walletAddress) return;
    setAddingAsin(true);
    setStatus("");
    try {
      const res = await signedInvoke("web3Store", { action: "addAmazon", creatorWallet: walletAddress, asin });
      setStatus(res.success ? `Added: ${res.product?.name || "Amazon product"}` : "Failed to add Amazon product");
      if (res.success) onAdded?.();
    } catch {
      setStatus("Failed to add Amazon product");
    } finally {
      setAddingAsin(false);
    }
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setStatus("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setImageUrl(file_url);
    } catch {
      setStatus("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addCustom = async (e) => {
    e.preventDefault();
    if (!walletAddress || !title.trim()) return;
    setAddingCustom(true);
    setStatus("");
    try {
      const res = await signedInvoke("web3Store", {
        action: "addCustom",
        creatorWallet: walletAddress,
        title: title.trim(),
        price,
        url,
        description,
        image_url: imageUrl,
      });
      setStatus(res.success ? "Custom product added" : "Failed to add custom product");
      if (res.success) {
        setTitle(""); setPrice(""); setUrl(""); setDescription(""); setImageUrl("");
        onAdded?.();
      }
    } catch {
      setStatus("Failed to add custom product");
    } finally {
      setAddingCustom(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Amazon search */}
      <Card className="space-y-3">
        <h3 className="font-display font-semibold flex items-center gap-2"><Search className="w-4 h-4 text-primary" /> Search Amazon Products</h3>
        <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Amazon (e.g. streaming microphone)" />
          <button type="submit" disabled={searching} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm whitespace-nowrap inline-flex items-center justify-center gap-1">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
          </button>
        </form>
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((r) => (
              <div key={r.asin} className="rounded-lg border border-border bg-muted/40 p-3 flex flex-col gap-2">
                <div className="aspect-square rounded bg-background overflow-hidden flex items-center justify-center">
                  {r.image_url ? <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" /> : <Search className="w-6 h-6 text-muted-foreground" />}
                </div>
                <p className="text-xs font-medium line-clamp-2">{r.title}</p>
                <p className="text-xs text-accent">{r.price || "—"}</p>
                <button onClick={() => addByAsin(r.asin)} disabled={addingAsin} className="mt-auto inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-primary/15 text-primary text-xs hover:bg-primary/25">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Import by ASIN/URL */}
      <Card className="space-y-3">
        <h3 className="font-display font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> Import by ASIN or Amazon URL</h3>
        <form onSubmit={(e) => { e.preventDefault(); addByAsin(asinInput); }} className="flex flex-col sm:flex-row gap-2">
          <Input value={asinInput} onChange={(e) => setAsinInput(e.target.value)} placeholder="B0XXXXXXXX or https://amazon.com/dp/B0XXXXXXXX" />
          <button type="submit" disabled={addingAsin || !asinInput.trim()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm whitespace-nowrap inline-flex items-center justify-center gap-1">
            {addingAsin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Import Product
          </button>
        </form>
        <p className="text-xs text-muted-foreground">Full details (title, price, description, image, features) are auto-fetched and your affiliate tag is applied automatically.</p>
      </Card>

      {/* Custom product */}
      <Card className="space-y-3">
        <h3 className="font-display font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Add Custom Product</h3>
        <form onSubmit={addCustom} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" />
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (USD)" type="number" min="0" step="0.01" />
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="External product URL (optional)" className="sm:col-span-2" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Product description" className="sm:col-span-2 w-full rounded-md border border-input bg-muted px-3 py-2" />
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 items-start">
            <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted cursor-pointer text-sm hover:bg-secondary/40">
              <Upload className="w-4 h-4" /> {imageUrl ? "Image uploaded ✓" : "Upload image"}
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
            {uploading && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</span>}
            {imageUrl && <img src={imageUrl} alt="" className="w-16 h-16 rounded object-cover" />}
            <button type="submit" disabled={addingCustom || !title.trim()} className="sm:ml-auto px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm inline-flex items-center gap-1">
              {addingCustom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Product
            </button>
          </div>
        </form>
      </Card>

      {status && <p className="text-sm text-muted-foreground text-center">{status}</p>}
    </div>
  );
}