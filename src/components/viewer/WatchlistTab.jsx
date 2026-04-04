import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Bookmark, Trash2, Play, Headphones, Radio } from "lucide-react";

const TYPE_CONFIG = {
  video:   { icon: Play,        color: "text-primary",   bg: "bg-primary/10 text-primary border-primary/20",   label: "Video" },
  podcast: { icon: Headphones,  color: "text-chart-3",   bg: "bg-chart-3/10 text-chart-3 border-chart-3/20",   label: "Podcast" },
  stream:  { icon: Radio,       color: "text-destructive",bg: "bg-destructive/10 text-destructive border-destructive/20", label: "Stream" },
};

export default function WatchlistTab({ profile, onUpdate }) {
  const items = profile?.watchlist || [];

  const removeItem = async (contentId) => {
    const updated = await base44.entities.ViewerProfile.update(profile.id, {
      watchlist: items.filter(i => i.content_id !== contentId)
    });
    onUpdate(updated);
  };

  if (items.length === 0) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center mt-4">
      <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-foreground font-medium mb-1">Your watchlist is empty</p>
      <p className="text-sm text-muted-foreground">Save videos, podcasts, and streams to watch later.</p>
    </div>
  );

  return (
    <div className="space-y-3 mt-4">
      {items.map((item) => {
        const cfg = TYPE_CONFIG[item.content_type] || TYPE_CONFIG.video;
        const Icon = cfg.icon;
        return (
          <div key={item.content_id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
              {item.thumbnail_url
                ? <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                : <Icon className={`w-5 h-5 ${cfg.color}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs border ${cfg.bg}`}>{cfg.label}</Badge>
                {item.added_at && (
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(item.added_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" className="h-8 text-xs gap-1.5"><Icon className="w-3.5 h-3.5" />Watch</Button>
              <Button size="sm" variant="ghost" onClick={() => removeItem(item.content_id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}