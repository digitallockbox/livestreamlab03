import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const notifGroups = [
  {
    title: "Revenue & Payouts",
    items: [
      { label: "New tip received", sub: "Get notified when you receive a tip" },
      { label: "Payout processed", sub: "When your payout is completed" },
      { label: "New store sale", sub: "When someone buys your product" },
    ],
  },
  {
    title: "Content & Streaming",
    items: [
      { label: "Stream reminder", sub: "Before your scheduled stream" },
      { label: "New comment", sub: "When someone comments on your content" },
      { label: "Milestone reached", sub: "Follower or view milestones" },
    ],
  },
  {
    title: "Account & Security",
    items: [
      { label: "New login", sub: "When a new device logs in" },
      { label: "Password changed", sub: "Security alerts" },
    ],
  },
];

export default function NotificationSettings() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Choose what you want to be notified about.</p>
      </div>
      <div className="space-y-6">
        {notifGroups.map((group) => (
          <div key={group.title} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">{group.title}</h3>
            </div>
            <div className="space-y-4">
              {group.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button className="bg-primary hover:bg-primary/90">Save Preferences</Button>
      </div>
    </div>
  );
}