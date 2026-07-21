import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Radio, GitBranch, Database, Wallet, Building2, Settings, Activity } from "lucide-react";
import EngineStatusMini from "./EngineStatusMini";

const NAV = [
  { path: "/trident", label: "Overview", icon: LayoutDashboard },
  { path: "/trident/rtmp", label: "RTMP", icon: Radio },
  { path: "/trident/autosplit", label: "Autosplit", icon: GitBranch },
  { path: "/trident/storage", label: "Storage", icon: Database },
  { path: "/trident/identity", label: "Identity", icon: Wallet },
  { path: "/trident/tenants", label: "Tenants", icon: Building2 },
  { path: "/trident/admin", label: "Admin", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-56 border-r border-border bg-card/50 p-4 space-y-3 hidden md:block">
      <div>
        <p className="text-xs text-muted-foreground">Node Status</p>
        <p className="font-display font-bold flex items-center gap-1.5"><Activity className="w-4 h-4 text-accent" /> Online</p>
      </div>
      <EngineStatusMini />
      <div className="border-t border-border pt-3 space-y-1">
        {NAV.map((item) => (
          <Link key={item.path} to={item.path}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm ${location.pathname === item.path ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
            <item.icon className="w-3.5 h-3.5" /> {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}