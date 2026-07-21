import React, { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import WalletInfo from "@/components/trident/identity/WalletInfo";
import TokenUsage from "@/components/trident/identity/TokenUsage";
import { tokenService } from "@/services/trident/tokenService";

export default function IdentityPage() {
  const { walletAddress, session } = useIdentity();
  const [rate, setRate] = useState(null);
  useEffect(() => { tokenService.getRate().then(setRate).catch(() => {}); }, []);
  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Identity + Web3 Login</h2>
      <WalletInfo walletAddress={walletAddress} session={session} />
      <TokenUsage rate={rate} />
    </div>
  );
}