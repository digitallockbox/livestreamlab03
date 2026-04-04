import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Download, Zap, DollarSign } from "lucide-react";

const TYPE_CONFIG = {
  store_item:    { label: "Store",       bg: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  ppv:           { label: "PPV Event",   bg: "bg-destructive/10 text-destructive border-destructive/20" },
  video_unlock:  { label: "Video",       bg: "bg-primary/10 text-primary border-primary/20" },
  membership:    { label: "Membership",  bg: "bg-accent/10 text-accent border-accent/20" },
};

export default function PurchaseHistoryTab({ profile }) {
  const items = [...(profile?.purchase_history || [])].sort(
    (a, b) => new Date(b.purchased_at) - new Date(a.purchased_at)
  );

  if (items.length === 0) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center mt-4">
      <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-foreground font-medium mb-1">No purchases yet</p>
      <p className="text-sm text-muted-foreground">Your digital goods, store items, and PPV events will appear here.</p>
    </div>
  );

  const totalUsd = items.reduce((s, i) => s + (i.amount_usd || 0), 0);
  const totalStreaming = items.reduce((s, i) => s + (i.amount_streaming || 0), 0);

  return (
    <div className="space-y-4 mt-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-chart-3" />
          <div>
            <p className="text-xs text-muted-foreground">Total Spent (USD)</p>
            <p className="text-lg font-bold font-display text-foreground">${totalUsd.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Total Spent ($STREAMING)</p>
            <p className="text-lg font-bold font-display text-foreground">{totalStreaming.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, i) => {
          const cfg = TYPE_CONFIG[item.item_type] || TYPE_CONFIG.store_item;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.item_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs border ${cfg.bg}`}>{cfg.label}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.purchased_at ? new Date(item.purchased_at).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {item.amount_usd > 0 && (
                  <p className="text-sm font-semibold text-foreground">${item.amount_usd.toFixed(2)}</p>
                )}
                {item.amount_streaming > 0 && (
                  <p className="text-xs text-accent flex items-center gap-1 justify-end">
                    <Zap className="w-3 h-3" />{item.amount_streaming}
                  </p>
                )}
                {item.download_url && (
                  <Button size="sm" variant="ghost" asChild className="h-7 text-xs gap-1 mt-1 text-muted-foreground">
                    <a href={item.download_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-3 h-3" />Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}