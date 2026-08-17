import React, { useRef, useState } from "react";
import { Globe, CheckCircle2, Loader2, Zap, Shield, ShieldAlert, ImagePlus, ArrowRight, ArrowLeft } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Input } from "@/components/creator/os";
import { base44 } from "@/api/base44Client";
import { PLATFORM_TLD, TOKEN_GATE_MIN_BALANCE } from "@/lib/constants/identity";

// Onboarding — multi-step creator activation:
//   Step 1: Profile (display name, avatar, bio)
//   Step 2: Domain binding (Freename .livestreamlab)
//   Step 3: Complete — persist onboarding_completed + bound_domain, enter dashboard
//
// Role, STREAMING balance, and token-gate status are shown throughout so the
// user sees the result of the wallet handshake.
export default function Onboarding() {
  const { walletAddress, chain, session, setSession, signedInvoke, role, tokenBalance, tokenGated } = useIdentity();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(session?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(session?.avatar_url || "");
  const [bio, setBio] = useState(session?.bio || "");
  const [domain, setDomain] = useState(session?.bound_domain || "");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [bound, setBound] = useState(!!session?.bound_domain);
  const fileRef = useRef(null);

  if (!walletAddress || !chain) {
    return (
      <Page title="Activate your Creator identity" subtitle="Bind your Freename domain to finish onboarding">
        <Card className="max-w-md text-sm text-muted-foreground">Connecting your wallet…</Card>
      </Page>
    );
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
    } catch {
      setError("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Step 1 → 2: save profile fields, advance to domain binding.
  const saveProfile = async () => {
    setBusy(true);
    setError("");
    try {
      const patch = {};
      if (displayName.trim()) patch.display_name = displayName.trim();
      if (avatarUrl) patch.avatar_url = avatarUrl;
      if (bio.trim()) patch.bio = bio.trim();
      if (Object.keys(patch).length > 0) {
        const res = await signedInvoke("web3Profile", { action: "update", ...patch });
        if (res?.profile) setSession(res.profile);
      }
      setStep(2);
    } catch (e) {
      setError(e?.message || "Profile save failed");
    } finally {
      setBusy(false);
    }
  };

  // Step 2: bind a Freename domain.
  const bindDomain = async () => {
    const name = domain.trim().toLowerCase();
    if (!name) { setError("Enter a domain name"); return; }
    setBusy(true);
    setError("");
    try {
      await signedInvoke("freenamePurchase", { action: "purchase", domain: name, wallet: walletAddress });
      setBound(true);
    } catch (e) {
      setError(e?.message || "Domain bind failed");
    } finally {
      setBusy(false);
    }
  };

  // Step 3: persist onboarding_completed + bound_domain, enter dashboard.
  const complete = async () => {
    setBusy(true);
    setError("");
    try {
      const boundDomain = domain.trim().toLowerCase();
      const res = await signedInvoke("web3Profile", {
        action: "update",
        onboarding_completed: true,
        bound_domain: boundDomain,
      });
      if (res?.profile) {
        setSession(res.profile);
      } else {
        setSession({ ...session, onboarding_completed: true, bound_domain: boundDomain });
      }
    } catch (e) {
      setError(e?.message || "Failed to complete onboarding");
      setBusy(false);
    }
  };

  return (
    <Page title="Activate your Creator identity" subtitle="Complete your profile and bind your domain">
      <Card className="max-w-lg space-y-5">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          {["Profile", "Domain", "Complete"].map((label, i) => {
            const stepNum = i + 1;
            const active = step === stepNum;
            const done = step > stepNum;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-accent text-accent-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className={`text-xs ${active || done ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${step > stepNum ? "bg-accent" : "bg-border"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Login status: role, STREAMING balance, token gate */}
        <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Wallet</span>
            <span className="font-mono">{walletAddress?.slice(0, 8)}…{walletAddress?.slice(-4)} · {chain}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{role || "viewer"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3 text-accent" /> $STREAMING Balance</span>
            <span className="font-medium">{(tokenBalance || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              {tokenGated ? <Shield className="w-3 h-3 text-accent" /> : <ShieldAlert className="w-3 h-3 text-amber-500" />} Token Gate
            </span>
            <span className={tokenGated ? "text-accent font-medium" : "text-amber-500 font-medium"}>
              {tokenGated ? `✓ Gated (≥${TOKEN_GATE_MIN_BALANCE} $STREAMING)` : `Hold ≥${TOKEN_GATE_MIN_BALANCE} $STREAMING`}
            </span>
          </div>
        </div>

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your creator name" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Avatar</label>
              <div className="flex items-center gap-3 mt-1">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">None</div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {avatarUrl ? "Change" : "Upload"}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell viewers about yourself" rows={3} className="w-full rounded-md border border-input bg-muted px-3 py-2 mt-1 text-sm" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button onClick={saveProfile} disabled={busy} className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm flex items-center justify-center gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* Step 2: Domain */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-1.5"><Globe className="w-4 h-4" /> Freename Domain</label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourname.livestreamlab" disabled={bound} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">This becomes your on-chain creator identity under the {PLATFORM_TLD} TLD.</p>
            </div>
            {bound && (
              <div className="flex items-center gap-2 text-sm text-accent">
                <CheckCircle2 className="w-4 h-4" /> Domain bound: {domain}
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} disabled={busy} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {!bound ? (
                <button onClick={bindDomain} disabled={busy || !domain.trim()} className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm flex items-center justify-center gap-2">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bind Domain"}
                </button>
              ) : (
                <button onClick={() => setStep(3)} className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gradient-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-accent"><CheckCircle2 className="w-4 h-4" /> Profile configured</div>
              <div className="flex items-center gap-2 text-sm text-accent"><CheckCircle2 className="w-4 h-4" /> Domain bound: {domain}</div>
              <div className="flex items-center gap-2 text-sm text-accent"><CheckCircle2 className="w-4 h-4" /> Identity: {domain}</div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              You're ready to enter the Creator OS. Your identity <span className="font-mono text-foreground">{domain}</span> is active.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} disabled={busy} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={complete} disabled={busy} className="flex-1 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium flex items-center justify-center gap-2">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enter Creator Dashboard"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </Page>
  );
}