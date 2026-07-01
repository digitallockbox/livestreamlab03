import React, { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Radio, Video, Mic2, MessageSquare, FileText, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPE_ICON = { stream: Radio, video: Video, podcast: Mic2, social: MessageSquare, post: FileText };
const COLUMNS = [
  { key: "planned", label: "Planned", color: "text-muted-foreground" },
  { key: "active", label: "In Progress", color: "text-chart-3" },
  { key: "done", label: "Done", color: "text-accent" },
];

// StrategyBoard — monthly content strategy kanban. Creators add plan items
// (title, date, type, notes) and advance them Planned → In Progress → Done.
export default function StrategyBoard({ wallet, month }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", date: `${month}-01`, type: "stream", notes: "" });

  const load = () => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    base44.entities.ContentPlan.filter({ creator_wallet: wallet }, "date", 500)
      .then((d) => { if (active) setItems((d || []).filter((p) => (p.date || "").slice(0, 7) === month)); })
      .catch(() => { if (active) setItems([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  };
  useEffect(() => load(), [wallet, month]);

  const add = async () => {
    if (!form.title.trim()) return;
    await base44.entities.ContentPlan.create({ ...form, creator_wallet: wallet });
    setForm({ title: "", date: `${month}-01`, type: "stream", notes: "" });
    load();
  };
  const advance = async (p) => {
    const next = p.status === "planned" ? "active" : "done";
    await base44.entities.ContentPlan.update(p.id, { status: next });
    load();
  };
  const remove = async (p) => { await base44.entities.ContentPlan.delete(p.id); load(); };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Content Strategy Board</h2>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4">
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Plan title (e.g. Weekly talk show)" className="sm:col-span-5 rounded-md border border-input bg-muted px-3 py-2 text-sm" />
        <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="sm:col-span-3 rounded-md border border-input bg-muted px-3 py-2 text-sm" />
        <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="sm:col-span-2 rounded-md border border-input bg-muted px-3 py-2 text-sm">
          {Object.keys(TYPE_ICON).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={add} className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {COLUMNS.map((col) => {
            const colItems = items.filter((p) => p.status === col.key);
            return (
              <div key={col.key} className="rounded-xl bg-muted/40 border border-border p-3 min-h-[120px]">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-muted-foreground">{colItems.length}</span>
                </div>
                <div className="space-y-2">
                  {colItems.map((p) => {
                    const Icon = TYPE_ICON[p.type] || FileText;
                    return (
                      <div key={p.id} className="rounded-lg bg-card border border-border p-3">
                        <div className="flex items-start gap-2">
                          <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.title}</p>
                            {p.date && <p className="text-[11px] text-muted-foreground">{p.date}</p>}
                            {p.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {col.key !== "done" && (
                            <button onClick={() => advance(p)} className="text-[11px] px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                              → {col.key === "planned" ? "Start" : "Complete"}
                            </button>
                          )}
                          <button onClick={() => remove(p)} className="text-[11px] text-muted-foreground hover:text-destructive px-2 py-1 rounded-md hover:bg-destructive/10">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {colItems.length === 0 && <p className="text-xs text-muted-foreground/60 text-center py-4">No items</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}