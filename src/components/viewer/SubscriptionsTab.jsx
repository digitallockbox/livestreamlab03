import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Crown, Calendar, ArrowUpRight, X } from "lucide-react";

const TIER_CONFIG = {
  basic:   { label: "Basic",   bg: "bg-secondary text-muted-foreground border-border" },
  plus:    { label: "Plus",    bg: "bg-primary/10 text-primary border-primary/20" },
  premium: { label: "Premium", bg: "bg-accent/10 text-accent border-accent/20" },
};

const STATUS_CONFIG = {
  active:    { label: "Active",    bg: "bg-accent/10 text-accent border-accent/20" },
  cancelled: { label: "Cancelled", bg: "bg-secondary text-muted-foreground border-border" },
  expired:   { label: "Expired",   bg: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function SubscriptionsTab({ profile, onUpdate }) {
  const subs = profile?.active_subscriptions || [];

  const cancelSub = async (index) => {
    const updated_subs = subs.map((s, i) => i === index ? { ...s, status: "cancelled" } : s);
    const updated = await base44.entities.ViewerProfile.update(profile.id, { active_subscriptions: updated_subs });
    onUpdate(updated);
  };

  if (subs.length === 0) return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center mt-4">
      <Crown className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-foreground font-medium mb-1">No subscriptions yet</p>
      <p className="text-sm text-muted-foreground">Subscribe to creators to unlock exclusive perks and content.</p>
    </div>
  );

  const activeCount = subs.filter(s => s.status === "active").length;
  const monthlyTotal = subs.filter(s => s.status === "active").reduce((sum, s) => sum + (s.price_monthly || 0), 0);

  return (
    <div className="space-y-4 mt-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Active Memberships</p>
          <p className="text-2xl font-bold font-display text-foreground">{activeCount}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Monthly Total</p>
          <p className="text-2xl font-bold font-display text-foreground">${monthlyTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Subscription Cards */}
      <div className="space-y-3">
        {subs.map((sub, i) => {
          const tierCfg = TIER_CONFIG[sub.tier] || TIER_CONFIG.basic;
          const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{sub.creator_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs border ${tierCfg.bg}`}>{tierCfg.label}</Badge>
                      <Badge className={`text-xs border ${statusCfg.bg}`}>{statusCfg.label}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">${(sub.price_monthly || 0).toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  {sub.renews_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                      <Calendar className="w-3 h-3" />Renews {new Date(sub.renews_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {sub.status === "active" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-border flex-1">
                    <ArrowUpRight className="w-3 h-3" />Upgrade
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => cancelSub(i)} className="h-7 text-xs gap-1 text-destructive hover:text-destructive flex-1">
                    <X className="w-3 h-3" />Cancel
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}