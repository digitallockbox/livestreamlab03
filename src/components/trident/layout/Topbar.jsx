import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";

export default function Topbar() {
  const { walletAddress, session } = useIdentity();
  const [tenant, setTenant] = useState(session?.bound_domain || "livestreamlab");
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center gap-4 px-4 h-14">
        <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="font-display font-bold">Trident Control Plane</span>
        <div className="ml-auto flex items-center gap-3">
          <select value={tenant} onChange={(e) => setTenant(e.target.value)} className="rounded-md border border-input bg-muted px-2 py-1 text-sm">
            <option value="livestreamlab">livestreamlab</option>
            <option value="custom">custom</option>
          </select>
          <span className="font-mono text-xs text-muted-foreground">{walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Not connected"}</span>
        </div>
      </div>
    </header>
  );
}