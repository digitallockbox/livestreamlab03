import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VerificationBadge from "@/components/web3/VerificationBadge";
import { useCreator } from "@/hooks/web3/useCreator";
import { useIdentity } from "@/lib/web3/identity";
import { toast } from "sonner";

export default function Web3Verify() {
  const { profile, loading, refresh } = useCreator();
  const { signedInvoke } = useIdentity();
  const [verifying, setVerifying] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const verify = async (level) => {
    setVerifying(level);
    try {
      await signedInvoke("web3Verify", { level });
      toast.success(`Verified as ${level}`);
      refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-display font-bold">Identity Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify your Web3 identity to unlock trust signals across the platform.
        </p>
        {profile && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Current:</span>
            <VerificationBadge level={profile.verification_level} size={20} />
            <span className="text-sm capitalize">{profile.verification_level || "none"}</span>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="font-display font-semibold">Basic Verification</h3>
          <p className="text-sm text-muted-foreground">Confirm wallet ownership with a quick on-chain check.</p>
          <Button onClick={() => verify("basic")} disabled={!!verifying} variant="outline" className="w-full">
            {verifying === "basic" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Basic"}
          </Button>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-3">
          <h3 className="font-display font-semibold">Full Verification</h3>
          <p className="text-sm text-muted-foreground">Linked socials + human proof. Grants the verified checkmark.</p>
          <Button onClick={() => verify("full")} disabled={!!verifying} className="w-full">
            {verifying === "full" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Full"}
          </Button>
        </div>
      </div>
    </div>
  );
}