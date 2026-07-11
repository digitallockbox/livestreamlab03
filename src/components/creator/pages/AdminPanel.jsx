import React, { useState } from "react";
import { Shield, Server, HeartPulse, Route as RouteIcon } from "lucide-react";
import EngineRegistry from "@/components/creator/admin/EngineRegistry";
import EngineHeartbeat from "@/components/creator/admin/EngineHeartbeat";
import EventRouter from "@/components/creator/admin/EventRouter";
import { Page } from "@/components/creator/os";

const TABS = [
  { id: "registry", label: "Engine Registry", icon: Server, component: EngineRegistry },
  { id: "heartbeat", label: "Engine Heartbeat", icon: HeartPulse, component: EngineHeartbeat },
  { id: "routes", label: "Event Router", icon: RouteIcon, component: EventRouter },
];

export default function AdminPanel() {
  const [active, setActive] = useState("registry");
  const ActiveComponent = TABS.find((t) => t.id === active)?.component || EngineRegistry;

  return (
    <Page title="Admin Panel" subtitle="Trident OS engine management and platform diagnostics">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-primary" />
        <div className="flex gap-1 flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active === tab.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <ActiveComponent />
    </Page>
  );
}