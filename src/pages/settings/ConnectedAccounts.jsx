import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Unlink } from "lucide-react";

const accounts = [
  { name: "Twitch", icon: "🟣", connected: true, username: "@mychannel" },
  { name: "YouTube", icon: "🔴", connected: true, username: "@mychannel" },
  { name: "Twitter / X", icon: "⬛", connected: false, username: null },
  { name: "Discord", icon: "🔵", connected: false, username: null },
  { name: "TikTok", icon: "⬛", connected: true, username: "@mychannel" },
  { name: "Instagram", icon: "🟠", connected: false, username: null },
];

export default function ConnectedAccounts() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Connected Accounts</h1>
        <p className="text-muted-foreground mt-1">Manage your linked social and platform accounts.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {accounts.map((account) => (
          <div key={account.name} className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{account.icon}</span>
              <div>
                <p className="font-medium text-foreground text-sm">{account.name}</p>
                {account.connected ? (
                  <p className="text-xs text-muted-foreground mt-0.5">{account.username}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {account.connected && <Badge className="bg-accent/10 text-accent border-0 text-xs">Connected</Badge>}
              <Button size="sm" variant={account.connected ? "ghost" : "outline"} className={`gap-1 h-8 text-xs ${account.connected ? "text-destructive hover:text-destructive" : ""}`}>
                {account.connected ? <><Unlink className="w-3 h-3" /> Disconnect</> : <><Link2 className="w-3 h-3" /> Connect</>}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}