import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Web3NameBadge, VerificationBadge, CreatorBadge, PassportBadge, domainsAPI } from "@/components/creator/os";

export default function CreatorIdentityHeader({ profile }) {
  const { walletAddress, chain, session } = useIdentity();
  const [domain, setDomain] = useState(profile?.bound_domain || session?.bound_domain || "");
  const [onboardingCompleted, setOnboardingCompleted] = useState(!!session?.onboarding_completed);

  useEffect(() => {
    if (!walletAddress) return;
    domainsAPI.get(walletAddress)
      .then((res) => {
        if (res?.domain) setDomain(res.domain);
        if (typeof res?.onboarding_completed === "boolean") setOnboardingCompleted(res.onboarding_completed);
      })
      .catch(() => {});
  }, [walletAddress]);

  const wallet = profile?.wallet_address || walletAddress || "";
  const short = wallet ? `${wallet.slice(0, 8)}…${wallet.slice(-4)}` : "No wallet";
  const activated = onboardingCompleted && !!domain;
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} className="w-14 h-14 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Wallet className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display font-semibold truncate">{profile?.display_name || short}</p>
          <p className="font-mono text-xs text-muted-foreground truncate">{wallet || "—"}</p>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <Web3NameBadge creator={profile} />
            <VerificationBadge creator={profile} />
            <CreatorBadge creator={profile} />
            <PassportBadge creator={profile} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-2">
        <div className="flex gap-2 flex-wrap">
          {chain && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary capitalize">{chain}</span>
          )}
          {domain && (
            <Link to={`/s/${domain}`} className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent flex items-center gap-1 hover:bg-accent/25 transition-colors">
              <Globe className="w-3 h-3" /> {domain}
            </Link>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${activated ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
          {activated ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {activated ? "Onboarding Complete" : "Pending Domain Verification"}
        </span>
      </div>
    </div>
  );
}