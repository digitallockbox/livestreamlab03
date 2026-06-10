import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Play, Eye, Clock, Zap, Search, Edit3, MoreVertical, DollarSign, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { contentApi } from "@/lib/creatorApi";

const STATUS_STYLES = {
  published: { cls: "bg-accent/10 text-accent border-accent/20", label: "Published" },
  premium: { cls: "bg-primary/10 text-primary border-primary/20", label: "Premium" },
  draft: { cls: "bg-muted text-muted-foreground border-border", label: "Draft" },
};

export default function VideoLibrary() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [videoList, stats] = await Promise.all([
          contentApi.listVideos(),
          contentApi.listVideos().then(v => ({
            total: v.length,
            views: v.reduce((sum, vid) => sum + (vid.views || 0), 0),
            watchTime: v.reduce((sum, vid) => sum + (vid.watch_time || 0), 0),
            revenue: v.reduce((sum, vid) => sum + (vid.revenue || 0), 0),
          })),
        ]);
        setVideos(videoList);
        setSummary(stats);
      } catch (err) {
        console.error('Video library load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = videos
    .filter(v => tab === "all" || v.status === tab)
    .filter(v => v.title.toLowerCase().includes(search.toLowerCase()));


  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Video Library</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your video content.</p>
        </div>
        <Link to="/upload-video">
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Upload Video
          </Button>
        </Link>
      </div>

      {/* Summary Strip */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse"><div className="h-4 bg-muted rounded w-20 mb-2"></div><div className="h-6 bg-muted rounded w-16"></div></div>)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Videos", value: summary.total?.toString() || "0", icon: Play, color: "text-primary" },
            { label: "Total Views", value: `${(summary.views / 1000).toFixed(1)}K`, icon: Eye, color: "text-accent" },
            { label: "Watch Time", value: `${(summary.watchTime / 60).toFixed(1)}h`, icon: Clock, color: "text-chart-3" },
            { label: "Revenue", value: `$${summary.revenue?.toFixed(0) || "0"}`, icon: DollarSign, color: "text-chart-2" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-display font-bold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search videos..." className="pl-9 bg-secondary border-border" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All ({videos.length})</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading videos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No videos found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((video) => (
            <div key={video.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group">
              {/* Thumbnail */}
              <div className="aspect-video bg-secondary relative flex items-center justify-center">
                <Play className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary/70 transition-colors" />
                <Badge className={`absolute top-2 left-2 text-xs border ${STATUS_STYLES[video.status].cls}`}>
                  {STATUS_STYLES[video.status].label}
                </Badge>
                {video.is_premium && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-accent" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-black/60 px-1.5 py-0.5 rounded">{new Date(video.created_date).toLocaleDateString()}</div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2">{video.title}</h3>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.views > 0 ? `${(video.views / 1000).toFixed(1)}K` : "—"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {video.watch_time_hours > 0 ? `${video.watch_time_hours.toFixed(1)}h` : "—"}</span>
                  {video.revenue > 0 && <span className="flex items-center gap-1 text-accent"><Zap className="w-3 h-3" /> ${video.revenue.toFixed(0)}</span>}
                </div>
              </div>

              {/* Footer */}
              <div className="px-3 pb-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1.5 border-border">
                  <Edit3 className="w-3 h-3" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {videos.length} videos</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled className="border-border">Previous</Button>
          <Button size="sm" variant="outline" className="border-border">Next</Button>
        </div>
      </div>
    </div>
  );
}