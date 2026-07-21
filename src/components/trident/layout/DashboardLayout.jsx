import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { formatUptime, SESSION_START } from "@/services/trident/engineRegistry";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4"><Outlet /></main>
      </div>
      <footer className="border-t border-border bg-card px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Node uptime: {formatUptime(Date.now() - SESSION_START)}</span>
        <span>TridentOS v1.0 · Engine signatures verified</span>
      </footer>
    </div>
  );
}