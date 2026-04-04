import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg || "bg-primary/10")}>
          <Icon className={cn("w-5 h-5", iconColor || "text-primary")} />
        </div>
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-accent mt-1 font-medium">{subtitle}</p>}
    </div>
  );
}