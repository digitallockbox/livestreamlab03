import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useViewerWallet, marketplaceAPI, Page, Card, Input } from "@/components/creator/os";
import { CATEGORIES } from "@/components/creator/store/AddProduct";

export default function AddMarketplaceProduct() {
  const wallet = useViewerWallet();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "", price: "", streamingPrice: "", category: "Other" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!wallet || !form.name) return;
    setSaving(true);
    try {
      await marketplaceAPI.add(wallet, { name: form.name, description: form.description, price: Number(form.price) || 0, streamingPrice: Number(form.streamingPrice) || 0, category: form.category });
      navigate("/marketplace/products");
    } finally { setSaving(false); }
  };

  return (
    <Page title="Add Product" subtitle="Create a new digital product">
      <Card className="space-y-3 max-w-xl">
        <Input value={form.name} onChange={set("name")} placeholder="Name" />
        <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Description" className="w-full rounded-md border border-input bg-muted px-3 py-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input value={form.price} onChange={set("price")} type="number" placeholder="Price USD" />
          <Input value={form.streamingPrice} onChange={set("streamingPrice")} type="number" placeholder="$STREAMING" />
        </div>
        <select value={form.category} onChange={set("category")} className="w-full rounded-md border border-input bg-muted px-3 py-2">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{saving ? "Saving..." : "Publish"}</button>
      </Card>
    </Page>
  );
}