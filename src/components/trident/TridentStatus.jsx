/**
 * TridentStatus — live health badge for the Trident OS connection.
 * Drop this anywhere in the UI to show Base44 ↔ Trident status.
 */
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TridentStatus({ className = "" }) {
  const [status, setStatus] = useState("loading"); // loading | online | offline

  useEffect(() => {
    base44.functions.invoke("tridentProxy", { method: "GET", path: "/system/health" })
      .then(res => setStatus(res.data?.status === "ok" ? "online" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);

  if (status === "loading") {
    return (
      <Badge className={`bg-secondary text-muted-foreground border-border gap-1.5 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin" /> Trident connecting…
      </Badge>
    );
  }

  if (status === "online") {
    return (
      <Badge className={`bg-accent/10 text-accent border-accent/20 gap-1.5 ${className}`}>
        <CheckCircle2 className="w-3 h-3" /> Trident OS Online
      </Badge>
    );
  }

  return (
    <Badge className={`bg-destructive/10 text-destructive border-destructive/20 gap-1.5 ${className}`}>
      <XCircle className="w-3 h-3" /> Trident Offline
    </Badge>
  );
}