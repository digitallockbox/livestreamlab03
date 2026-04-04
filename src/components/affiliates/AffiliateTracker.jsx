import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link2, CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AffiliateTracker() {
  const [trackingData] = useState([
    { id: 1, link: "lsl.tv/aff/tech-podcast", clicks: 12450, conversions: 287, rate: "2.3%", revenue: "$2,145.30", status: "active" },
    { id: 2, link: "lsl.tv/aff/creator-collab", clicks: 8320, conversions: 156, rate: "1.8%", revenue: "$1,248.90", status: "active" },
    { id: 3, link: "lsl.tv/aff/promo-campaign", clicks: 3890, conversions: 42, rate: "1.1%", revenue: "$315.60", status: "pending" },
    { id: 4, link: "lsl.tv/aff/partner-store", clicks: 1240, conversions: 8, rate: "0.6%", revenue: "$67.20", status: "active" },
  ]);

  const getStatusIcon = (status) => {
    if (status === "active") return <CheckCircle2 className="w-4 h-4 text-accent" />;
    if (status === "pending") return <Clock className="w-4 h-4 text-chart-3" />;
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Real-Time Link Tracking</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Clicks", value: "25,900", change: "+12.4%" },
          { label: "Conversions", value: "493", change: "+8.2%" },
          { label: "Avg. Rate", value: "1.9%", change: "+0.3%" },
          { label: "Revenue", value: "$3,777", change: "+15.8%" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-lg font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-accent mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Tracking Table */}
      <div className="space-y-2">
        {trackingData.map((link, i) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-secondary border border-border rounded-lg p-4 flex items-center gap-4"
          >
            {getStatusIcon(link.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground font-mono truncate">{link.link}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{link.clicks.toLocaleString()} clicks • {link.conversions} conversions</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs mb-1">
                {link.rate}
              </Badge>
              <p className="text-sm font-semibold text-foreground">{link.revenue}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}