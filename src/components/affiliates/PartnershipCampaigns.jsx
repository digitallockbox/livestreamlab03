import React, { useState } from "react";
import { Target, Plus, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PartnershipCampaigns() {
  const [campaigns] = useState([
    {
      id: 1,
      name: "Summer Gaming Blitz",
      partners: 42,
      startDate: "2026-06-01",
      endDate: "2026-08-31",
      revenue: "$12,450",
      status: "active",
    },
    {
      id: 2,
      name: "Creator Collab Series",
      partners: 18,
      startDate: "2026-05-15",
      endDate: "2026-07-15",
      revenue: "$8,320",
      status: "active",
    },
    {
      id: 3,
      name: "Holiday Mega Campaign",
      partners: 65,
      startDate: "2026-11-01",
      endDate: "2026-12-31",
      revenue: "$0",
      status: "planning",
    },
  ]);

  const getStatusColor = (status) => {
    if (status === "active") return "bg-accent/10 text-accent border-accent/20";
    if (status === "planning") return "bg-chart-3/10 text-chart-3 border-chart-3/20";
    return "bg-secondary text-muted-foreground border-border";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Active Campaigns</h3>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5">
          <Plus className="w-3 h-3" /> New Campaign
        </Button>
      </div>

      {/* Campaigns */}
      <div className="space-y-3">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground">{campaign.name}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {campaign.startDate} → {campaign.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {campaign.partners} partners
                  </span>
                </div>
              </div>
              <Badge className={`text-xs border ${getStatusColor(campaign.status)}`}>
                {campaign.status === "active" ? "Active" : "Planning"}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-sm font-semibold text-foreground">Revenue Generated</p>
              <p className="text-lg font-bold text-accent">{campaign.revenue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}