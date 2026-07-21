import React from "react";
import TenantCard from "./TenantCard";

export default function TenantList({ tenants }) {
  if (!tenants || tenants.length === 0) return <p className="text-sm text-muted-foreground">No tenants registered.</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tenants.map((t, i) => <TenantCard key={i} tenant={t} />)}
    </div>
  );
}