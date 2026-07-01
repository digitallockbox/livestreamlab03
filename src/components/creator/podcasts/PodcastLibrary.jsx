import React, { useEffect, useMemo, useState } from "react";
import { Headphones, Search, Play, Clock, Mic2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// PodcastLibrary — public browse + play view for published episodes across
// the network, with search and series filtering. Plays episodes inline via a
// sticky audio player.
export default function PodcastLibrary() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [series, setSeries] = useState("all");
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.PodcastEpisode.filter({ status: "published" }, "-created_date", 500)
      .then((d) => { if (active) setEpisodes(d || []); })
      .catch(() => { if (active) setEpisodes([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const seriesList = useMemo(() => ["all", ...new Set(episodes.map((e) => e.series).filter(Boolean))], [episodes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return episodes.filter((e) =>
      (series === "all" || e.series === series) &&
      (!q || (e.title || "").toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q))
    );
  }, [episodes, series, search]);

  const trackPlay = async (ep) => {
    setPlaying(ep);
    try { await base44.entities.PodcastEpisode.update(ep.id, { listens: (ep.listens || 0) + 1 }); } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6 pb-28">
      <div>
        <h1 className="font-display text-2xl font-bold">Podcast Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and play published episodes from across the network.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search episodes…" className="w-full rounded-md border border-input bg-secondary pl-9 pr-3 py-2 text-sm focus:outline-none" />
        </div>
        <select value={series} onChange={(e) => setSeries(e.target.value)} className="rounded-md border border-input bg-secondary px-3 py-2 text-sm">
          {seriesList.map((s) => <option key={s} value={s}>{s === "all" ? "All series" : s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Headphones className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No episodes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ep) => (
            <div key={ep.id} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
              {ep.thumbnail_url ? <img src={ep.thumbnail_url} alt="" className="w-full h-32 rounded-lg object-cover" /> : <div className="w-full h-32 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center"><Mic2 className="w-8 h-8 text-primary/60" /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary uppercase tracking-wide">{ep.series || "Uncategorized"}</p>
                <h3 className="font-display font-semibold text-sm truncate mt-0.5">{ep.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ep.description || ""}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Headphones className="w-3 h-3" /> {ep.listens || 0}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ep.duration_minutes || 0}m</span>
              </div>
              <button onClick={() => trackPlay(ep)} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                <Play className="w-4 h-4" /> Play
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sticky player */}
      {playing && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{playing.title}</p>
              <p className="text-xs text-muted-foreground truncate">{playing.series || "Uncategorized"}</p>
            </div>
            <audio key={playing.id} src={playing.audio_url} autoPlay controls className="max-w-md w-full" />
            <button onClick={() => setPlaying(null)} className="text-xs text-muted-foreground hover:text-foreground px-2 shrink-0">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}