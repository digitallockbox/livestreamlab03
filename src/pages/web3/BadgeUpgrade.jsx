import { useState } from "react";
import { Loader2, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreatorBadge from "@/components/web3/CreatorBadge";
import { useCreator } from "@/hooks/web3/useCreator";
import { useIdentity } from "@/lib/web3/identity";
import { toast } from "sonner";

const TIERS = ["bronze", "silver", "gold", "diamond"];
const COSTS = { bronze: 0, silver: 250, gold: 1000, diamond: 5000 };

export default function BadgeUpgrade() {
  const { profile, loading, refresh } = useCreator();
  const { signedInvoke } = useIdentity();
  const [busy, setBusy] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentIdx = TIERS.indexOf(profile?.badge_tier || "bronze");

  const upgrade = async (tier) => {
    setBusy(tier);
    try {
      const res = await signedInvoke("web3Badges", { tier });
      toast.success(`Upgraded to ${res.new_tier}`);
      refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold">Creator Badge</h1>
        <p className="text-sm text-muted-foreground mt-1">Upgrade your badge tier to unlock higher creator perks.</p>
        {profile && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">Current:</span>
            <CreatorBadge tier={profile.badge_tier} size="lg" />
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {TIERS.map((tier, i) => {
          const unlocked = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div
              key={tier}
              className={`rounded-2xl border p-6 space-y-3 ${
                isCurrent ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <CreatorBadge tier={tier} size="lg" />
                {isCurrent && <span className="text-xs text-primary font-medium">Current</span>}
              </div>
              <p className="text-sm text-muted-foreground">Cost: {COSTS[tier]} $STREAMING</p>
              {unlocked ? (
                <Button disabled variant="secondary" className="w-full">
                  Unlocked
                </Button>
              ) : (
                <Button onClick={() => upgrade(tier)} disabled={busy === tier} className="w-full gap-2">
                  {busy === tier ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowUp className="w-4 h-4" /> Upgrade to {tier}
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}