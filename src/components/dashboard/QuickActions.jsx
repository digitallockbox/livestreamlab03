import React from "react";
import { Link } from "react-router-dom";
import { Radio, Video, Mic, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { label: "Go Live", icon: Radio, path: "/streaming/go-live", color: "bg-primary hover:bg-primary/90 text-primary-foreground" },
  { label: "Upload Video", icon: Video, path: "/videos/upload", color: "bg-accent hover:bg-accent/90 text-accent-foreground" },
  { label: "Upload Audio", icon: Mic, path: "/podcasts/upload", color: "bg-chart-3/80 hover:bg-chart-3/70 text-background" },
  { label: "Add Product", icon: ShoppingBag, path: "/store/add-product", color: "bg-chart-4/80 hover:bg-chart-4/70 text-background" },
];

export default function QuickActions() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link key={action.path} to={action.path}>
            <Button className={`w-full ${action.color} rounded-xl h-auto py-3 flex flex-col items-center gap-1.5`}>
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}