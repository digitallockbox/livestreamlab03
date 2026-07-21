import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Radio, GitBranch, Database, Wallet, Building2, Settings, ArrowLeft, Activity } from "lucide-react";
import EngineOverviewPanel from "@/components/trident/EngineOverviewPanel";
import RTMPSessionsPanel from "@/components/trident/RTMPSessionsPanel";
import AutosplitRoutingPanel from "@/components/trident/AutosplitRoutingPanel";
import StorageViewerPanel from "@/components/trident/StorageViewerPanel";
import IdentityPanel from "@/components/trident/IdentityPanel";
import TenantPanel from "@/components/trident/TenantPanel";
import AdminControlPanel from "@/components/trident/AdminControlPanel";
import { useEngineStatus, formatUptime, ENGINES } from "@/lib/tridentControlPlane";

const NAV = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "rtmp", label: "Streams", icon: Radio },
  { id: "autosplit", label: "Autosplit", icon: GitBranch },
  { id: "storage", label: "Storage", icon: Database },
  { id: "identity", label: "Identity", icon: Wallet },
  { id: "tenants", label: "Tenants", icon: Building2 },
  { id: "admin", label: "Admin", icon: Settings },
];

const SESSION_START = Date.now();

export default function TridentControlPlane() {
  const [active, setActive] = useState("overview");
  const { data: engines } = useEngineStatus();
  const onlineCount = (engines || []).filter((e) => e.status === "online").length;

  const panels = {
    overview: <EngineOverviewPanel />,
    rtmp: <RTMPSessionsPanel />,
    autosplit: <AutosplitRoutingPanel />,
    storage: <StorageViewerPanel />,
    identity: <IdentityPanel />,
    tenants: <TenantPanel />,
    admin: <AdminControlPanel />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="flex items-center gap-4 px-4 h-14">
          <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /></Link>
          <span className="font-display font-bold">Trident Control Plane</span>
          <nav className="flex gap-1 ml-auto overflow-x-auto">
            {NAV.map((item) => (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${active === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <item.icon className="w-3.5 h-3.5" /> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-border bg-card/50 p-4 space-y-3 hidden md:block">
          <div>
            <p className="text-xs text-muted-foreground">Node Status</p>
            <p className="font-display font-bold flex items-center gap-1.5"><Activity className="w-4 h-4 text-accent" /> Online</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Engines</p>
            <p className="font-display font-bold">{onlineCount}/{engines?.length || ENGINES.length}</p>
          </div>
          <div className="border-t border-border pt-3 space-y-1">
            {NAV.map((item) => (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-left ${active === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                <item.icon className="w-3.5 h-3.5" /> {item.label}
              </button>
            ))}
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-4">{panels[active]}</main>
      </div>

      <footer className="border-t border-border bg-card px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Node uptime: {formatUptime(Date.now() - SESSION_START)}</span>
        <span>TridentOS v1.0 · Engine signatures verified</span>
      </footer>
    </div>
  );
}