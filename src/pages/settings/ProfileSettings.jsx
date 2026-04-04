import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";

export default function ProfileSettings() {
  const [form, setForm] = useState({ name: "CryptoCreator", bio: "Gaming & crypto content creator.", twitter: "@cryptocreator", youtube: "CryptoCreatorYT" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Update your public creator profile.</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary">CC</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div><p className="text-sm font-medium text-foreground">Profile Photo</p><p className="text-xs text-muted-foreground mt-0.5">JPG, PNG up to 5MB</p></div>
        </div>
        <div><Label>Display Name</Label><Input value={form.name} onChange={e => set("name", e.target.value)} className="mt-1.5 bg-secondary border-border" /></div>
        <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => set("bio", e.target.value)} className="mt-1.5 bg-secondary border-border h-24" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Twitter</Label><Input value={form.twitter} onChange={e => set("twitter", e.target.value)} className="mt-1.5 bg-secondary border-border" /></div>
          <div><Label>YouTube</Label><Input value={form.youtube} onChange={e => set("youtube", e.target.value)} className="mt-1.5 bg-secondary border-border" /></div>
        </div>
        <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
      </div>
    </div>
  );
}