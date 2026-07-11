import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle2, Layers, ChevronDown, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";

const CATEGORIES = ["Tech", "Gaming", "Audio", "Streaming", "Lifestyle", "Fitness", "Finance", "Other"];

// BulkAddLinks — paste multiple product URLs + titles and create tracking
// links in one batch. Uses AffiliateLink.bulkCreate so all rows land in a
// single request. Default category applies to every row unless overridden.
export default function BulkAddLinks() {
  const { walletAddress } = useIdentity();
  const [rows, setRows] = useState([
    { title: "", url: "", category: "Tech" },
    { title: "", url: "", category: "Tech" },
  ]);
  const [defaultCategory, setDefaultCategory] = useState("Tech");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(0);

  const updateRow = (i, field, val) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, { title: "", url: "", category: defaultCategory }]);

  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const applyCategoryToAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, category: defaultCategory })));
  };

  const handleBulkPaste = (e) => {
    const text = e.target.value;
    const lines = text.split("\n").filter((l) => l.trim());
    const parsed = lines.map((line) => {
      const sep = line.includes("\t") ? "\t" : line.includes(",") ? "," : " | ";
      const [title, url] = line.split(sep).map((s) => s.trim());
      return { title: title || "", url: url || "", category: defaultCategory };
    }).filter((r) => r.title || r.url);
    if (parsed.length) {
      setRows(parsed);
    }
    e.target.value = "";
  };

  const validRows = rows.filter((r) => r.title.trim() && r.url.trim());

  const handleSave = async () => {
    if (!walletAddress) { setError("Connect your wallet first."); return; }
    if (validRows.length === 0) { setError("Add at least one link with a title and URL."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = validRows.map((r) => ({
        title: r.title.trim(),
        url: r.url.trim(),
        category: r.category,
        creator_wallet: walletAddress,
        clicks: 0,
        conversions: 0,
        commission_earned: 0,
        streaming_bonus: 0,
      }));
      await base44.entities.AffiliateLink.bulkCreate(payload);
      setCreated(payload.length);
      setRows([{ title: "", url: "", category: defaultCategory }]);
    } catch (e) {
      setError(e?.message || "Failed to create links.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/affiliates" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Bulk Add Links</h1>
          <p className="text-sm text-muted-foreground mt-1">Create tracking links for multiple products at once.</p>
        </div>
      </div>

      {created > 0 && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
          <p className="text-sm text-accent font-medium">{created} link{created === 1 ? "" : "s"} created successfully.</p>
        </div>
      )}

      {/* Bulk paste */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold">Bulk Paste</h3>
        </div>
        <p className="text-xs text-muted-foreground">Paste tab/comma-separated lines of <code className="text-foreground">Title, URL</code> to auto-fill rows below.</p>
        <textarea
          onBlur={handleBulkPaste}
          placeholder={"Blue Yeti Microphone, https://amazon.com/dp/B00N1YPXSW\nLogitech G Pro, https://amazon.com/dp/B07G3QBS4C"}
          rows={3}
          className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm font-mono focus:outline-none resize-y"
        />
      </div>

      {/* Default category */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs text-muted-foreground">Default category for new rows:</label>
          <div className="relative">
            <select value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value)} className="rounded-md border border-input bg-secondary px-3 py-1.5 text-sm appearance-none focus:outline-none pr-8">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button onClick={applyCategoryToAll} className="text-xs text-primary hover:underline ml-auto">Apply to all</button>
        </div>
      </div>

      {/* Rows */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold">Links ({validRows.length} valid)</h3>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <input
                value={row.title}
                onChange={(e) => updateRow(i, "title", e.target.value)}
                placeholder="Product title"
                className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  value={row.url}
                  onChange={(e) => updateRow(i, "url", e.target.value)}
                  placeholder="https://affiliate-url.com/ref/yourcode"
                  className="flex-1 rounded-md border border-input bg-secondary px-3 py-2 text-sm focus:outline-none"
                />
                <div className="relative">
                  <select
                    value={row.category}
                    onChange={(e) => updateRow(i, "category", e.target.value)}
                    className="h-9 rounded-md border border-input bg-secondary px-3 text-sm appearance-none focus:outline-none pr-8"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <button
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              className="mt-1 h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 shrink-0"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={addRow} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1">
          <Plus className="w-4 h-4" /> Add row
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/affiliates" className="flex-1 h-11 inline-flex items-center justify-center rounded-md border border-border text-sm hover:bg-muted">Cancel</Link>
        <button
          onClick={handleSave}
          disabled={saving || validRows.length === 0}
          className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Create {validRows.length} Link{validRows.length === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );
}