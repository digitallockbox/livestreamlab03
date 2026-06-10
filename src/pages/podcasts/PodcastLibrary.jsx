import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Mic, Headphones, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { contentApi } from "@/lib/creatorApi";

export default function PodcastLibrary() {
  const [tab, setTab] = useState("all");
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await contentApi.listPodcasts();
        setEpisodes(data);
      } catch (err) {
        console.error('Podcast library load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = tab === "all" || tab === "series" ? episodes : episodes.filter((e) => e.status === tab);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Podcast Library</h1>
          <p className="text-muted-foreground mt-1">Manage your podcast episodes and series.</p>
        </div>
        <Link to="/podcasts/upload">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Upload Episode</Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="all">Episodes</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading episodes...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ep) => (
            <div key={ep.id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/20 transition-all cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">{ep.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{ep.series}</p>
              </div>
              <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Headphones className="w-3 h-3" /> {ep.listens || 0}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ep.duration_minutes || 0}m</span>
              </div>
              <Badge className={`border-0 text-xs ${ep.status === "published" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                {ep.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}