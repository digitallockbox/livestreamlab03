import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, UserPlus, UserMinus, LogIn } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// ViewerFollowButton — lets email-authenticated viewers follow creators.
// Uses the ViewerProfile entity (keyed by user_email) directly — no wallet
// or backend function required. Shows a login prompt for unauthenticated users.
export default function ViewerFollowButton({ creatorWallet }) {
  const { user, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    let active = true;
    base44.entities.ViewerProfile.filter({ user_email: user.email }, null, 1)
      .then((data) => {
        if (!active || !data.length) return;
        setProfileId(data[0].id);
        setFollowing((data[0].followed_creators || []).includes(creatorWallet));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [isAuthenticated, user?.email, creatorWallet]);

  const toggle = async () => {
    if (!profileId || busy) return;
    setBusy(true);
    try {
      const [current] = await base44.entities.ViewerProfile.filter({ user_email: user.email }, null, 1);
      if (!current) return;
      const list = current.followed_creators || [];
      const updated = following
        ? list.filter((w) => w !== creatorWallet)
        : [...list, creatorWallet];
      await base44.entities.ViewerProfile.update(current.id, { followed_creators: updated });
      setFollowing(!following);
    } catch (err) {
      console.warn("Follow toggle failed:", err);
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated || !user?.email) {
    return (
      <Link
        to="/enter"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-sm hover:bg-muted"
      >
        <LogIn className="w-4 h-4" /> Login to follow
      </Link>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm border transition-colors disabled:opacity-50 ${
        following
          ? "border-border text-muted-foreground hover:bg-muted"
          : "border-primary/30 text-primary bg-primary/10 hover:bg-primary/20"
      }`}
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}