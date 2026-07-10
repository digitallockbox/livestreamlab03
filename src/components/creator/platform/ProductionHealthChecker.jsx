import React, { useEffect } from "react";
import { CheckCircle2, XCircle, RefreshCw, Server, Globe, Key } from "lucide-react";
import { useProductionHealth } from "@/hooks/web3/useProductionHealth";
import { Card } from "@/components/ui/card";

function StatusRow({ icon: Icon, label, value, ok }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-medium truncate max-w-[60%]">{value}</span>
      {ok === undefined ? null : ok ? (
        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-destructive shrink-0" />
      )}
    </div>
  );
}

export default function ProductionHealthChecker() {
  const { result, loading, routing, check } = useProductionHealth();

  useEffect(() => {
    check();
  }, [check]);

  const status = result?.status;
  const isOk = status === "operational";

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm">Backend Health Check</h3>
        </div>
        <button
          onClick={check}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="divide-y divide-border">
        <StatusRow icon={Globe} label="Engine URL" value={routing.engineUrl} />
        <StatusRow
          icon={Server}
          label="Environment"
          value={routing.isProduction ? "Production" : "Development"}
          ok={routing.isProduction}
        />
        <StatusRow
          icon={Key}
          label="Session Token"
          value={routing.hasToken ? "Present" : "Missing"}
          ok={routing.hasToken}
        />
        <StatusRow
          icon={Server}
          label="Backend Reachable"
          value={loading ? "Checking…" : status || "Not checked"}
          ok={isOk}
        />
      </div>

      {result?.error && (
        <p className="text-xs text-destructive font-mono break-all">{result.error}</p>
      )}
      {result?.data && (
        <pre className="text-xs text-muted-foreground bg-muted rounded-md p-3 overflow-auto max-h-32">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </Card>
  );
}