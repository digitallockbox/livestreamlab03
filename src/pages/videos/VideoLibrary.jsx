import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Eye, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const mockVideos = [
  { id: 1, title: "How I Built My Setup", thumbnail: "", status: "published", views: 12300, watchTime: 4.2, revenue: 89.50, isPremium: false },
  { id: 2, title: "Advanced Editing Tutorial", thumbnail: "", status: "premium", views: 3400, watchTime: 1.8, revenue: 340.00, isPremium: true },
  { id: 3, title: "Behind the Scenes", thumbnail: "", status: "published", views: 8900, watchTime: 2.1, revenue: 45.00, isPremium: false },
  { id: 4, title: "Gear Review 2026", thumbnail: "", status: "draft", views: 0, watchTime: 0, revenue: 0, isPremium: false },
  { id: 5, title: "Collab with @creator", thumbnail: "", status: "published", views: 15600, watchTime: 5.4, revenue: 120.00, isPremium: false },
];

const statusStyles = {
  published: "bg-accent/10 text-accent",
  premium: "bg-primary/10 text-primary",
  draft: "bg-muted text-muted-foreground",
};

export default function VideoLibrary() {
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? mockVideos : mockVideos.filter((v) => v.status === tab);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Video Library</h1>
          <p className="text-muted-foreground mt-1">Manage all your video content.</p>
        </div>
        <Link to="/videos/upload">
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Upload Video
          </Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((video) => (
          <div key={video.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all cursor-pointer group">
            <div className="aspect-video bg-secondary flex items-center justify-center relative">
              <Play className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              <Badge className={`absolute top-3 right-3 border-0 text-xs ${statusStyles[video.status]}`}>
                {video.status}
              </Badge>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-foreground text-sm truncate">{video.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(video.views / 1000).toFixed(1)}K</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {video.watchTime}h</span>
                {video.revenue > 0 && <span className="flex items-center gap-1 text-accent"><Zap className="w-3 h-3" /> ${video.revenue}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}