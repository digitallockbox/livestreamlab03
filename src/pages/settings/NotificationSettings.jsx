import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const notifications = [
  { key: "new_follower", label: "New Followers", desc: "When someone follows your channel" },
  { key: "new_tip", label: "Tips Received", desc: "When you receive a tip during a stream" },
  { key: "new_sale", label: "Store Sales", desc: "When a product purchase is made" },
  { key: "payout_ready", label: "Payout Ready", desc: "When your payout cycle completes" },
  { key: "affiliate_conversion", label: "Affiliate Conversions", desc: "When an affiliate link converts" },
  { key: "new_comment", label: "Comments & Replies", desc: "Activity on your videos and podcasts" },
];

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState({ new_follower: true, new_tip: true, new_sale: true, payout_ready: true, affiliate_conversion: false, new_comment: false });
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Choose what updates you receive.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {notifications.map((n) => (
          <div key={n.key} className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-foreground">{n.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
            </div>
            <Switch checked={prefs[n.key]} onCheckedChange={v => setPrefs(p => ({ ...p, [n.key]: v }))} />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button className="bg-primary hover:bg-primary/90">Save Preferences</Button>
      </div>
    </div>
  );
}