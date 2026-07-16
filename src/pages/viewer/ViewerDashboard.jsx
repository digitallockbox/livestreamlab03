import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Radio, Wallet, LogOut, Zap, Eye, Clock, UserCheck, CreditCard, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// ViewerDashboard — landing page for email-authenticated viewers (no wallet).
// Shows live streams and a CTA to connect a wallet for watch-to-earn.
export default function ViewerDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedProfiles, setFollowedProfiles] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;

    // Load or create ViewerProfile (keyed by user_email — no wallet needed)
    base44.entities.ViewerProfile.filter({ user_email: user.email }, null, 1)
      .then(async (data) => {
        if (!active) return;
        if (data.length > 0) {
          setProfile(data[0]);
        } else {
          const created = await base44.entities.ViewerProfile.create({
            user_email: user.email,
            display_name: user.email.split("@")[0],
            followed_creators: [],
            watchlist: [],
            active_subscriptions: [],
          });
          if (active) setProfile(created);
        }
      })
      .catch(() => {});

    // Load live streams
    base44.entities.Stream.filter({ status: "live" }, "-created_date", 20)
      .then((data) => { if (active) setLiveStreams(data || []); })
      .catch(() => { if (active) setLiveStreams([]); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [user?.email]);

  // Load followed creators' Web3Profile data for display names + storefront links
  useEffect(() => {
    if (!profile?.followed_creators?.length) { setFollowedProfiles([]); return; }
    let active = true;
    base44.entities.Web3Profile.filter({ wallet_address: { $in: profile.followed_creators } })
      .then((data) => { if (active) setFollowedProfiles(data || []); })
      .catch(() => { if (active) setFollowedProfiles([]); });
    return () => { active = false; };
  }, [profile]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg">LiveStreamLab</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">Viewer</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>}
            <button onClick={() => logout(true)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 bg-gradient-card">
          <h2 className="font-display text-2xl font-bold">
            Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse live streams and connect your wallet to start earning $STREAMING tokens.
          </p>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Earn while you watch</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Connect a wallet to earn $STREAMING tokens for watch time, streaks, and boosts.
              </p>
            </div>
          </div>
          <Link
            to="/enter"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 shrink-0"
          >
            <Zap className="w-4 h-4" /> Connect Wallet
          </Link>
        </div>

        {/* Followed Creators */}
        {(profile?.followed_creators || []).length > 0 && (
          <div>
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" /> Followed Creators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {followedProfiles.map((creator) => (
                <Link
                  key={creator.id}
                  to={creator.bound_domain ? `/s/${creator.bound_domain}` : "#"}
                  className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {creator.avatar_url ? (
                      <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        {(creator.display_name || creator.wallet_address || "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {creator.display_name || creator.ens_name || `${(creator.wallet_address || "").slice(0, 8)}…`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono">{creator.wallet_address}</p>
                  </div>
                </Link>
              ))}
              {(profile?.followed_creators || []).filter(
                (w) => !followedProfiles.some((p) => p.wallet_address === w)
              ).map((wallet) => (
                <div key={wallet} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate font-mono">{wallet}</p>
                    <p className="text-xs text-muted-foreground">Creator profile not found</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Subscriptions */}
        {(profile?.active_subscriptions || []).filter((s) => s.status === "active").length > 0 && (
          <div>
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent" /> Your Subscriptions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(profile?.active_subscriptions || []).filter((s) => s.status === "active").map((sub, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{sub.creator_name || "Creator"}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent capitalize">{sub.tier}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>${sub.price_monthly || 0}/month</span>
                    {sub.renews_at && <span>Renews {new Date(sub.renews_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-accent" /> Live Now
          </h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : liveStreams.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Eye className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No streams live right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                >
                  {stream.thumbnail_url && (
                    <img
                      src={stream.thumbnail_url}
                      alt=""
                      className="rounded-lg mb-3 w-full h-32 object-cover"
                    />
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-xs text-destructive font-medium">LIVE</span>
                    <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {stream.viewer_count || 0}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm truncate">{stream.title}</h4>
                  {stream.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{stream.description}</p>
                  )}
                  {stream.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize mt-2 inline-block">
                      {stream.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}