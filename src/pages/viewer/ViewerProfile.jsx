import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bookmark, ShoppingBag, Crown, Edit2, Check, X } from "lucide-react";
import WatchlistTab from "@/components/viewer/WatchlistTab";
import PurchaseHistoryTab from "@/components/viewer/PurchaseHistoryTab";
import SubscriptionsTab from "@/components/viewer/SubscriptionsTab";

export default function ViewerProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    const profiles = await base44.entities.ViewerProfile.filter({ user_email: me.email });
    if (profiles.length > 0) {
      setProfile(profiles[0]);
      setEditForm({ display_name: profiles[0].display_name || me.full_name, bio: profiles[0].bio || "" });
    } else {
      const newProfile = await base44.entities.ViewerProfile.create({
        user_email: me.email,
        display_name: me.full_name,
        watchlist: [],
        purchase_history: [],
        active_subscriptions: [],
        followed_creators: []
      });
      setProfile(newProfile);
      setEditForm({ display_name: me.full_name, bio: "" });
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    const updated = await base44.entities.ViewerProfile.update(profile.id, editForm);
    setProfile(updated);
    setEditing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-3xl font-bold text-primary">
            {(profile?.display_name || user?.full_name || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={editForm.display_name}
                  onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Display name"
                />
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none h-20"
                  placeholder="Bio..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveProfile} className="gap-1.5 h-8 text-xs"><Check className="w-3.5 h-3.5" />Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="gap-1.5 h-8 text-xs"><X className="w-3.5 h-3.5" />Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold font-display text-foreground">{profile?.display_name || user?.full_name}</h1>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
                {profile?.bio && <p className="text-sm text-foreground/80">{profile.bio}</p>}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
          {[
            { label: "Watchlist", value: profile?.watchlist?.length || 0, icon: Bookmark, color: "text-primary" },
            { label: "Purchases", value: profile?.purchase_history?.length || 0, icon: ShoppingBag, color: "text-chart-3" },
            { label: "Subscriptions", value: profile?.active_subscriptions?.filter(s => s.status === "active").length || 0, icon: Crown, color: "text-accent" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xl font-bold font-display text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="watchlist">
        <TabsList className="w-full bg-secondary border border-border">
          <TabsTrigger value="watchlist" className="flex-1 gap-1.5"><Bookmark className="w-3.5 h-3.5" />Watchlist</TabsTrigger>
          <TabsTrigger value="purchases" className="flex-1 gap-1.5"><ShoppingBag className="w-3.5 h-3.5" />Purchases</TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex-1 gap-1.5"><Crown className="w-3.5 h-3.5" />Subscriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="watchlist"><WatchlistTab profile={profile} onUpdate={setProfile} /></TabsContent>
        <TabsContent value="purchases"><PurchaseHistoryTab profile={profile} /></TabsContent>
        <TabsContent value="subscriptions"><SubscriptionsTab profile={profile} onUpdate={setProfile} /></TabsContent>
      </Tabs>
    </div>
  );
}