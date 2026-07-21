import React from "react";
import { Loader2, Building2 } from "lucide-react";
import TenantList from "@/components/trident/tenants/TenantList";
import { useTenants } from "@/state/trident/useTridentStores";

export default function TenantsPage() {
  const { data: tenants, loading } = useTenants();
  if (loading && !tenants) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Tenant Management</h2>
      <TenantList tenants={tenants || []} />
    </div>
  );
}