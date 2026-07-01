import React, { useEffect, useMemo, useState } from "react";
import { Mic2, Loader2, Plus, Trash2, Eye, EyeOff, Save, Play, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";

const empty = { title: "", description: "", series: "", audio_url: "", thumbnail_url: "", show_notes: "", status: "draft" };

// PodcastManager — upload episodes with descriptions, organize them into
// series, and publish/unpublish. Bound to the PodcastEpisode entity scoped
// to the connected creator's wallet.
export default function PodcastManager() {
  const { walletAddress } = useIdentity();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!walletAddress) { setLoading(false); return; }
    let active = true;
    base44.entities.PodcastEpisode.filter({ creator_wallet: walletAddress }, "-created_date", 200)
      .then((d) => { if (active) setEpisodes(d || []); })
      .catch(() => { if (active) setEpisodes([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  };
  useEffect(() => load(), [walletAddress]);

  const seriesList = useMemo(() => [...new Set(episodes.map((e) => e.series).filter(Boolean))], [episodes]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!walletAddress || !form.title.trim()) return;
    setBusy(true);
    try {
      let audio_url = form.audio_url;
      if (file) {
        const res = await base44.integrations.Core.UploadFile({ file });
        audio_url = res.file_url;
      }
      if (!audio_url) return;
      await base44.entities.PodcastEpisode.create({ ...form, audio_url, creator_wallet: walletAddress });
      setForm(empty); setFile(null);
      load();
    } finally { setBusy(false); }
  };

  const togglePublish = async (ep) => {
    await base44.entities.PodcastEpisode.update(ep.id, { status: ep.status === "published" ? "draft" : "published" });
    load();
  };
  const remove = async (ep) => {
    await base44.entities.PodcastEpisode.delete(ep.id);
    load();
  };

  const grouped = useMemo(() => {
    const map = new Map();
    for (const ep of episodes) {
      const key = ep.series || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ep);
    }
    return Array.from(map.entries());
  }, [episodes]);

  if (!walletAddress) return <div className="p-6 max-w-3xl mx-auto"><p className="text-sm text-muted-foreground">Connect your wallet to manage podcasts.</p></div>;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">Podcast Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload episodes, add descriptions, and organize them into series.</p>
        </div>
        <Link to="/podcasts/analytics" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">
          <BarChart3 className="w-4 h-4" /> Analytics
        </Link>
      </div>

      {/* Upload form */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-display font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> New Episode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.title} onChange={set("title")} placeholder="Episode title *" className="rounded-md border border-input bg-muted px-3 py-2 text-sm" />
          <input value={form.series} onChange={set("series")} placeholder="Series name (e.g. The Creator Show)" list="series-suggest" className="rounded-md border border-input bg-muted px-3 py-2 text-sm" />
          <datalist id="series-suggest">{seriesList.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
        <textarea value={form.description} onChange={set("description")} placeholder="Episode description" rows={3} className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
        <textarea value={form.show_notes} onChange={set("show_notes")} placeholder="Show notes (optional)" rows={2} className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
        <input value={form.thumbnail_url} onChange={set("thumbnail_url")} placeholder="Thumbnail image URL (optional)" className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Audio file</label>
            <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">…or paste an audio URL</label>
            <input value={form.audio_url} onChange={set("audio_url")} placeholder="https://…/episode.mp3" className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <select value={form.status} onChange={set("status")} className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
            <option value="draft">Save as Draft</option>
            <option value="published">Publish immediately</option>
          </select>
          <button onClick={submit} disabled={busy || !form.title.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {busy ? "Saving…" : "Save Episode"}
          </button>
        </div>
      </div>

      {/* Episodes grouped by series */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : episodes.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Mic2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No episodes yet. Upload your first episode above.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([series, eps]) => (
            <div key={series}>
              <h3 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">{series}</h3>
              <div className="space-y-2">
                {eps.map((ep) => (
                  <div key={ep.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                    {ep.thumbnail_url ? <img src={ep.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Mic2 className="w-5 h-5 text-primary" /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ep.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{ep.description || "No description"}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {ep.listens || 0} listens</span>
                        <span>{ep.duration_minutes || 0}m</span>
                        <span className={`px-1.5 py-0.5 rounded-full ${ep.status === "published" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{ep.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => togglePublish(ep)} title={ep.status === "published" ? "Unpublish" : "Publish"} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                        {ep.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => remove(ep)} title="Delete" className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}