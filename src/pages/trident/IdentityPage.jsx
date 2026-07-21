import React, { useState, useEffect } from "react";
import { Wallet, ShieldCheck, ShieldAlert } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import WalletInfo from "@/components/trident/identity/WalletInfo";
import TokenUsage from "@/components/trident/identity/TokenUsage";
import { tokenService } from "@/services/trident/tokenService";
import { identityService } from "@/services/trident/identityService";

export default function IdentityPage() {
  const { walletAddress, session } = useIdentity();
  const [rate, setRate] = useState(null);
  const [usage, setUsage] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => { tokenService.getRate().then(setRate).catch(() => {}); }, []);
  useEffect(() => { identityService.getSession(walletAddress, session).then(setSessionInfo).catch(() => {}); }, [walletAddress, session]);
  useEffect(() => { if (walletAddress) tokenService.getUsage(walletAddress).then(setUsage).catch(() => {}); }, [walletAddress]);

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Identity + Web3 Login</h2>
      <WalletInfo walletAddress={walletAddress} session={session} />
      {sessionInfo && (
        <div className={`rounded-xl border p-4 flex items-center gap-2 ${sessionInfo.valid ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"}`}>
          {sessionInfo.valid ? <ShieldCheck className="w-4 h-4 text-accent" /> : <ShieldAlert className="w-4 h-4 text-destructive" />}
          <div>
            <p className="text-sm font-medium">{sessionInfo.valid ? "Session Valid" : "Session Invalid"}</p>
            <p className="text-xs text-muted-foreground">Tenant: {sessionInfo.tenant}{sessionInfo.expires ? ` · Expires: ${new Date(sessionInfo.expires).toLocaleString()}` : ""}</p>
          </div>
        </div>
      )}
      <TokenUsage rate={rate} usage={usage} />
    </div>
  );
}