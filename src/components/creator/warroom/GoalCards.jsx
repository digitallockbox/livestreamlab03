import React, { useEffect, useState } from "react";
import { Radio, Headphones, DollarSign, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const sameMonth = (iso, month) => iso && new Date(iso).toISOString().slice(0, 7) === month;

// GoalCards — editable monthly performance targets with live progress vs
// actuals pulled from the creator's streams and episodes for the month.
export default function GoalCards({ wallet, month }) {
  const [goal, setGoal] = useState(null);
  const [targets, setTargets] = useState({ target_streams: 0, target_listens: 0, target_revenue: 0 });
  const [actual, setActual] = useState({ streams: 0, listens: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const [goals, streams, episodes] = await Promise.all([
          base44.entities.CreatorGoal.filter({ creator_wallet: wallet, month }, "-created_date", 5).catch(() => []),
          base44.entities.Stream.filter({ creator_wallet: wallet }, "-created_date", 200).catch(() => []),
          base44.entities.PodcastEpisode.filter({ creator_wallet: wallet }, "-created_date", 200).catch(() => []),
        ]);
        if (!active) return;
        const g = goals[0] || null;
        setGoal(g);
        setTargets({ target_streams: g?.target_streams || 0, target_listens: g?.target_listens || 0, target_revenue: g?.target_revenue || 0 });
        const ms = streams.filter((s) => sameMonth(s.created_date, month));
        const me = episodes.filter((e) => sameMonth(e.created_date, month));
        setActual({
          streams: ms.length,
          listens: me.reduce((a, e) => a + (e.listens || 0), 0),
          revenue: ms.reduce((a, s) => a + (s.tips_earned || 0), 0) + me.reduce((a, e) => a + (e.revenue || 0), 0),
        });
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [wallet, month]);

  const save = async () => {
    setSaving(true);
    try {
      if (goal) {
        await base44.entities.CreatorGoal.update(goal.id, targets);
      } else {
        const g = await base44.entities.CreatorGoal.create({ ...targets, creator_wallet: wallet, month });
        setGoal(g);
      }
    } finally { setSaving(false); }
  };

  const cards = [
    { key: "target_streams", label: "Streams", actual: actual.streams, icon: Radio, color: "text-primary", bg: "bg-primary/10" },
    { key: "target_listens", label: "Listens", actual: actual.listens, icon: Headphones, color: "text-chart-4", bg: "bg-chart-4/10" },
    { key: "target_revenue", label: "Revenue ($)", actual: actual.revenue, icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
  ];

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c) => {
          const t = Number(targets[c.key] || 0);
          const pct = t > 0 ? Math.min(100, Math.round((c.actual / t) * 100)) : 0;
          const Icon = c.icon;
          return (
            <div key={c.key} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${c.color}`} /></div>
                <span className="text-xs text-muted-foreground">{c.actual.toLocaleString()} / {Number(targets[c.key] || 0).toLocaleString()}</span>
              </div>
              <input
                type="number" min={0} value={targets[c.key]}
                onChange={(e) => setTargets((t) => ({ ...t, [c.key]: Number(e.target.value) }))}
                className="w-full rounded-md border border-input bg-muted px-2 py-1 text-xs mb-2"
                placeholder="Target"
              />
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${c.color} bg-current`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{c.label} · {pct}%</p>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Goals
        </button>
      </div>
    </div>
  );
}