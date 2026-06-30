import React, { useState } from "react";
import { Globe, CheckCircle2, Loader2 } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Input } from "@/components/creator/os";

const completedKey = (w) => `onboarding_complete_${w}`;

export default function Onboarding() {
  const { walletAddress, chain, session, setSession, signedInvoke } = useIdentity();
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bound, setBound] = useState(false);

  const bind = async () => {
    const name = domain.trim().toLowerCase();
    if (!name) { setError("Enter a domain name"); return; }
    setBusy(true); setError("");
    try {
      await signedInvoke("freenamePurchase", { action: "purchase", domain: name, wallet: walletAddress });
      setBound(true);
    } catch (e) {
      setError(e?.message || "Domain bind failed");
    } finally { setBusy(false); }
  };

  const finish = () => {
    try { localStorage.setItem(completedKey(walletAddress), "1"); } catch {}
    setSession({ ...session, onboarding_completed: true, bound_domain: bound ? domain.trim().toLowerCase() : (session?.bound_domain || "") });
  };

  return (
    <Page title="Activate your Creator identity" subtitle="Bind your Freename domain to finish onboarding">
      <Card className="max-w-md space-y-4">
        <div className="flex items-center gap-2 text-sm text-accent"><CheckCircle2 className="w-4 h-4" /> Wallet connected · {chain}</div>
        <div className="flex items-center gap-2 text-sm text-accent break-all"><CheckCircle2 className="w-4 h-4 shrink-0" /> Identity verified · {walletAddress?.slice(0, 8)}…{walletAddress?.slice(-4)}</div>
        <div className="border-t border-border pt-4 space-y-2">
          <label className="text-sm font-medium flex items-center gap-1.5"><Globe className="w-4 h-4" /> Freename domain</label>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourname.livestreamlab" disabled={bound} />
          <button onClick={bind} disabled={busy || bound} className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
            {bound ? "Bound ✓" : busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Bind domain"}
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button onClick={finish} className="w-full px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium">Enter Creator Dashboard</button>
        <p className="text-xs text-muted-foreground text-center">Binding is recorded on-chain-ready; live minting runs once Freename credentials are configured.</p>
      </Card>
    </Page>
  );
}