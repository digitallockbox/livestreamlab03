import React, { useEffect, useState } from "react";
import { useCreator } from "@/hooks/web3/useCreator";
import { useViewerWallet, web3ProfileAPI, socialAPI, Page, Card, Input, Spinner, SocialGraph, FollowButton } from "@/components/creator/os";
import CreatorIdentityHeader from "@/components/creator/CreatorIdentityHeader";

export default function Profile() {
  const { profile, loading, refresh } = useCreator();
  const viewerWallet = useViewerWallet();
  const [graph, setGraph] = useState(null);
  const [form, setForm] = useState({ display_name: "", bio: "", ens_name: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ display_name: profile.display_name || "", bio: profile.bio || "", ens_name: profile.ens_name || "", avatar_url: profile.avatar_url || "" });
  }, [profile]);
  useEffect(() => { if (viewerWallet) socialAPI.graph(viewerWallet).then(setGraph); }, [viewerWallet]);

  if (loading) return <Page title="Web3 Profile" subtitle="Your on-chain creator identity"><Spinner /></Page>;

  const save = async () => {
    setSaving(true);
    try { await web3ProfileAPI.update(form); refresh(); } finally { setSaving(false); }
  };

  return (
    <Page title="Web3 Profile" subtitle="Your on-chain creator identity">
      <CreatorIdentityHeader profile={profile} />
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {graph && <SocialGraph graph={graph} />}
          {profile?.wallet_address && <FollowButton creatorWallet={profile.wallet_address} viewerWallet={viewerWallet} />}
        </div>
      </Card>
      <Card className="space-y-3 max-w-xl">
        <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Display name" />
        <Input value={form.ens_name} onChange={(e) => setForm({ ...form, ens_name: e.target.value })} placeholder="ENS name (name.eth)" />
        <Input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="Avatar URL" />
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Bio" className="w-full rounded-md border border-input bg-muted px-3 py-2" />
        <button onClick={save} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{saving ? "Saving..." : "Save Profile"}</button>
      </Card>
    </Page>
  );
}