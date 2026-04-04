import React from "react";
import { Radio, Video, ShoppingBag, Wallet, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  stream: Radio,
  video: Video,
  store: ShoppingBag,
  payout: Wallet,
  podcast: Mic,
};

const colorMap = {
  stream: "bg-primary/10 text-primary",
  video: "bg-accent/10 text-accent",
  store: "bg-chart-4/10 text-chart-4",
  payout: "bg-chart-3/10 text-chart-3",
  podcast: "bg-chart-5/10 text-chart-5",
};

const mockActivity = [
  { type: "stream", title: "Live: Friday Night Gaming", detail: "2.4K viewers · $127 tips", time: "2h ago" },
  { type: "video", title: "How I Built My Setup", detail: "12.3K views · 45 unlocks", time: "5h ago" },
  { type: "store", title: "Preset Pack sold", detail: "$24.99 · $STREAMING 120", time: "8h ago" },
  { type: "payout", title: "CreatorVault payout", detail: "$1,847.00 processed", time: "1d ago" },
  { type: "podcast", title: "Ep 14: Creator Economy", detail: "890 listens · 12 boosts", time: "2d ago" },
];

export default function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {mockActivity.map((item, i) => {
          const Icon = iconMap[item.type];
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", colorMap[item.type])}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}