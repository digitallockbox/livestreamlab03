import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, AlertCircle, Plus, Globe, CheckCircle2, Edit2, Radio } from "lucide-react";
import { tenantsService } from "@/services/trident/tenantsService";

export default function TenantAdminPanel() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Creation form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  // Detail modal
  const [selected, setSelected] = useState(null);
  const [editDomain, setEditDomain] = useState("");
  const [savingDomain, setSavingDomain] = useState(false);
  const [domainMsg, setDomainMsg] = useState("");

  const poll = async () => {
    try {
      const res = await tenantsService.getTenants();
      setTenants(res.tenants || []);
      setError("");
    } catch {
      setError("Failed to fetch tenant data.");
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  const create = async () => {
    if (!name.trim() || !domain.trim()) return;
    setCreating(true);
    setCreateMsg("");
    try {
      await tenantsService.create(name.trim(), domain.trim());
      setCreateMsg("Tenant created successfully.");
      setName(""); setDomain(""); setShowForm(false);
      poll();
    } catch {
      setCreateMsg("Failed to create tenant.");
    } finally {
      setCreating(false);
    }
  };

  const saveDomain = async () => {
    if (!selected || !editDomain.trim()) return;
    setSavingDomain(true);
    setDomainMsg("");
    try {
      await tenantsService.create(selected.name, editDomain.trim());
      setDomainMsg("Domain updated successfully.");
      setSelected({ ...selected, domain: editDomain.trim() });
      poll();
    } catch {
      setDomainMsg("Failed to update domain.");
    } finally {
      setSavingDomain(false);
    }
  };

  const openTenant = (t) => {
    setSelected(t);
    setEditDomain(t.domain || "");
    setDomainMsg("");
  };

  const totalTenants = tenants.length;
  const totalStreams = tenants.reduce((a, t) => a + (t.streams || 0), 0);
  const activeTenants = tenants.filter((t) => (t.streams || 0) > 0).length;
  const inactiveTenants = totalTenants - activeTenants;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Tenant Admin Panel
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
        >
          <Plus className="w-3.5 h-3.5" /> {showForm ? "Cancel" : "Create Tenant"}
        </button>
      </div>

      {/* Tenant Usage Dashboard */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <h3 className="font-display font-semibold text-sm">Usage Overview</h3>
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Total Tenants</p>
            <p className="text-xl font-display font-bold">{totalTenants}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Total Streams</p>
            <p className="text-xl font-display font-bold">{totalStreams}</p>
          </div>
          <div className="rounded-lg bg-accent/10 p-3">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-display font-bold text-accent">{activeTenants}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-xl font-display font-bold text-muted-foreground">{inactiveTenants}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Creation Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 max-w-md">
          <h3 className="font-display font-semibold text-sm">Create New Tenant</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tenant Name *"
            className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
          />
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Domain (e.g. mytenant.live) *"
            className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono"
          />
          <button
            onClick={create}
            disabled={creating || !name.trim() || !domain.trim()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Tenant"}
          </button>
          {createMsg && (
            <p className={`text-sm flex items-center gap-1 ${createMsg.includes("success") ? "text-accent" : "text-destructive"}`}>
              {createMsg.includes("success") ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {createMsg}
            </p>
          )}
        </div>
      )}

      {/* Tenant List */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading tenants…</p>
      ) : tenants.length === 0 ? (
        <div className="py-12 text-center">
          <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No tenants found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((t, i) => {
            const isActive = (t.streams || 0) > 0;
            return (
              <button
                key={i}
                onClick={() => openTenant(t)}
                className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <p className="font-display font-semibold text-sm truncate">{t.name}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent" : "bg-muted-foreground"}`} />
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-muted-foreground inline-flex items-center gap-1 font-mono truncate">
                    <Globe className="w-3 h-3" /> {t.domain || "—"}
                  </p>
                  <p className="text-muted-foreground inline-flex items-center gap-1">
                    <Radio className="w-3 h-3" /> {t.streams || 0} streams
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tenant Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  {selected.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Streams</p>
                    <p className="font-display font-bold">{selected.streams || 0}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Current Domain</p>
                    <p className="font-mono text-sm">{selected.domain || "—"}</p>
                  </div>
                  {selected.wallet && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Wallet</p>
                      <p className="font-mono text-xs">{selected.wallet}</p>
                    </div>
                  )}
                  {selected.chain && (
                    <div>
                      <p className="text-xs text-muted-foreground">Chain</p>
                      <p className="capitalize text-sm">{selected.chain}</p>
                    </div>
                  )}
                </div>

                {/* Domain Mapping UI */}
                <div className="rounded-lg border border-border bg-muted p-3 space-y-2">
                  <p className="text-xs font-medium inline-flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit Domain
                  </p>
                  <input
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    placeholder="new-domain.live"
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-mono"
                  />
                  <button
                    onClick={saveDomain}
                    disabled={savingDomain || !editDomain.trim() || editDomain === selected.domain}
                    className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 disabled:opacity-50"
                  >
                    {savingDomain ? "Saving…" : "Save Domain"}
                  </button>
                  {domainMsg && (
                    <p className={`text-xs flex items-center gap-1 ${domainMsg.includes("success") ? "text-accent" : "text-destructive"}`}>
                      {domainMsg.includes("success") ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {domainMsg}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 w-full justify-center"
                >
                  <Radio className="w-4 h-4" /> Manage Streams
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}