import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Play, Eye, Clock, Zap, Search, Edit3, MoreVertical, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const MOCK_VIDEOS = [
  { id: 1, title: "How I Built My Creator Setup", status: "published", views: 12300, watchTime: 4.2, revenue: 89.50, unlocks: 12, isPremium: false, date: "Mar 28" },
  { id: 2, title: "Advanced Editing Tutorial — Pro Techniques", status: "premium", views: 3400, watchTime: 1.8, revenue: 340.00, unlocks: 89, isPremium: true, date: "Mar 22" },
  { id: 3, title: "Behind the Scenes: Studio Tour", status: "published", views: 8900, watchTime: 2.1, revenue: 45.00, unlocks: 0, isPremium: false, date: "Mar 15" },
  { id: 4, title: "Gear Review 2026 — Is It Worth It?", status: "draft", views: 0, watchTime: 0, revenue: 0, unlocks: 0, isPremium: false, date: "Apr 1" },
  { id: 5, title: "Collab with @topCreator", status: "published", views: 15600, watchTime: 5.4, revenue: 120.00, unlocks: 34, isPremium: false, date: "Mar 10" },
  { id: 6, title: "Monetize Your Content with $STREAMING", status: "premium", views: 5200, watchTime: 2.6, revenue: 520.00, unlocks: 104, isPremium: true, date: "Feb 28" },
  { id: 7, title: "My Growth Strategy This Year", status: "published", views: 21000, watchTime: 8.3, revenue: 210.00, unlocks: 58, isPremium: false, date: "Feb 20" },
  { id: 8, title: "Upcoming Series Preview", status: "draft", views: 0, watchTime: 0, revenue: 0, unlocks: 0, isPremium: false, date: "Apr 3" },
];

const STATUS_STYLES = {
  published: { cls: "bg-accent/10 text-accent border-accent/20", label: "Published" },
  premium: { cls: "bg-primary/10 text-primary border-primary/20", label: "Premium" },
  draft: { cls: "bg-muted text-muted-foreground border-border", label: "Draft" },
};

const SUMMARY = [
  { label: "Total Videos", value: "8", icon: Play, color: "text-primary" },
  { label: "Total Views", value: "66.4K", icon: Eye, color: "text-accent" },
  { label: "Watch Time", value: "24.4h", icon: Clock, color: "text-chart-3" },
  { label: "Revenue", value: "$1,324", icon: DollarSign, color: "text-chart-2" },
];

export default function VideoLibrary() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_VIDEOS
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {SUMMARY.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-display font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search videos..." className="pl-9 bg-secondary border-border" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All ({MOCK_VIDEOS.length})</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
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
                {video.isPremium && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-accent" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-black/60 px-1.5 py-0.5 rounded">{video.date}</div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2">{video.title}</h3>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.views > 0 ? `${(video.views / 1000).toFixed(1)}K` : "—"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {video.watchTime > 0 ? `${video.watchTime}h` : "—"}</span>
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

      {/* Pagination stub */}
      <div className="flex items-center justify-between mt-8 text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {MOCK_VIDEOS.length} videos</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled className="border-border">Previous</Button>
          <Button size="sm" variant="outline" className="border-border">Next</Button>
        </div>
      </div>
    </div>
  );
}