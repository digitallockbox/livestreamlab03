import React, { useEffect, useState } from "react";
import { Loader2, Globe, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Spinner, Input, domainsAPI } from "@/components/creator/os";

const STATUS_BADGE = {
  pending: { cls: "bg-muted text-muted-foreground", icon: Clock, label: "Pending" },
  minted: { cls: "bg-accent/15 text-accent", icon: CheckCircle2, label: "Minted" },
  failed: { cls: "bg-destructive/15 text-destructive", icon: XCircle, label: "Failed" },
};

export default function Domains() {
  const { walletAddress, chain, signedInvoke } = useIdentity();
  const [name, setName] = useState("");
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const load = () => {
    if (!walletAddress) { setLoading(false); return; }
    domainsAPI.list(walletAddress).then((r) => setDomains(r.domains || [])).finally(() => setLoading(false));
  };
  useEffect(load, [walletAddress]);

  const fullName = (() => {
    const n = name.trim().toLowerCase().replace(/\s+/g, "");
    if (!n) return "";
    return n.includes(".") ? n : `${n}.livestreamlab`;
  })();

  const purchase = async () => {
    if (!walletAddress || !fullName) return;
    setBusy(true); setResult(null);
    try {
      const res = await signedInvoke("freenamePurchase", { action: "purchase", domain: fullName, wallet: walletAddress, chain });
      setResult(res);
      load();
    } catch (e) {
      setResult({ error: e.message });
    } finally { setBusy(false); }
  };

  if (!walletAddress) return <Page title="Domains"><Card><p className="text-sm text-muted-foreground">Connect your wallet to register a domain.</p></Card></Page>;

  return (
    <Page title="Domains" subtitle="Purchase a Web3 domain on Freename">
      <Card className="space-y-3 max-w-xl">
        <label className="text-sm text-muted-foreground">Choose your domain name</label>
        <div className="flex gap-2 items-center">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="creator" />
          {!name.includes(".") && <span className="text-sm text-muted-foreground whitespace-nowrap">.livestreamlab</span>}
        </div>
        {fullName && <p className="text-xs font-mono text-muted-foreground">Registering: {fullName}</p>}
        <button onClick={purchase} disabled={busy || !name.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} Purchase Domain on Freename
        </button>
        {result?.error && <p className="text-sm text-destructive">{result.error}</p>}
        {result?.minted && <p className="text-sm text-accent">✓ Minted on Freename ({result.freename?.name || fullName}).</p>}
        {result && !result.minted && !result.error && <p className="text-sm text-muted-foreground">{result.message}</p>}
      </Card>

      <div>
        <h2 className="font-display font-semibold mb-3">Your Domains</h2>
        {loading ? <Spinner /> : domains.length === 0 ? (
          <Card><p className="text-sm text-muted-foreground">No domains registered yet.</p></Card>
        ) : (
          <div className="grid gap-3">
            {domains.map((d) => {
              const b = STATUS_BADGE[d.status] || STATUS_BADGE.pending;
              const Icon = b.icon;
              return (
                <Card key={d.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-display font-semibold font-mono">{d.domain}</p>
                    <p className="text-xs text-muted-foreground">{d.chain} · {d.created_date ? new Date(d.created_date).toLocaleDateString() : ""}</p>
                    {d.tx_hash && <p className="text-xs font-mono text-muted-foreground mt-1 truncate max-w-xs">tx: {d.tx_hash}</p>}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${b.cls} shrink-0`}><Icon className="w-3 h-3" /> {b.label}</span>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}