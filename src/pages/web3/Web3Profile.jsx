import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Web3IdentityCard from "@/components/web3/Web3IdentityCard";
import { useCreator } from "@/hooks/web3/useCreator";
import { web3Profile } from "@/lib/web3/web3Profile";
import { toast } from "sonner";

export default function Web3Profile() {
  const { profile, loading, refresh } = useCreator();
  const [form, setForm] = useState({ display_name: "", avatar_url: "", bio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        avatar_url: profile.avatar_url || "",
        bio: profile.bio || ""
      });
    }
  }, [profile]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await web3Profile.update(form);
      toast.success("Profile updated");
      refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No Web3 profile yet. Connect your wallet first at /web3/login.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Web3IdentityCard profile={profile} />
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Edit Profile</h2>
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input value={form.display_name} onChange={set("display_name")} className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Avatar URL</Label>
          <Input value={form.avatar_url} onChange={set("avatar_url")} placeholder="https://..." className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea value={form.bio} onChange={set("bio")} rows={3} className="bg-muted" />
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
        </Button>
      </div>
    </div>
  );
}