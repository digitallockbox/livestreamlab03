import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Smartphone } from "lucide-react";

export default function SecuritySettings() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground mt-1">Keep your account secure.</p>
      </div>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Change Password</h3>
          </div>
          <div><Label>Current Password</Label><Input type="password" className="mt-1.5 bg-secondary border-border" /></div>
          <div><Label>New Password</Label><Input type="password" className="mt-1.5 bg-secondary border-border" /></div>
          <div><Label>Confirm New Password</Label><Input type="password" className="mt-1.5 bg-secondary border-border" /></div>
          <Button className="bg-primary hover:bg-primary/90">Update Password</Button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Two-Factor Authentication</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-foreground">Enable 2FA</p>
              <p className="text-xs text-muted-foreground mt-0.5">Secure your account with 2FA</p>
            </div>
            <Switch />
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Active Sessions</h3>
          </div>
          {["Chrome on Mac · Active now", "Firefox on Windows · 2h ago"].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl mb-2">
              <span className="text-sm text-foreground">{s}</span>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 text-xs">Revoke</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}