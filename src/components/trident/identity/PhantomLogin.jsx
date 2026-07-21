import React, { useState, useEffect } from "react";
import { Wallet, ShieldCheck, AlertCircle, Loader2, Building2, LogOut, ExternalLink, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { identityService } from "@/services/trident/identityService";
import { WALLET_TOKEN_KEY } from "@/lib/engineConfig";

const TENANTS = ["livestreamlab", "default", "demo"];

export default function PhantomLogin() {
  const [provider, setProvider] = useState(null);
  const [phantomInstalled, setPhantomInstalled] = useState(true);
  const [wallet, setWallet] = useState("");
  const [session, setSession] = useState(null);
  const [tenant, setTenant] = useState("livestreamlab");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const solana = window.solana || window.phantom?.solana;
    if (solana?.isPhantom) {
      setProvider(solana);
    } else {
      setPhantomInstalled(false);
    }

    // Restore existing session from localStorage and validate it
    const token = localStorage.getItem(WALLET_TOKEN_KEY);
    const savedWallet = localStorage.getItem("phantom_wallet");
    const savedTenant = localStorage.getItem("phantom_tenant");
    const savedExpires = localStorage.getItem("phantom_session_expires");

    if (token && savedWallet) {
      const validation = identityService.validateSession({ expires_at: savedExpires });
      if (validation.valid) {
        setWallet(savedWallet);
        setTenant(savedTenant || "livestreamlab");
        setSession({ sessionToken: token, expires: savedExpires, tenant: savedTenant || "livestreamlab" });
      } else {
        // Session expired — clear stale data
        localStorage.removeItem(WALLET_TOKEN_KEY);
        localStorage.removeItem("phantom_wallet");
        localStorage.removeItem("phantom_tenant");
        localStorage.removeItem("phantom_session_expires");
      }
    }
  }, []);

  const connect = async () => {
    if (!provider) {
      setError("Phantom wallet not detected. Install Phantom to continue.");
      return;
    }
    setConnecting(true);
    setError("");
    try {
      await provider.connect();
      const pubKey = provider.publicKey.toString();
      const message = `Login to LiveStreamLab.live: ${new Date().toISOString()}`;
      const encoded = new TextEncoder().encode(message);
      const { signature } = await provider.signMessage(encoded, "utf8");
      const signatureStr = btoa(String.fromCharCode(...signature));

      const res = await identityService.login(pubKey, signatureStr);
      if (res.sessionToken) {
        setWallet(pubKey);
        setSession(res);
        localStorage.setItem(WALLET_TOKEN_KEY, res.sessionToken);
        localStorage.setItem("phantom_wallet", pubKey);
        localStorage.setItem("phantom_tenant", tenant);
        localStorage.setItem("phantom_session_expires", res.expires || "");
      } else {
        setError("Login failed: no session token returned.");
      }
    } catch (e) {
      if (e.code === 4001) {
        setError("Connection rejected. Please approve the Phantom prompt to continue.");
      } else {
        setError(e.message || "Login failed. Please try again.");
      }
    } finally {
      setConnecting(false);
    }
  };

  const changeTenant = (t) => {
    setTenant(t);
    if (session) {
      localStorage.setItem("phantom_tenant", t);
      setSession({ ...session, tenant: t });
    }
  };

  const logout = () => {
    localStorage.removeItem(WALLET_TOKEN_KEY);
    localStorage.removeItem("phantom_wallet");
    localStorage.removeItem("phantom_tenant");
    localStorage.removeItem("phantom_session_expires");
    setWallet("");
    setSession(null);
    provider?.disconnect?.().catch(() => {});
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary" /> Phantom Wallet Login
      </h2>

      {!phantomInstalled && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Phantom wallet not installed</p>
            <a
              href="https://phantom.app/download"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
            >
              Install Phantom <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {session ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <p className="font-display font-semibold text-accent">Session Active</p>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Wallet Address</p>
              <p className="font-mono break-all">{wallet}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tenant</p>
              <p className="font-medium">{session.tenant}</p>
            </div>
            {session.expires && (
              <div>
                <p className="text-xs text-muted-foreground">Session Expires</p>
                <p className="font-medium">{new Date(session.expires).toLocaleString()}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 inline-flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Switch Tenant
            </p>
            <select
              value={tenant}
              onChange={(e) => changeTenant(e.target.value)}
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
            >
              {TENANTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-destructive/15 text-destructive text-sm hover:bg-destructive/25 w-full justify-center"
          >
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Phantom wallet to authenticate with the Identity Engine. You'll sign a message to prove wallet ownership — no transaction fees.
          </p>
          <button
            onClick={connect}
            disabled={connecting || !phantomInstalled}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium w-full hover:bg-primary/90 disabled:opacity-50"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" /> Connect Phantom Wallet
              </>
            )}
          </button>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 inline-flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Tenant
            </p>
            <select
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
            >
              {TENANTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <Link
        to="/trident/identity"
        className="text-primary hover:underline text-sm inline-flex items-center gap-1"
      >
        <KeyRound className="w-3.5 h-3.5" /> Back to Identity Engine
      </Link>
    </div>
  );
}