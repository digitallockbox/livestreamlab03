import React from "react";
import { Wallet, Globe } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Web3NameBadge, VerificationBadge, CreatorBadge, PassportBadge } from "@/components/creator/os";

export default function CreatorIdentityHeader({ profile }) {
  const { walletAddress, chain } = useIdentity();
  const wallet = profile?.wallet_address || walletAddress || "";
  const domain = profile?.bound_domain || "";
  const short = wallet ? `${wallet.slice(0, 8)}…${wallet.slice(-4)}` : "No wallet";
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
      <div className="flex gap-2 flex-wrap">
        {chain && (
          <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary capitalize">{chain}</span>
        )}
        {domain && (
          <span className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent flex items-center gap-1">
            <Globe className="w-3 h-3" /> {domain}
          </span>
        )}
      </div>
    </div>
  );
}