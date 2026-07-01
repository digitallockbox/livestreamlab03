import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Mail, Twitch, Zap, Unlink2, Link2, Save, X, Loader2, Wallet } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity, getWalletToken } from "@/lib/web3/identity";

const INITIAL_CONNECTED = [
  { id: "github", name: "GitHub", icon: Github, status: "connected", email: "dev@example.com", connected_at: "Mar 15, 2026" },
  { id: "google", name: "Google Account", icon: Mail, status: "connected", email: "creator@gmail.com", connected_at: "Jan 10, 2026" },
];

const AVAILABLE_SERVICES = [
  { id: "twitch", name: "Twitch", icon: Twitch, description: "Connect your Twitch channel for multicast streaming", field: "twitch", placeholder: "twitch.tv/yourname" },
  { id: "x", name: "X (Twitter)", icon: Twitter, description: "Link your X account for stream notifications", field: "twitter", placeholder: "@yourhandle" },
  { id: "stripe", name: "Stripe", icon: Zap, description: "Payment processing & payouts", type: "oauth" },
];

export default function ConnectedAccounts() {
  const { walletAddress } = useIdentity();
  const [connected, setConnected] = useState(INITIAL_CONNECTED);
  const [available, setAvailable] = useState(AVAILABLE_SERVICES);
  const [connectingId, setConnectingId] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [linking, setLinking] = useState(false);
  const [walletMerged, setWalletMerged] = useState(false);

  const handleLinkWallet = async () => {
    const token = getWalletToken();
    if (!token) { setStatus("Wallet not authenticated — complete wallet login first"); return; }
    if (!walletAddress) { setStatus("No wallet connected"); return; }
    setLinking(true);
    setStatus("");
    try {
      await base44.functions.invoke("linkWallet", { wallet_token: token });
      setWalletMerged(true);
      setStatus("Wallet linked to your account successfully");
    } catch (error) {
      setStatus(error?.message || "Failed to link wallet");
    } finally {
      setLinking(false);
    }
  };

  // Load connected accounts from backend
  useEffect(() => {
    if (!walletAddress) return;
    
    const loadAccounts = async () => {
      try {
        const res = await base44.functions.invoke('getConnectedAccounts', {});
        const { twitch, twitter } = res.data;
        
        const newConnected = [...INITIAL_CONNECTED];
        const newAvailable = [];
        
        if (twitch) {
          newConnected.push({
            id: "twitch",
            name: "Twitch",
            icon: Twitch,
            status: "connected",
            username: twitch,
            connected_at: "Recently",
          });
        } else {
          newAvailable.push(AVAILABLE_SERVICES.find(s => s.id === "twitch"));
        }
        
        if (twitter) {
          newConnected.push({
            id: "x",
            name: "X (Twitter)",
            icon: Twitter,
            status: "connected",
            username: twitter,
            connected_at: "Recently",
          });
        } else {
          newAvailable.push(AVAILABLE_SERVICES.find(s => s.id === "x"));
        }
        
        // Add Stripe
        newAvailable.push(AVAILABLE_SERVICES.find(s => s.id === "stripe"));
        
        setConnected(newConnected);
        setAvailable(newAvailable.filter(Boolean));
      } catch (error) {
        console.error('Failed to load accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAccounts();
  }, [walletAddress]);

  const handleDisconnect = async (id) => {
    setSaving(true);
    setStatus("");
    
    try {
      const twitch = id === "twitch" ? "" : connected.find(c => c.id === "twitch")?.username;
      const twitter = id === "x" ? "" : connected.find(c => c.id === "x")?.username;
      
      await base44.functions.invoke('updateConnectedAccounts', {
        twitch: twitch || null,
        twitter: twitter || null,
      });
      
      setConnected(connected.filter(s => s.id !== id));
      const service = AVAILABLE_SERVICES.find(s => s.id === id);
      if (service && !available.find(s => s.id === id)) {
        setAvailable([...available, service]);
      }
      setStatus("Disconnected successfully");
    } catch (error) {
      setStatus("Failed to disconnect");
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = (service) => {
    if (service.type === "username" || service.field) {
      setConnectingId(service.id);
      setUsernameInput("");
    } else {
      alert(`OAuth flow for ${service.name} - not yet implemented`);
    }
  };

  const saveUsername = async (service) => {
    if (!usernameInput.trim()) return;
    
    setSaving(true);
    setStatus("");
    
    try {
      const twitch = service.field === "twitch" ? usernameInput.trim() : connected.find(c => c.id === "twitch")?.username;
      const twitter = service.field === "twitter" ? usernameInput.trim() : connected.find(c => c.id === "x")?.username;
      
      await base44.functions.invoke('updateConnectedAccounts', {
        twitch: twitch || null,
        twitter: twitter || null,
      });
      
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
      setStatus("Connected successfully");
    } catch (error) {
      setStatus("Failed to connect");
    } finally {
      setSaving(false);
    }
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

      {status && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${status.includes('success') ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
          {status}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <>
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
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink2 className="w-3.5 h-3.5" />} {saving ? "..." : "Disconnect"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wallet Identity */}
      <div className="mb-12">
        <h2 className="font-display font-semibold text-lg text-foreground mb-4">Wallet Identity</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Web3 Wallet</p>
              <p className="text-xs text-muted-foreground font-mono">
                {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : "No wallet connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {walletMerged ? (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Linked to account</Badge>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 gap-1.5"
                onClick={handleLinkWallet}
                disabled={linking || !walletAddress}
              >
                {linking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />} Link to account
              </Button>
            )}
          </div>
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
                      disabled={saving}
                    />
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 gap-1.5"
                      onClick={() => saveUsername(service)}
                      disabled={!usernameInput.trim() || saving}
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border hover:bg-destructive/10 hover:text-destructive"
                      onClick={cancelConnection}
                      disabled={saving}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 gap-1.5"
                    onClick={() => handleConnect(service)}
                    disabled={saving}
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
          <strong>Security:</strong> Your connected account information is stored securely. You can disconnect anytime from above.
        </p>
      </div>
      </>
      )}
    </div>
  );
}