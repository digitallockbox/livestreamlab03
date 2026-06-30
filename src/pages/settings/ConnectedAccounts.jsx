import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, Mail, Twitch, Zap, Unlink2, Link2 } from "lucide-react";

const CONNECTED_SERVICES = [
  { id: "github", name: "GitHub", icon: Github, status: "connected", email: "dev@example.com", connected_at: "Mar 15, 2026" },
  { id: "twitter", name: "Twitter", icon: Twitter, status: "connected", username: "@cryptocreator", connected_at: "Feb 28, 2026" },
  { id: "google", name: "Google Account", icon: Mail, status: "connected", email: "creator@gmail.com", connected_at: "Jan 10, 2026" },
];

const AVAILABLE_SERVICES = [
  { id: "twitch", name: "Twitch", icon: Twitch, description: "Stream multicast to Twitch" },
  { id: "stripe", name: "Stripe", icon: Zap, description: "Payment processing & payouts" },
];

export default function ConnectedAccounts() {
  const [connected, setConnected] = useState(CONNECTED_SERVICES);

  const handleDisconnect = (id) => {
    setConnected(connected.filter(s => s.id !== id));
  };

  const handleConnect = (service) => {
    // Mock connection
    alert(`Connecting to ${service.name}...`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Connected Accounts</h1>
        <p className="text-muted-foreground mt-1">Manage third-party integrations and OAuth connections.</p>
      </div>

      {/* Connected Services */}
      <div className="mb-12">
        <h2 className="font-display font-semibold text-lg text-foreground mb-4">Active Connections</h2>
        <div className="space-y-3">
          {connected.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.email || service.username} · Connected {service.connected_at}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Connected</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/50 gap-1.5"
                    onClick={() => handleDisconnect(service.id)}
                  >
                    <Unlink2 className="w-3.5 h-3.5" /> Disconnect
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Services */}
      <div>
        <h2 className="font-display font-semibold text-lg text-foreground mb-4">Available Services</h2>
        <div className="space-y-3">
          {AVAILABLE_SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-secondary border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 gap-1.5"
                  onClick={() => handleConnect(service)}
                >
                  <Link2 className="w-3.5 h-3.5" /> Connect
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Security:</strong> We only request the minimum permissions needed. You can revoke access anytime by disconnecting above. Your credentials are never stored.
        </p>
      </div>
    </div>
  );
}