import React from "react";
import { MousePointer, DollarSign, Zap, Plus, TrendingUp } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const links = [
  { id: 1, title: "StreamDeck Affiliate", clicks: 1240, conversions: 38, commission: 142.00 },
  { id: 2, title: "Elgato Gear Link", clicks: 890, conversions: 21, commission: 98.50 },
  { id: 3, title: "Gaming Chair Partner", clicks: 2150, conversions: 54, commission: 99.50 },
];

export default function AffiliateDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Affiliate Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track clicks, conversions and commissions.</p>
        </div>
        <Link to="/affiliates/add">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Link</Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Clicks" value="4,280" icon={MousePointer} accent />
        <StatCard title="Commissions" value="$340.00" icon={DollarSign} />
        <StatCard title="Conversions" value="113" icon={TrendingUp} />
        <StatCard title="$STREAMING Bonus" value="1,200" icon={Zap} />
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Top Performing Links</h3>
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{link.title}</p>
                <p className="text-xs text-muted-foreground">{link.clicks} clicks · {link.conversions} conversions</p>
              </div>
              <span className="text-accent font-semibold text-sm">${link.commission.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}