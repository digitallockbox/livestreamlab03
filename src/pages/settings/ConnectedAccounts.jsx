import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Mail, Twitch, Zap, Unlink2, Link2, Save, X } from "lucide-react";

const INITIAL_CONNECTED = [
  { id: "github", name: "GitHub", icon: Github, status: "connected", email: "dev@example.com", connected_at: "Mar 15, 2026" },
  { id: "google", name: "Google Account", icon: Mail, status: "connected", email: "creator@gmail.com", connected_at: "Jan 10, 2026" },
];

const INITIAL_AVAILABLE = [
  { id: "twitch", name: "Twitch", icon: Twitch, description: "Connect your Twitch channel for multicast streaming", type: "username", placeholder: "twitch.tv/yourname" },
  { id: "x", name: "X (Twitter)", icon: Twitter, description: "Link your X account for stream notifications", type: "username", placeholder: "@yourhandle" },
  { id: "stripe", name: "Stripe", icon: Zap, description: "Payment processing & payouts", type: "oauth" },
];

export default function ConnectedAccounts() {
  const [connected, setConnected] = useState(INITIAL_CONNECTED);
  const [available, setAvailable] = useState(INITIAL_AVAILABLE);
  const [connectingId, setConnectingId] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");

  const handleDisconnect = (id) => {
    setConnected(connected.filter(s => s.id !== id));
    const service = available.find(s => s.id === id);
    if (service && !available.find(s => s.id === id)) {
      setAvailable([...available, service]);
    }
  };

  const handleConnect = (service) => {
    if (service.type === "username") {
      setConnectingId(service.id);
      setUsernameInput("");
    } else {
      // OAuth flow would go here
      alert(`OAuth flow for ${service.name} - not yet implemented`);
    }
  };

  const saveUsername = (service) => {
    if (!usernameInput.trim()) return;
    
    const newConnection = {
      id: service.id,
      name: service.name,
      icon: service.icon,
      status: "connected",
      username: usernameInput.trim(),
      connected_at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    
    setConnected([...connected, newConnection]);
    setAvailable(available.filter(s => s.id !== service.id));
    setConnectingId(null);
    setUsernameInput("");
  };

  const cancelConnection = () => {
    setConnectingId(null);
    setUsernameInput("");
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
          {available.map((service) => {
            const Icon = service.icon;
            const isConnecting = connectingId === service.id;
            
            return (
              <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-secondary border border-border rounded-xl">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                
                {isConnecting ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <Input
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder={service.placeholder}
                      className="h-9 w-full sm:w-48"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 gap-1.5"
                      onClick={() => saveUsername(service)}
                      disabled={!usernameInput.trim()}
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border hover:bg-destructive/10 hover:text-destructive"
                      onClick={cancelConnection}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 gap-1.5"
                    onClick={() => handleConnect(service)}
                  >
                    <Link2 className="w-3.5 h-3.5" /> Connect
                  </Button>
                )}
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