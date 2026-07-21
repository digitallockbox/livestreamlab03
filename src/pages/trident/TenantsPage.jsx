import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Building2, Plus, ExternalLink } from "lucide-react";
import TenantList from "@/components/trident/tenants/TenantList";
import { useTenants } from "@/state/trident/useTridentStores";
import { tenantsService } from "@/services/trident/tenantsService";

export default function TenantsPage() {
  const { data: tenants, loading } = useTenants();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const create = async () => {
    if (!name.trim() || !domain.trim()) return;
    setCreating(true);
    try {
      await tenantsService.create(name.trim(), domain.trim());
      setCreated(true); setName(""); setDomain(""); setShowForm(false);
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Tenant Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm"><Plus className="w-3.5 h-3.5" /> Create</button>
      </div>
      {created && <p className="text-sm text-accent">Tenant created successfully.</p>}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 max-w-md">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tenant name" className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Domain (e.g. mytenant.live)" className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" />
          <button onClick={create} disabled={creating || !name.trim() || !domain.trim()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{creating ? "Creating..." : "Create Tenant"}</button>
        </div>
      )}
      {loading && !tenants ? <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div> : <TenantList tenants={tenants || []} />}
      <Link to="/trident/tenants/admin" className="text-primary hover:underline text-sm inline-flex items-center gap-1">
        <ExternalLink className="w-3.5 h-3.5" /> Open Tenant Admin Panel →
      </Link>
    </div>
  );
}