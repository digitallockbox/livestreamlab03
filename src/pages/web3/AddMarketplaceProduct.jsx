import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreator } from "@/hooks/web3/useCreator";
import { marketplace } from "@/lib/web3/marketplace";
import { toast } from "sonner";

export default function AddMarketplaceProduct() {
  const { profile } = useCreator();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    streamingPrice: "",
    imageUrl: "",
    category: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!profile?.wallet_address) {
      toast.error("Connect your wallet at /web3/login first");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Product name required");
      return;
    }
    setSaving(true);
    try {
      await marketplace.add(profile.wallet_address, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        streamingPrice: Number(form.streamingPrice) || 0,
        imageUrl: form.imageUrl.trim(),
        category: form.category.trim(),
      });
      toast.success("Product added");
      navigate("/web3/marketplace/products");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Add Product</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new digital product for your marketplace.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input value={form.name} onChange={set("name")} placeholder="Ebook, course, preset..." className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={set("description")} rows={3} className="bg-muted" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price (USD)</Label>
            <Input type="number" min={0} step="0.01" value={form.price} onChange={set("price")} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>$STREAMING Price</Label>
            <Input type="number" min={0} value={form.streamingPrice} onChange={set("streamingPrice")} className="bg-muted" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={form.category} onChange={set("category")} placeholder="Digital, course, preset..." className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." className="bg-muted" />
          </div>
        </div>
        <Button onClick={submit} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Publish Product
        </Button>
      </div>
    </div>
  );
}