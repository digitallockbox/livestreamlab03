import React from "react";
import { Loader2, Building2 } from "lucide-react";
import { useTenants } from "@/lib/tridentControlPlane";

export default function TenantPanel() {
  const { data: tenants, loading } = useTenants();
  if (loading && !tenants) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  const rows = tenants || [];
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Tenant Management</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tenants registered.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Domain</th><th className="text-left p-3">Streams</th><th className="text-left p-3">Chain</th><th className="text-left p-3">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr key={i} className="border-t border-border/50">
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3 font-mono text-xs">{t.domain}</td>
                  <td className="p-3">{t.streams}</td>
                  <td className="p-3 capitalize">{t.chain}</td>
                  <td className="p-3"><span className="text-xs capitalize text-accent">{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}