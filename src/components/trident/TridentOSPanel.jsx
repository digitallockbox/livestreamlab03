/**
 * TridentOSPanel — SDK status & diagnostics panel.
 * Shows whether the Trident OS SDK loaded, its config, and provides
 * a test-event button. Wired into SystemHealth.
 */
import React, { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Send, Building2, Globe, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTridentOS } from "@/hooks/useTridentOS";

function Row({ icon: Icon, label, value, mask = false }) {
  const display = mask && value ? value.slice(0, 8) + "••••" + value.slice(-4) : value || "—";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-medium font-mono truncate max-w-[55%]">{display}</span>
    </div>
  );
}

export default function TridentOSPanel() {
  const { status, config, track } = useTridentOS();
  const [testResult, setTestResult] = useState(null);

  const handleTest = () => {
    track("sdk_test_event", { timestamp: Date.now(), source: "system_health" });
    setTestResult("sent");
    setTimeout(() => setTestResult(null), 3000);
  };

  const statusDisplay = {
    loading: { label: "Loading SDK…", icon: Loader2, className: "text-muted-foreground", spin: true },
    ready: { label: "SDK Ready", icon: CheckCircle2, className: "text-accent", spin: false },
    missing: { label: "SDK Not Found", icon: XCircle, className: "text-destructive", spin: false },
  };
  const s = statusDisplay[status] || statusDisplay.loading;
  const StatusIcon = s.icon;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm">Trident OS SDK</h3>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${s.className}`}>
          <StatusIcon className={`w-3.5 h-3.5 ${s.spin ? "animate-spin" : ""}`} />
          {s.label}
        </div>
      </div>

      {config ? (
        <div className="divide-y divide-border">
          <Row icon={Building2} label="Tenant" value={config.tenant} />
          <Row icon={Globe} label="Website" value={config.website} />
          <Row icon={KeyRound} label="Token" value={config.token} mask />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No SDK script tag found. Add the Trident OS script to index.html.
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleTest}
          disabled={status !== "ready"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-3 h-3" /> Send Test Event
        </button>
        {testResult && (
          <span className="text-xs text-accent font-medium">Event queued ✓</span>
        )}
      </div>

      {status === "missing" && (
        <p className="text-xs text-muted-foreground bg-muted rounded-md p-2">
          The SDK script at <code className="text-foreground">{config?.src || "trident-os.com/sdk.js"}</code> didn't load.
          Verify the URL is deployed and accessible.
        </p>
      )}
    </Card>
  );
}