import { Loader2 } from "lucide-react";
import { useCreatorGraph } from "@/hooks/web3/useCreatorGraph";
import Web3IdentityCard from "@/components/web3/Web3IdentityCard";
import PassportBadge from "@/components/web3/PassportBadge";
import CreatorBadge from "@/components/web3/CreatorBadge";
import VerificationBadge from "@/components/web3/VerificationBadge";

export default function CreatorPassport() {
  const { graph, loading } = useCreatorGraph();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!graph) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No passport found. Connect your wallet first at /web3/login.
      </div>
    );
  }

  const stats = [
    { label: "Followers", value: graph.followers || 0 },
    { label: "Following", value: graph.following || 0 },
    { label: "Graph Size", value: graph.graph_size || 0 }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Creator Passport</h1>
          <p className="text-sm text-muted-foreground mt-1">Your portable on-chain creator identity.</p>
        </div>
        <PassportBadge rank={graph.badge_rank} />
      </div>
      <Web3IdentityCard profile={graph} />
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="font-display font-semibold">Trust Signals</h3>
        <div className="flex items-center gap-2 text-sm">
          <VerificationBadge level={graph.verification_level} /> Verification: {graph.verification_level || "none"}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CreatorBadge tier={graph.badge_tier} /> Badge tier: {graph.badge_tier}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${graph.verified_badge ? "bg-accent" : "bg-muted-foreground"}`} />
          Verified: {graph.verified_badge ? "Yes" : "No"}
        </div>
      </div>
    </div>
  );
}