import React, { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Save, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIdentity } from "@/lib/web3/identity";
import { base44 } from "@/api/base44Client";

// ProfileSettings — public channel profile: banner + avatar upload, bio,
// and external social handles. Persists to the wallet-owned Web3Profile.
export default function ProfileSettings() {
  const { walletAddress, session, signedInvoke, refreshProfile } = useIdentity();
  const [form, setForm] = useState({ display_name: "", bio: "", avatar_url: "", banner_url: "", twitch_username: "", twitter_handle: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(null); // "avatar" | "banner" | null
  const avatarInput = useRef(null);
  const bannerInput = useRef(null);

  useEffect(() => {
    if (session) {
      setForm({
        display_name: session.display_name || "",
        bio: session.bio || "",
        avatar_url: session.avatar_url || "",
        banner_url: session.banner_url || "",
        twitch_username: session.twitch_username || "",
        twitter_handle: session.twitter_handle || "",
      });
    }
  }, [session]);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };

  const upload = async (file, key) => {
    if (!file) return;
    setUploading(key);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      set(key, res.file_url);
    } catch (e) {
      console.warn("Upload failed:", e?.message || e);
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!walletAddress) return;
    setSaving(true);
    setSaved(false);
    try {
      await signedInvoke("web3Profile", { action: "update", ...form });
      await refreshProfile();
      setSaved(true);
    } catch (e) {
      console.warn("Profile save failed:", e?.message || e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Channel Profile</h1>
        <p className="text-muted-foreground mt-1">Your public creator profile, banner, and social links.</p>
      </div>

      {/* Banner */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="relative h-40 sm:h-52 bg-gradient-card">
          {form.banner_url ? (
            <img src={form.banner_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
          <button
            onClick={() => bannerInput.current?.click()}
            disabled={uploading === "banner"}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background/80 backdrop-blur border border-border text-sm hover:bg-background"
          >
            {uploading === "banner" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            {form.banner_url ? "Change banner" : "Upload banner"}
          </button>
          <input ref={bannerInput} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], "banner_url")} />
        </div>

        {/* Avatar + name */}
        <div className="p-5 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-display font-bold text-primary">
                  {(form.display_name || walletAddress || "?").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => avatarInput.current?.click()}
              disabled={uploading === "avatar"}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              {uploading === "avatar" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 text-muted-foreground" />}
            </button>
            <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], "avatar_url")} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">{form.display_name || "Unnamed creator"}</p>
            <p className="font-mono text-xs text-muted-foreground break-all">{walletAddress}</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
        <div>
          <Label>Display Name</Label>
          <Input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} placeholder="Your channel name" className="mt-1.5 bg-secondary border-border" />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell viewers about your channel" className="mt-1.5 bg-secondary border-border h-24" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Twitch Username</Label>
            <Input value={form.twitch_username} onChange={(e) => set("twitch_username", e.target.value)} placeholder="channelname" className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <Label>X (Twitter) Handle</Label>
            <Input value={form.twitter_handle} onChange={(e) => set("twitter_handle", e.target.value)} placeholder="@handle" className="mt-1.5 bg-secondary border-border" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={save} disabled={saving || !walletAddress} className="bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            Save Changes
          </Button>
          {saved && <span className="text-sm text-accent inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
        </div>
      </div>
    </div>
  );
}