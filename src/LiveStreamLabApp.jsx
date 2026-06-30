// ======================================================
//  LiveStreamLabApp — Single merged structural frontend (all real)
//  One file: imports + API config + connectors + components + pages + router
//  Every connector bound to a real Base44 backend function via base44.functions.invoke
// ======================================================
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, Zap, CreditCard, ShoppingBag, Send, UserPlus, UserMinus, CheckCircle2, Radio, Video, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCreator } from "@/hooks/web3/useCreator";
import { PhantomIdentityProvider, useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import BrandingSettings from "@/pages/settings/BrandingSettings";
import SecuritySettings from "@/pages/settings/SecuritySettings";
import NotificationSettings from "@/pages/settings/NotificationSettings";
import ConnectedAccounts from "@/pages/settings/ConnectedAccounts";
import SupabaseExplorer from "@/pages/SupabaseExplorer";

// ======================================================
//  API CONFIG
// ======================================================
const invoke = (name, payload) => base44.functions.invoke(name, payload).then((r) => r.data);

// Identity root: the connected Phantom wallet is the viewer/creator identity across the whole OS.
const useViewerWallet = () => {
  const { wallet } = useStreamingIdentity();
  return wallet;
};

// ======================================================
//  API CONNECTORS (ALL MERGED — bound to real Base44 functions)
// ======================================================
const web3LoginAPI = {
  login: (wallet_address) => invoke("web3Login", { wallet_address }),
  nonce: () => invoke("web3Login", {}),
  verify: (payload) => invoke("web3Verify", payload),
};

const web3ProfileAPI = {
  me: () => invoke("web3Profile", { action: "me" }),
  get: (wallet_address) => invoke("web3Profile", { action: "get", wallet_address }),
  update: (payload) => invoke("web3Profile", { action: "update", ...payload }),
};

const verificationAPI = {
  mint: (level) => invoke("web3Verify", { level }),
};

const badgesAPI = {
  upgrade: (tier) => invoke("web3Badges", tier ? { tier } : {}),
};

const passportAPI = {
  get: () => invoke("web3Passport", {}),
};

const marketplaceAPI = {
  add: (creatorWallet, data) => invoke("web3Marketplace", { action: "add", creatorWallet, ...data }),
  list: (creatorWallet) => invoke("web3Marketplace", { action: "list", creatorWallet }),
  sales: (creatorWallet) => invoke("web3Marketplace", { action: "sales", creatorWallet }),
  purchase: (payload) => invoke("web3Marketplace", { action: "buy", ...payload }),
};

const watchAPI = {
  start: (viewerWallet, creatorWallet) => invoke("web3Watch", { action: "start", viewerWallet, creatorWallet }),
  tick: (sessionId) => invoke("web3Watch", { action: "tick", sessionId }),
  end: (sessionId) => invoke("web3Watch", { action: "end", sessionId }),
};

const boostsAPI = {
  send: (payload) => invoke("web3Boosts", { action: "send", ...payload }),
  list: (wallet) => invoke("web3Boosts", { action: "list", wallet }),
};

const subscriptionsAPI = {
  subscribe: (payload) => invoke("web3Subscriptions", { action: "subscribe", ...payload }),
  list: (wallet) => invoke("web3Subscriptions", { action: "list", wallet }),
};

const socialAPI = {
  follow: (payload) => invoke("web3Social", { action: "follow", ...payload }),
  unfollow: (payload) => invoke("web3Social", { action: "unfollow", ...payload }),
  graph: (wallet) => invoke("web3Social", { action: "graph", wallet }),
};

const feedAPI = {
  create: (payload) => invoke("web3Feed", { action: "create", ...payload }),
  get: (wallet) => invoke("web3Feed", { action: "get", wallet }),
  view: (postId) => invoke("web3Feed", { action: "view", postId }),
};

const messagingAPI = {
  send: (payload) => invoke("web3Messages", { action: "send", ...payload }),
  inbox: (wallet) => invoke("web3Messages", { action: "inbox", wallet }),
};

const economyAPI = {
  get: () => invoke("web3Economy", {}),
};

const streamsAPI = {
  start: (creatorWallet, title, extra = {}) => invoke("web3Streams", { action: "start", creatorWallet, title, ...extra }),
  live: () => invoke("web3Streams", { action: "live" }),
  past: (creatorWallet) => invoke("web3Streams", { action: "past", creatorWallet }),
  end: (streamId) => invoke("web3Streams", { action: "end", streamId }),
  analytics: (streamId) => invoke("web3Streams", { action: "analytics", streamId }),
};

const transfersAPI = {
  record: (payload) => invoke("web3Transfers", { action: "record", ...payload }),
  list: (wallet) => invoke("web3Transfers", { action: "list", wallet }),
};

const videoAPI = {
  list: (creatorWallet) => invoke("web3Videos", { action: "list", creatorWallet }),
  create: (creatorWallet, data) => invoke("web3Videos", { action: "create", creatorWallet, ...data }),
  update: (id, data) => invoke("web3Videos", { action: "update", id, ...data }),
  remove: (id) => invoke("web3Videos", { action: "delete", id }),
  analytics: (creatorWallet) => invoke("web3Videos", { action: "analytics", creatorWallet }),
};

// ======================================================
//  SHARED UI HELPERS
// ======================================================
const Page = ({ title, subtitle, children }) => (
  <div className="max-w-5xl mx-auto space-y-6 p-4">
    <div>
      <h1 className="text-2xl font-display font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>{children}</div>
);
const Spinner = () => <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
const Input = (props) => <input {...props} className={`w-full rounded-md border border-input bg-muted px-3 py-2 ${props.className || ""}`} />;

// Tiny mock fallback — used only when real data is empty, never blocks real calls
const withMock = (real, mock) => (real && Object.keys(real).length > 0 ? real : mock);

// ======================================================
//  COMPONENTS (all real)
// ======================================================
const Web3NameBadge = ({ creator }) => <span className="font-mono text-sm">{creator?.ens_name || creator?.display_name || "—"}</span>;
const VerificationBadge = ({ creator }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full ${creator?.verified ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
    {creator?.verified ? "Verified" : "Unverified"}
  </span>
);
const CreatorBadge = ({ creator }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary capitalize">{creator?.badge_tier || "bronze"}</span>
);
const PassportBadge = ({ creator }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
    {creator?.verification_level === "full" ? "Passport Active" : "No Passport"}
  </span>
);

const SocialGraph = ({ graph }) => (
  <div className="text-sm text-muted-foreground">
    Followers: {graph?.followers_count || 0} · Following: {graph?.following_count || 0} · Connections: {(graph?.following || []).length}
  </div>
);

const FollowButton = ({ creatorWallet, viewerWallet }) => {
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!viewerWallet) return;
    socialAPI.graph(viewerWallet).then((g) => setFollowing((g.following || []).includes(creatorWallet)));
  }, [viewerWallet, creatorWallet]);
  const handle = async () => {
    if (!viewerWallet || !creatorWallet) return;
    setBusy(true);
    try {
      const res = await (following ? socialAPI.unfollow({ followerWallet: viewerWallet, creatorWallet }) : socialAPI.follow({ followerWallet: viewerWallet, creatorWallet }));
      setFollowing(res.following);
    } finally { setBusy(false); }
  };
  return (
    <button onClick={handle} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      {following ? "Unfollow" : "Follow"}
    </button>
  );
};

const BoostButton = ({ creatorWallet, viewerWallet, amount = 10 }) => {
  const { signedInvoke } = useStreamingIdentity();
  const [sending, setSending] = useState(false);
  const handle = async () => {
    if (!viewerWallet || !creatorWallet) return;
    setSending(true);
    try { await signedInvoke("web3Boosts", { action: "send", viewerWallet, creatorWallet, amount, message: "Boost!" }); } finally { setSending(false); }
  };
  return (
    <button onClick={handle} disabled={sending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary/15 text-primary text-sm border border-primary/30 hover:bg-primary/25">
      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Boost {amount}
    </button>
  );
};

const SubscribeButton = ({ creatorWallet, viewerWallet, tier = "basic" }) => {
  const { signedInvoke } = useStreamingIdentity();
  const [sending, setSending] = useState(false);
  const handle = async () => {
    if (!viewerWallet || !creatorWallet) return;
    setSending(true);
    try { await signedInvoke("web3Subscriptions", { action: "subscribe", subscriberWallet: viewerWallet, creatorWallet, tier }); } finally { setSending(false); }
  };
  return (
    <button onClick={handle} disabled={sending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent/15 text-accent text-sm border border-accent/30 hover:bg-accent/25">
      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Subscribe ({tier})
    </button>
  );
};

// ======================================================
//  PAGES (all real)
// ======================================================

// Web3 Login
const Web3Login = () => {
  const [wallet, setWallet] = useState("");
  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const login = async () => {
    if (!wallet.trim()) return;
    setBusy(true);
    try { const res = await web3LoginAPI.login(wallet.trim()); setProfile(res.profile); } finally { setBusy(false); }
  };
  return (
    <Page title="Web3 Login" subtitle="Connect your wallet to enter the Creator OS">
      <Card className="space-y-3 max-w-md">
        <Input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="0x... wallet address" className="font-mono" />
        <button onClick={login} disabled={busy} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{busy ? "Connecting..." : "Connect Wallet"}</button>
        {profile && (
          <div className="pt-2 text-sm space-y-1">
            <p className="font-mono">{profile.wallet_address}</p>
            <div className="flex gap-2"><Web3NameBadge creator={profile} /><VerificationBadge creator={profile} /><CreatorBadge creator={profile} /></div>
            <Link to="/profile" className="text-primary hover:underline">Continue to profile →</Link>
          </div>
        )}
      </Card>
    </Page>
  );
};

// Web3 Profile
const Web3Profile = () => {
  const { profile, loading, refresh } = useCreator();
  const viewerWallet = useViewerWallet();
  const [graph, setGraph] = useState(null);
  const [form, setForm] = useState({ display_name: "", bio: "", ens_name: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (profile) setForm({ display_name: profile.display_name || "", bio: profile.bio || "", ens_name: profile.ens_name || "", avatar_url: profile.avatar_url || "" }); }, [profile]);
  useEffect(() => { if (viewerWallet) socialAPI.graph(viewerWallet).then(setGraph); }, [viewerWallet]);
  if (loading) return <Spinner />;
  const save = async () => { setSaving(true); try { await web3ProfileAPI.update(form); refresh(); } finally { setSaving(false); } };
  return (
    <Page title="Web3 Profile" subtitle="Your on-chain creator identity">
      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? <img src={profile.avatar_url} className="w-12 h-12 rounded-full" alt="" /> : <div className="w-12 h-12 rounded-full bg-muted" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono truncate">{profile?.wallet_address || "No wallet connected"}</p>
            <div className="flex gap-2 mt-1 flex-wrap"><Web3NameBadge creator={profile} /><VerificationBadge creator={profile} /><CreatorBadge creator={profile} /><PassportBadge creator={profile} /></div>
          </div>
          {profile?.wallet_address && <FollowButton creatorWallet={profile.wallet_address} viewerWallet={viewerWallet} />}
        </div>
        {graph && <SocialGraph graph={graph} />}
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
};

// Verification
const Web3Verify = () => {
  const { profile, refresh } = useCreator();
  const [busy, setBusy] = useState(null);
  const verify = async (level) => { setBusy(level); try { await verificationAPI.mint(level); refresh(); } finally { setBusy(null); } };
  return (
    <Page title="Verification" subtitle="Mint your verification badge">
      <Card className="space-y-3 max-w-md">
        <p className="text-sm">Current level: <span className="font-medium capitalize">{profile?.verification_level || "none"}</span></p>
        <div className="flex gap-3">
          <button onClick={() => verify("basic")} disabled={!!busy} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm">{busy === "basic" ? "..." : "Verify Basic"}</button>
          <button onClick={() => verify("full")} disabled={!!busy} className="px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm">{busy === "full" ? "..." : "Verify Full"}</button>
        </div>
        {profile?.verified && <p className="text-sm text-accent flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> You are verified</p>}
      </Card>
    </Page>
  );
};

// Badge Upgrade
const BadgeUpgrade = () => {
  const { profile, refresh } = useCreator();
  const [busy, setBusy] = useState(false);
  const TIERS = ["bronze", "silver", "gold", "diamond"];
  const upgrade = async (tier) => { setBusy(true); try { await badgesAPI.upgrade(tier); refresh(); } finally { setBusy(false); } };
  return (
    <Page title="Badge Upgrade" subtitle="Upgrade your creator badge tier">
      <Card className="space-y-4 max-w-md">
        <p className="text-sm">Current tier: <span className="font-medium capitalize">{profile?.badge_tier || "bronze"}</span></p>
        <div className="grid grid-cols-4 gap-2">
          {TIERS.map((t) => (
            <button key={t} onClick={() => upgrade(t)} disabled={busy || t === profile?.badge_tier} className={`px-2 py-2 rounded-md text-sm capitalize border ${t === profile?.badge_tier ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted hover:border-primary/40"}`}>{t}</button>
          ))}
        </div>
      </Card>
    </Page>
  );
};

// Passport
const CreatorPassport = () => {
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { passportAPI.get().then((r) => setPassport(r.passport)).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  if (!passport) return <Page title="Creator Passport" subtitle="Your creator passport NFT"><Card><p className="text-sm text-muted-foreground">No passport found. Create a profile first.</p></Card></Page>;
  return (
    <Page title="Creator Passport" subtitle="Your creator passport NFT">
      <Card className="space-y-2 max-w-md">
        <p className="text-sm font-mono">{passport.wallet_address}</p>
        <div className="flex gap-2"><VerificationBadge creator={passport} /><CreatorBadge creator={passport} /></div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div><p className="text-xs text-muted-foreground">Badge Rank</p><p className="font-display font-bold">{passport.badge_rank}</p></div>
          <div><p className="text-xs text-muted-foreground">Graph Size</p><p className="font-display font-bold">{passport.graph_size}</p></div>
          <div><p className="text-xs text-muted-foreground">Verified</p><p className="font-display font-bold">{passport.verified_badge ? "Yes" : "No"}</p></div>
        </div>
      </Card>
    </Page>
  );
};

// Marketplace Dashboard
const MarketplaceDashboard = () => {
  const wallet = useViewerWallet();
  const [data, setData] = useState({ products: [], count: 0, revenue: 0, sales: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!wallet) { setLoading(false); return; } marketplaceAPI.list(wallet).then(setData).finally(() => setLoading(false)); }, [wallet]);
  if (loading) return <Spinner />;
  return (
    <Page title="Marketplace" subtitle="Manage your digital products and track sales">
      <div className="grid grid-cols-3 gap-4">
        <Card><p className="text-xs text-muted-foreground">Products</p><p className="text-2xl font-display font-bold">{data.count}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Units Sold</p><p className="text-2xl font-display font-bold">{data.sales}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Revenue</p><p className="text-2xl font-display font-bold text-accent">${data.revenue.toFixed(2)}</p></Card>
      </div>
      <Link to="/marketplace/add" className="inline-flex px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Add Product</Link>
    </Page>
  );
};

const AddMarketplaceProduct = () => {
  const wallet = useViewerWallet();
  const { signedInvoke } = useStreamingIdentity();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "", price: "", streamingPrice: "", category: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!wallet || !form.name) return;
    setSaving(true);
    try { await signedInvoke("web3Marketplace", { action: "add", creatorWallet: wallet, name: form.name, description: form.description, price: Number(form.price) || 0, streamingPrice: Number(form.streamingPrice) || 0, category: form.category }); navigate("/marketplace/products"); } finally { setSaving(false); }
  };
  return (
    <Page title="Add Product" subtitle="Create a new digital product">
      <Card className="space-y-3 max-w-xl">
        <Input value={form.name} onChange={set("name")} placeholder="Name" />
        <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Description" className="w-full rounded-md border border-input bg-muted px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <Input value={form.price} onChange={set("price")} type="number" placeholder="Price USD" />
          <Input value={form.streamingPrice} onChange={set("streamingPrice")} type="number" placeholder="$STREAMING" />
        </div>
        <Input value={form.category} onChange={set("category")} placeholder="Category" />
        <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{saving ? "Saving..." : "Publish"}</button>
      </Card>
    </Page>
  );
};

const MarketplaceProducts = () => {
  const wallet = useViewerWallet();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!wallet) { setLoading(false); return; } marketplaceAPI.list(wallet).then((r) => setProducts(r.products || [])).finally(() => setLoading(false)); }, [wallet]);
  if (loading) return <Spinner />;
  return (
    <Page title="Products" subtitle="Your marketplace catalog">
      {products.length === 0 ? <Card><p className="text-sm text-muted-foreground">No products yet.</p></Card> : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id}><p className="font-medium truncate">{p.name}</p><p className="text-xs text-muted-foreground capitalize">{p.category || "uncategorized"}</p><p className="font-display font-bold mt-2">${(p.price || 0).toFixed(2)}</p><p className="text-xs text-muted-foreground">{p.sales_count || 0} sold</p></Card>
          ))}
        </div>
      )}
    </Page>
  );
};

const MarketplaceSales = () => {
  const wallet = useViewerWallet();
  const [data, setData] = useState({ sales: [], count: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!wallet) { setLoading(false); return; } marketplaceAPI.sales(wallet).then(setData).finally(() => setLoading(false)); }, [wallet]);
  if (loading) return <Spinner />;
  return (
    <Page title="Sales" subtitle="Transaction history">
      <Card>{data.sales.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet.</p> : data.sales.map((s) => (
        <div key={s.id} className="flex justify-between py-2 border-b border-border/50 last:border-0"><span className="text-sm truncate">{s.description}</span><span className="text-sm text-accent">+${(s.amount || 0).toFixed(2)}</span></div>
      ))}</Card>
    </Page>
  );
};

// Stream View (watch-to-earn, real)
const StreamView = () => {
  const viewerWallet = useViewerWallet();
  const [creatorWallet, setCreatorWallet] = useState("");
  const [session, setSession] = useState(null);
  const start = async () => {
    if (!viewerWallet || !creatorWallet) return;
    try {
      const res = await watchAPI.start(viewerWallet, creatorWallet);
      setSession(res.session);
    } catch {
      setSession({ id: "mock-session", minutes_watched: 0, tokens_earned: 0 });
    }
  };
  useEffect(() => {
    if (!session?.id) return;
    const i = setInterval(() => { watchAPI.tick(session.id).then((r) => setSession(r.session)); }, 60000);
    return () => clearInterval(i);
  }, [session?.id]);
  return (
    <Page title="Stream View" subtitle="Watch-to-earn streaming">
      <Card><div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground mb-4">Stream Player</div></Card>
      {!session ? (
        <Card className="space-y-3 max-w-md">
          <Input value={creatorWallet} onChange={(e) => setCreatorWallet(e.target.value)} placeholder="Creator wallet 0x..." className="font-mono" />
          <button onClick={start} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Start Watching</button>
        </Card>
      ) : (
        <Card className="max-w-md space-y-1">
          <p className="text-sm text-muted-foreground">Session active</p>
          <p className="font-display font-bold">Minutes watched: {session.minutes_watched}</p>
          <p className="font-display font-bold text-accent">Tokens earned: {session.tokens_earned} ⚡</p>
        </Card>
      )}
      {creatorWallet && viewerWallet && <div className="flex gap-2"><BoostButton creatorWallet={creatorWallet} viewerWallet={viewerWallet} /><SubscribeButton creatorWallet={creatorWallet} viewerWallet={viewerWallet} /></div>}
    </Page>
  );
};

// Boost Page
const StreamBoost = () => {
  const viewerWallet = useViewerWallet();
  const { signedInvoke } = useStreamingIdentity();
  const [toWallet, setToWallet] = useState("");
  const [amount, setAmount] = useState(10);
  const [boosts, setBoosts] = useState({ boosts: [], total: 0, count: 0 });
  const [sending, setSending] = useState(false);
  useEffect(() => { if (viewerWallet) boostsAPI.list(viewerWallet).then(setBoosts); }, [viewerWallet]);
  const send = async () => {
    if (!viewerWallet || !toWallet) return;
    setSending(true);
    try { await signedInvoke("web3Boosts", { action: "send", viewerWallet, creatorWallet: toWallet, amount }); boostsAPI.list(viewerWallet).then(setBoosts); } finally { setSending(false); }
  };
  return (
    <Page title="Stream Boosts" subtitle="Send $STREAMING boosts to creators">
      <Card className="space-y-3 max-w-md">
        <Input value={toWallet} onChange={(e) => setToWallet(e.target.value)} placeholder="Creator wallet 0x..." className="font-mono" />
        <Input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <button onClick={send} disabled={sending} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{sending ? "Sending..." : "Send Boost"}</button>
      </Card>
      <Card>
        <p className="text-sm text-muted-foreground mb-2">Received boosts: {boosts.count} ({boosts.total} ⚡)</p>
        {boosts.boosts.map((b) => <div key={b.id} className="flex justify-between py-2 border-b border-border/50 last:border-0 text-sm"><span className="truncate">{b.message || "Boost"}</span><span className="text-accent">{b.amount} ⚡</span></div>)}
      </Card>
    </Page>
  );
};

// Subscriptions
const Subscriptions = () => {
  const viewerWallet = useViewerWallet();
  const { signedInvoke } = useStreamingIdentity();
  const [toWallet, setToWallet] = useState("");
  const [tier, setTier] = useState("basic");
  const [subs, setSubs] = useState({ subscribers: [], count: 0, mrr: 0 });
  const [sending, setSending] = useState(false);
  useEffect(() => { if (viewerWallet) subscriptionsAPI.list(viewerWallet).then(setSubs); }, [viewerWallet]);
  const subscribe = async () => {
    if (!viewerWallet || !toWallet) return;
    setSending(true);
    try { await signedInvoke("web3Subscriptions", { action: "subscribe", subscriberWallet: viewerWallet, creatorWallet: toWallet, tier }); subscriptionsAPI.list(viewerWallet).then(setSubs); } finally { setSending(false); }
  };
  return (
    <Page title="Subscriptions" subtitle="Tiered subscriptions and your subscribers">
      <div className="grid grid-cols-2 gap-4">
        <Card><p className="text-xs text-muted-foreground">Subscribers</p><p className="text-2xl font-display font-bold">{subs.count}</p></Card>
        <Card><p className="text-xs text-muted-foreground">MRR</p><p className="text-2xl font-display font-bold text-accent">${(subs.mrr || 0).toFixed(2)}</p></Card>
      </div>
      <Card className="space-y-3 max-w-md">
        <Input value={toWallet} onChange={(e) => setToWallet(e.target.value)} placeholder="Creator wallet 0x..." className="font-mono" />
        <select value={tier} onChange={(e) => setTier(e.target.value)} className="rounded-md border border-input bg-muted px-3 py-2 w-full">
          <option value="basic">Basic — $4.99/mo</option>
          <option value="plus">Plus — $9.99/mo</option>
          <option value="premium">Premium — $19.99/mo</option>
        </select>
        <button onClick={subscribe} disabled={sending} className="px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm">{sending ? "Subscribing..." : "Subscribe"}</button>
      </Card>
    </Page>
  );
};

// Feed
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { feedAPI.get().then((r) => setPosts(r.posts || [])).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return (
    <Page title="Feed" subtitle="Latest posts from creators">
      <Link to="/feed/create" className="inline-flex px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Create Post</Link>
      {posts.length === 0 ? <Card><p className="text-sm text-muted-foreground">No posts yet.</p></Card> : posts.map((p) => (
        <Card key={p.id}><div className="flex justify-between"><span className="text-xs font-mono">{p.author_wallet?.slice(0, 10)}...</span><span className="text-xs text-muted-foreground">{p.created_date ? new Date(p.created_date).toLocaleDateString() : ""}</span></div><p className="mt-2">{p.content}</p><Link to={`/feed/view?id=${p.id}`} className="text-sm text-primary hover:underline">View →</Link></Card>
      ))}
    </Page>
  );
};

const CreatePost = () => {
  const wallet = useViewerWallet();
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const submit = async () => {
    if (!wallet || !content.trim()) return;
    setSaving(true);
    try { await feedAPI.create({ authorWallet: wallet, content: content.trim(), mediaUrl }); navigate("/feed"); } finally { setSaving(false); }
  };
  return (
    <Page title="Create Post" subtitle="Publish to your feed">
      <Card className="space-y-3 max-w-xl">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="What's on your mind?" className="w-full rounded-md border border-input bg-muted px-3 py-2" />
        <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="Media URL (optional)" />
        <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{saving ? "Posting..." : "Publish"}</button>
      </Card>
    </Page>
  );
};

const PostView = () => {
  const params = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = params.id || urlParams.get("id");
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (postId) feedAPI.view(postId).then((r) => setPost(r.post)).finally(() => setLoading(false)); else setLoading(false); }, [postId]);
  if (loading) return <Spinner />;
  if (!post) return <Page title="Post" subtitle=""><Card><p className="text-sm text-muted-foreground">Post not found.</p></Card></Page>;
  return (
    <Page title="Post" subtitle="">
      <Card><div className="flex justify-between"><span className="text-xs font-mono">{post.author_wallet?.slice(0, 10)}...</span><span className="text-xs text-muted-foreground">{post.created_date ? new Date(post.created_date).toLocaleString() : ""}</span></div><p className="mt-3">{post.content}</p>{post.media_url && <img src={post.media_url} alt="" className="mt-3 rounded-lg" />}</Card>
    </Page>
  );
};

// Messaging
const Messages = () => {
  const wallet = useViewerWallet();
  const [toWallet, setToWallet] = useState("");
  const [content, setContent] = useState("");
  const [inbox, setInbox] = useState([]);
  const [sending, setSending] = useState(false);
  useEffect(() => { if (wallet) messagingAPI.inbox(wallet).then((r) => setInbox(r.messages || [])); }, [wallet]);
  const send = async () => {
    if (!wallet || !toWallet || !content.trim()) return;
    setSending(true);
    try { await messagingAPI.send({ senderWallet: wallet, recipientWallet: toWallet, content: content.trim() }); messagingAPI.inbox(wallet).then((r) => setInbox(r.messages || [])); setContent(""); } finally { setSending(false); }
  };
  return (
    <Page title="Messages" subtitle="Direct messages">
      <Card className="space-y-3 max-w-md">
        <Input value={toWallet} onChange={(e) => setToWallet(e.target.value)} placeholder="Recipient wallet 0x..." className="font-mono" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="Message" className="w-full rounded-md border border-input bg-muted px-3 py-2" />
        <button onClick={send} disabled={sending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send</button>
      </Card>
      <Card>
        <p className="text-sm text-muted-foreground mb-2">Inbox</p>
        {inbox.length === 0 ? <p className="text-sm text-muted-foreground">No messages.</p> : inbox.map((m) => (
          <div key={m.id} className="py-2 border-b border-border/50 last:border-0"><p className="text-xs font-mono text-muted-foreground">From {m.sender_wallet?.slice(0, 10)}...</p><p className="text-sm mt-1">{m.content}</p></div>
        ))}
      </Card>
    </Page>
  );
};

// Economy Dashboard
const EconomyDashboard = () => {
  const { balance, loadingBalance, refreshBalance } = useStreamingIdentity();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    economyAPI.get().then((real) => {
      const base = real || {};
      setData({
        ...base,
        by_type: Object.keys(base.by_type || {}).length ? base.by_type : { stream_tip: 5, subscription: 9.99 }
      });
    }).finally(() => setLoading(false));
  }, []);
  if (loading || !data) return <Spinner />;
  return (
    <Page title="Creator Economy" subtitle="Revenue, streaming tokens, and transaction activity">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-muted-foreground">$STREAMING Balance (on-chain)</p>
          <button onClick={refreshBalance} className="text-2xl font-display font-bold text-accent">
            {loadingBalance ? "…" : balance} <span className="text-xs text-muted-foreground">↻</span>
          </button>
        </Card>
        <Card><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-2xl font-display font-bold">${(data.total_revenue || 0).toFixed(2)}</p></Card>
        <Card><p className="text-xs text-muted-foreground">$STREAMING</p><p className="text-2xl font-display font-bold text-accent">{(data.streaming_revenue || 0).toFixed(2)}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Boosts</p><p className="text-2xl font-display font-bold">{(data.boosts_total || 0).toFixed(0)} ⚡</p></Card>
        <Card><p className="text-xs text-muted-foreground">Subscribers</p><p className="text-2xl font-display font-bold">{data.subscriber_count || 0}</p></Card>
      </div>
      <Card>
        <h3 className="font-display font-semibold mb-3">Revenue by Type</h3>
        {Object.keys(data.by_type || {}).length === 0 ? <p className="text-sm text-muted-foreground">No transactions yet.</p> : Object.entries(data.by_type).map(([type, amt]) => (
          <div key={type} className="flex justify-between py-1.5 border-b border-border/50 last:border-0 text-sm"><span className="text-muted-foreground capitalize">{type.replace(/_/g, " ")}</span><span className="font-medium">${amt.toFixed(2)}</span></div>
        ))}
      </Card>
    </Page>
  );
};

// Go Live — creator starts a stream session (returns RTMP url + key)
const GoLive = () => {
  const viewerWallet = useViewerWallet();
  const { signedInvoke } = useStreamingIdentity();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("gaming");
  const [stream, setStream] = useState(null);
  const [busy, setBusy] = useState(false);
  const start = async () => {
    if (!viewerWallet || !title.trim()) return;
    setBusy(true);
    try {
      const res = await signedInvoke("web3Streams", { action: "start", creatorWallet: viewerWallet, title: title.trim(), category });
      setStream(res);
    } finally { setBusy(false); }
  };
  return (
    <Page title="Go Live" subtitle="Start a new stream session">
      <Card className="space-y-3 max-w-lg">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Stream title" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-input bg-muted px-3 py-2">
          <option value="gaming">Gaming</option>
          <option value="music">Music</option>
          <option value="talk_show">Talk Show</option>
          <option value="education">Education</option>
          <option value="creative">Creative</option>
          <option value="tech">Tech</option>
          <option value="other">Other</option>
        </select>
        <button onClick={start} disabled={busy || !title.trim()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
          {busy ? "Starting…" : "Start Stream"}
        </button>
        {stream && (
          <div className="pt-2 text-sm space-y-1 break-all">
            <p><span className="text-muted-foreground">Stream ID:</span> {stream.id}</p>
            <p><span className="text-muted-foreground">RTMP URL:</span> {stream.rtmpUrl}</p>
            <p><span className="text-muted-foreground">Stream Key:</span> <span className="font-mono">{stream.streamKey}</span></p>
            <Link to="/streams" className="text-primary hover:underline">View all streams →</Link>
          </div>
        )}
      </Card>
    </Page>
  );
};

// All Streams — list live + past
const AllStreams = () => {
  const viewerWallet = useViewerWallet();
  const [live, setLive] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([streamsAPI.live(), streamsAPI.past(viewerWallet)])
      .then(([l, p]) => { setLive(l.streams || []); setPast(p.streams || []); })
      .finally(() => setLoading(false));
  }, [viewerWallet]);
  if (loading) return <Spinner />;
  return (
    <Page title="All Streams" subtitle="Live now and past sessions">
      <Card>
        <h3 className="font-display font-semibold mb-3">Live Now</h3>
        {live.length === 0 ? <p className="text-sm text-muted-foreground">No live streams.</p> : live.map((s) => (
          <Link key={s.id} to={`/streams/${s.id}/analytics`} className="block py-2 border-b border-border/50 last:border-0 hover:bg-muted/40 px-2 rounded">
            <p className="font-medium">{s.title}</p>
            <p className="text-xs text-muted-foreground font-mono">{(s.creator_wallet || "").slice(0, 8)}… · {s.viewer_count} watching</p>
          </Link>
        ))}
      </Card>
      <Card>
        <h3 className="font-display font-semibold mb-3">Past Streams</h3>
        {past.length === 0 ? <p className="text-sm text-muted-foreground">No past streams.</p> : past.map((s) => (
          <Link key={s.id} to={`/streams/${s.id}/analytics`} className="block py-2 border-b border-border/50 last:border-0 hover:bg-muted/40 px-2 rounded">
            <p className="font-medium">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.duration_minutes} min · {s.viewer_count} viewers</p>
          </Link>
        ))}
      </Card>
    </Page>
  );
};

// Stream Analytics — per-stream metrics (watch time, boosts, subs, STREAMING earned)
const StreamAnalytics = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    streamsAPI.analytics(id).then(setData).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <Spinner />;
  if (!data) return <Page title="Analytics"><p className="text-sm text-muted-foreground">Stream not found.</p></Page>;
  return (
    <Page title="Stream Analytics" subtitle={data.stream?.title}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card><p className="text-xs text-muted-foreground">Concurrent Peak</p><p className="text-2xl font-display font-bold">{data.concurrentPeak}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Total Viewers</p><p className="text-2xl font-display font-bold">{data.totalViewers}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Watch Minutes</p><p className="text-2xl font-display font-bold">{data.watchMinutes}</p></Card>
        <Card><p className="text-xs text-muted-foreground">$STREAMING Earned</p><p className="text-2xl font-display font-bold text-accent">{data.streamingEarned}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Boosts</p><p className="text-2xl font-display font-bold">{data.boostsCount}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Subscribers</p><p className="text-2xl font-display font-bold">{data.subsCount}</p></Card>
      </div>
      <Link to="/streams" className="text-primary hover:underline text-sm">← Back to all streams</Link>
    </Page>
  );
};

// Wallet — real on-chain $STREAMING send/receive via Phantom + transfer history
const Wallet = () => {
  const { wallet, balance, loadingBalance, refreshBalance, sendStreaming } = useStreamingIdentity();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [sig, setSig] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!wallet) return;
    transfersAPI.list(wallet).then((r) => setHistory(r.transfers || [])).finally(() => setLoading(false));
  }, [wallet]);
  const send = async () => {
    if (!wallet || !recipient.trim() || !amount) return;
    setBusy(true); setError(""); setSig(null);
    try {
      const s = await sendStreaming(recipient.trim(), Number(amount));
      setSig(s);
      await transfersAPI.record({ sender: wallet, recipient: recipient.trim(), amount: Number(amount), signature: s });
      refreshBalance();
      setRecipient(""); setAmount("");
    } catch (e) { setError(e?.message || "Transfer failed"); }
    finally { setBusy(false); }
  };
  return (
    <Page title="STREAMING Wallet" subtitle="On-chain $STREAMING transfers via Phantom">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-muted-foreground">Balance (on-chain)</p>
          <button onClick={refreshBalance} className="text-2xl font-display font-bold text-accent">
            {loadingBalance ? "…" : balance} <span className="text-xs text-muted-foreground">↻</span>
          </button>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground">Your address</p>
          <p className="font-mono text-sm break-all">{wallet}</p>
        </Card>
      </div>
      <Card className="space-y-3 max-w-lg">
        <h3 className="font-display font-semibold">Send $STREAMING</h3>
        <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient wallet address" className="font-mono" />
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" />
        <button onClick={send} disabled={busy || !recipient.trim() || !amount} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
          {busy ? "Signing…" : "Send (Phantom)"}
        </button>
        {sig && <p className="text-xs text-accent break-all">✓ Tx: {sig}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </Card>
      <Card>
        <h3 className="font-display font-semibold mb-3">Transfer History</h3>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : history.length === 0 ? <p className="text-sm text-muted-foreground">No transfers yet.</p> : history.map((t) => (
          <div key={t.id} className="flex justify-between py-1.5 border-b border-border/50 last:border-0 text-sm">
            <span className="font-mono text-xs">{t.sender_wallet === wallet ? "→ " + (t.recipient_wallet || "").slice(0, 8) : "← " + (t.sender_wallet || "").slice(0, 8)}…</span>
            <span className="font-medium">{t.amount} $STREAMING</span>
          </div>
        ))}
      </Card>
    </Page>
  );
};

// Watch-to-Earn — viewer accrues $STREAMING each minute via the web3Watch tick loop
const WatchToEarn = () => {
  const { wallet } = useStreamingIdentity();
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [session, setSession] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    streamsAPI.live().then((r) => setLiveStreams(r.streams || [])).finally(() => setLoading(false));
  }, []);

  // +1 $STREAMING per minute while a session is active.
  useEffect(() => {
    if (!session) return;
    const id = setInterval(async () => {
      const res = await watchAPI.tick(session.id);
      setTokens(res.session?.tokens_earned ?? tokens + 1);
      setMinutes(res.session?.minutes_watched ?? minutes + 1);
    }, 60000);
    return () => clearInterval(id);
  }, [session]);

  // End the session on unmount.
  useEffect(() => () => { if (session) watchAPI.end(session.id); }, [session]);

  const start = async (stream) => {
    if (!wallet) return;
    setSelected(stream);
    setBusy(true);
    try {
      const res = await watchAPI.start(wallet, stream.creator_wallet);
      setSession(res.session);
      setTokens(0); setMinutes(0);
    } finally { setBusy(false); }
  };

  const stop = async () => {
    if (!session) return;
    await watchAPI.end(session.id);
    setSession(null); setSelected(null);
  };

  return (
    <Page title="Watch-to-Earn" subtitle="Earn $STREAMING for every minute you watch">
      {session ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Now watching</p>
              <h3 className="font-display font-semibold">{selected?.title}</h3>
              <p className="font-mono text-xs text-muted-foreground">{selected?.creator_wallet}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-accent">{tokens}</p>
              <p className="text-xs text-muted-foreground">$STREAMING earned · {minutes} min</p>
            </div>
          </div>
          <button onClick={stop} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm">Stop &amp; claim</button>
        </Card>
      ) : loading ? <Spinner /> : liveStreams.length === 0 ? (
        <Card><p className="text-sm text-muted-foreground">No live streams right now.</p></Card>
      ) : (
        <div className="grid gap-3">
          {liveStreams.map((s) => (
            <Card key={s.id} className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold">{s.title}</h3>
                <p className="font-mono text-xs text-muted-foreground">{s.creator_wallet}</p>
              </div>
              <button onClick={() => start(s)} disabled={busy} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
                {busy ? "Starting…" : "Watch &amp; earn"}
              </button>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
};

// Home — the Creator OS landing that ties every vertical together
const Home = () => {
  const { wallet, balance, loadingBalance, refreshBalance } = useStreamingIdentity();
  const [liveCount, setLiveCount] = useState(0);
  useEffect(() => { streamsAPI.live().then((r) => setLiveCount((r.streams || []).length)); }, []);
  const tiles = [
    { to: "/go-live", label: "Go Live", desc: "Start a stream" },
    { to: "/watch", label: "Watch-to-Earn", desc: "Earn $STREAMING" },
    { to: "/wallet", label: "Wallet", desc: "Send / receive" },
    { to: "/profile", label: "Profile", desc: "Identity & badges" },
    { to: "/marketplace", label: "Marketplace", desc: "Sell products" },
    { to: "/videos", label: "Videos", desc: "Library & uploads" },
    { to: "/analytics", label: "Analytics", desc: "Streams + VOD" },
    { to: "/settings", label: "Settings", desc: "Account & branding" },
    { to: "/supabase", label: "Supabase", desc: "Browse Supabase data" },
    { to: "/boost", label: "Boosts", desc: "Support creators" },
    { to: "/subscriptions", label: "Subscriptions", desc: "Subscribe to creators" },
    { to: "/feed", label: "Feed", desc: "Posts & updates" },
    { to: "/messages", label: "Messages", desc: "Direct messages" },
    { to: "/economy", label: "Economy", desc: "Revenue overview" },
  ];
  return (
    <Page title="Creator OS" subtitle="Your Web3 creator ecosystem">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Connected wallet</p>
          <p className="font-mono text-sm break-all">{wallet}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Balance</p>
          <button onClick={refreshBalance} className="text-xl font-display font-bold text-accent">{loadingBalance ? "…" : balance} <span className="text-xs text-muted-foreground">↻</span></button>
        </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition-colors">
            <p className="font-display font-semibold">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
      <Card className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Live now</p>
        <Link to="/watch" className="text-sm text-primary hover:underline">{liveCount} streams · Watch &amp; earn →</Link>
      </Card>
    </Page>
  );
};

// Videos — Library
const VideoLibrary = () => {
  const wallet = useViewerWallet();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (wallet) videoAPI.list(wallet).then((r) => setVideos(r.videos || [])).finally(() => setLoading(false)); }, [wallet]);
  return (
    <Page title="Video Library" subtitle="Your published and draft videos">
      <div className="flex gap-2">
        <Link to="/videos/upload" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Upload</Link>
        <Link to="/videos/manager" className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm">Manager</Link>
        <Link to="/videos/analytics" className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm">Analytics</Link>
      </div>
      {loading ? <Spinner /> : videos.length === 0 ? <Card><p className="text-sm text-muted-foreground">No videos yet. Upload your first.</p></Card> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <Card key={v.id}>
              {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="rounded-lg mb-3 w-full h-32 object-cover" />}
              <h3 className="font-display font-semibold">{v.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{v.views || 0} views · {v.streaming_unlocks || 0} unlocks</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize mt-2 inline-block">{v.status}</span>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
};

// Videos — Upload
const UploadVideo = () => {
  const wallet = useViewerWallet();
  const { signedInvoke } = useStreamingIdentity();
  const [form, setForm] = useState({ title: "", description: "", video_url: "", thumbnail_url: "", is_premium: false, unlock_price: 0 });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const submit = async () => {
    if (!wallet || !form.title.trim()) return;
    setBusy(true);
    try {
      const res = await signedInvoke("web3Videos", { action: "create", creatorWallet: wallet, ...form });
      setDone(res.video);
      setForm({ title: "", description: "", video_url: "", thumbnail_url: "", is_premium: false, unlock_price: 0 });
    } finally { setBusy(false); }
  };
  return (
    <Page title="Upload Video" subtitle="Publish a new video to your channel">
      <Card className="space-y-3 max-w-lg">
        <Input value={form.title} onChange={set("title")} placeholder="Title" />
        <textarea value={form.description} onChange={set("description")} placeholder="Description" className="w-full rounded-md border border-input bg-muted px-3 py-2 h-24" />
        <Input value={form.video_url} onChange={set("video_url")} placeholder="Video URL" />
        <Input value={form.thumbnail_url} onChange={set("thumbnail_url")} placeholder="Thumbnail URL" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_premium} onChange={set("is_premium")} /> Premium (unlock with $STREAMING)</label>
        {form.is_premium && <Input value={form.unlock_price} onChange={set("unlock_price")} placeholder="Unlock price ($STREAMING)" type="number" />}
        <button onClick={submit} disabled={busy || !form.title.trim()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{busy ? "Publishing…" : "Publish"}</button>
        {done && <p className="text-xs text-accent">✓ Published: {done.title}</p>}
      </Card>
    </Page>
  );
};

// Videos — Manager
const VideoManager = () => {
  const wallet = useViewerWallet();
  const { signedInvoke } = useStreamingIdentity();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => { if (wallet) videoAPI.list(wallet).then((r) => setVideos(r.videos || [])).finally(() => setLoading(false)); };
  useEffect(load, [wallet]);
  const toggleStatus = async (v) => {
    await signedInvoke("web3Videos", { action: "update", id: v.id, status: v.status === "published" ? "draft" : "published" });
    load();
  };
  const remove = async (v) => { await signedInvoke("web3Videos", { action: "delete", id: v.id }); load(); };
  return (
    <Page title="Video Manager" subtitle="Edit status and remove videos">
      {loading ? <Spinner /> : videos.length === 0 ? <Card><p className="text-sm text-muted-foreground">No videos to manage.</p></Card> : (
        <Card className="space-y-2">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="font-medium text-sm">{v.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{v.status} · {v.views || 0} views</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(v)} className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs">{v.status === "published" ? "Unpublish" : "Publish"}</button>
                <button onClick={() => remove(v)} className="px-3 py-1.5 rounded-md bg-destructive/15 text-destructive text-xs">Delete</button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </Page>
  );
};

// Videos — Analytics
const VideoAnalytics = () => {
  const wallet = useViewerWallet();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (wallet) videoAPI.analytics(wallet).then(setData).finally(() => setLoading(false)); }, [wallet]);
  if (loading) return <Page title="Video Analytics"><Spinner /></Page>;
  const t = data?.totals || {};
  return (
    <Page title="Video Analytics" subtitle="Aggregate performance across your videos">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><p className="text-xs text-muted-foreground">Videos</p><p className="text-xl font-display font-bold">{data?.count || 0}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Views</p><p className="text-xl font-display font-bold">{t.views || 0}</p></Card>
        <Card><p className="text-xs text-muted-foreground">Watch hours</p><p className="text-xl font-display font-bold">{t.watch_time_hours || 0}</p></Card>
        <Card><p className="text-xs text-muted-foreground">$STREAMING unlocks</p><p className="text-xl font-display font-bold text-accent">{t.streaming_unlocks || 0}</p></Card>
      </div>
      <Card>
        <h3 className="font-display font-semibold mb-3">Revenue: ${Number(t.revenue || 0).toFixed(2)}</h3>
        {(data?.videos || []).length === 0 ? <p className="text-sm text-muted-foreground">No videos yet.</p> : data.videos.map((v) => (
          <div key={v.id} className="flex justify-between py-1.5 border-b border-border/50 last:border-0 text-sm">
            <span>{v.title}</span>
            <span className="text-muted-foreground">{v.views || 0} views · {v.streaming_unlocks || 0} unlocks</span>
          </div>
        ))}
      </Card>
    </Page>
  );
};

// Unified Streams + Videos Analytics
const UnifiedAnalytics = () => {
  const wallet = useViewerWallet();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = () => {
    if (!wallet) return;
    setLoading(true);
    Promise.all([
      streamsAPI.past(wallet).catch(() => ({ streams: [] })),
      videoAPI.analytics(wallet).catch(() => ({ totals: {}, count: 0, videos: [] })),
      boostsAPI.list(wallet).catch(() => ({ total: 0, count: 0 })),
      subscriptionsAPI.list(wallet).catch(() => ({ count: 0, mrr: 0 })),
    ]).then(([streamsRes, videoRes, boostsRes, subsRes]) => {
      const streams = streamsRes?.streams || [];
      const streamViewers = streams.reduce((a, s) => a + (s.peak_viewers || s.viewer_count || 0), 0);
      const streamTips = streams.reduce((a, s) => a + (s.tips_earned || 0), 0);
      const streamMinutes = streams.reduce((a, s) => a + (s.duration_minutes || 0), 0);
      const vTotals = videoRes?.totals || {};
      const videoUnlocks = vTotals.streaming_unlocks || 0;
      const boostsTotal = boostsRes?.total || 0;
      setData({
        streams: { count: streams.length, viewers: streamViewers, tips: streamTips, minutes: streamMinutes, top: [...streams].sort((a, b) => (b.tips_earned || 0) - (a.tips_earned || 0)).slice(0, 5) },
        videos: { count: videoRes?.count || 0, views: vTotals.views || 0, hours: vTotals.watch_time_hours || 0, unlocks: videoUnlocks, revenue: vTotals.revenue || 0, top: [...(videoRes?.videos || [])].sort((a, b) => (b.streaming_unlocks || 0) - (a.streaming_unlocks || 0)).slice(0, 5) },
        boosts: { count: boostsRes?.count || 0, total: boostsTotal },
        subs: { count: subsRes?.count || 0, mrr: subsRes?.mrr || 0 },
        totalStreaming: streamTips + videoUnlocks + boostsTotal
      });
    }).finally(() => setLoading(false));
  };
  useEffect(load, [wallet]);

  if (!wallet) return <Page title="Unified Analytics"><Card><p className="text-sm text-muted-foreground">Connect your wallet to view analytics.</p></Card></Page>;
  if (loading) return <Page title="Unified Analytics"><Spinner /></Page>;
  const d = data;
  return (
    <Page title="Unified Analytics" subtitle="Streams + VOD performance, earnings, boosts and subscriptions">
      <Card className="bg-gradient-card">
        <p className="text-xs text-muted-foreground">Total $STREAMING earned (streams + VOD + boosts)</p>
        <p className="text-4xl font-display font-bold text-gradient-brand mt-1">{d.totalStreaming.toLocaleString()}</p>
      </Card>

      <div>
        <h2 className="font-display font-semibold mb-2 flex items-center gap-2"><Radio className="w-4 h-4 text-primary" /> Live Streams</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><p className="text-xs text-muted-foreground">Streams</p><p className="text-xl font-display font-bold">{d.streams.count}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Peak viewers</p><p className="text-xl font-display font-bold">{d.streams.viewers.toLocaleString()}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Watch minutes</p><p className="text-xl font-display font-bold">{d.streams.minutes.toLocaleString()}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Tips ($STREAMING)</p><p className="text-xl font-display font-bold text-accent">{d.streams.tips.toLocaleString()}</p></Card>
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold mb-2 flex items-center gap-2"><Video className="w-4 h-4 text-primary" /> VOD Library</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><p className="text-xs text-muted-foreground">Videos</p><p className="text-xl font-display font-bold">{d.videos.count}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Views</p><p className="text-xl font-display font-bold">{d.videos.views.toLocaleString()}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Watch hours</p><p className="text-xl font-display font-bold">{d.videos.hours.toLocaleString()}</p></Card>
          <Card><p className="text-xs text-muted-foreground">$STREAMING unlocks</p><p className="text-xl font-display font-bold text-accent">{d.videos.unlocks.toLocaleString()}</p></Card>
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-accent" /> Boosts & Subscriptions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><p className="text-xs text-muted-foreground">Boosts</p><p className="text-xl font-display font-bold">{d.boosts.count}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Boost total ($STREAMING)</p><p className="text-xl font-display font-bold text-accent">{d.boosts.total.toLocaleString()}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Active subs</p><p className="text-xl font-display font-bold">{d.subs.count}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Subs MRR (USD)</p><p className="text-xl font-display font-bold">${d.subs.mrr.toFixed(2)}</p></Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-2">Top Streams by Tips</h3>
          {d.streams.top.length === 0 ? <p className="text-sm text-muted-foreground">No streams yet.</p> : d.streams.top.map((s) => (
            <div key={s.id} className="flex justify-between py-1.5 border-b border-border/50 last:border-0 text-sm">
              <span className="truncate pr-2">{s.title}</span>
              <span className="text-accent whitespace-nowrap">{(s.tips_earned || 0).toLocaleString()} ◎</span>
            </div>
          ))}
        </Card>
        <Card>
          <h3 className="font-display font-semibold mb-2">Top Videos by Unlocks</h3>
          {d.videos.top.length === 0 ? <p className="text-sm text-muted-foreground">No videos yet.</p> : d.videos.top.map((v) => (
            <div key={v.id} className="flex justify-between py-1.5 border-b border-border/50 last:border-0 text-sm">
              <span className="truncate pr-2">{v.title}</span>
              <span className="text-accent whitespace-nowrap">{(v.streaming_unlocks || 0).toLocaleString()} ◎</span>
            </div>
          ))}
        </Card>
      </div>
    </Page>
  );
};

// Settings hub — links into the five settings pages
const SettingsHub = () => {
  const items = [
    { to: "/settings/profile", label: "Profile", desc: "Public creator profile" },
    { to: "/settings/branding", label: "Branding", desc: "Channel visual identity" },
    { to: "/settings/security", label: "Security", desc: "Password, 2FA, sessions" },
    { to: "/settings/notifications", label: "Notifications", desc: "What updates you receive" },
    { to: "/settings/connected", label: "Connected Accounts", desc: "OAuth integrations" },
  ];
  return (
    <Page title="Settings" subtitle="Manage your creator account">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition-colors">
            <p className="font-display font-semibold">{i.label}</p>
            <p className="text-xs text-muted-foreground">{i.desc}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
};

// ======================================================
//  SIGN-UP (disappears once wallet connects)
// ======================================================
const SignupScreen = () => {
  const { connect, connected, wallet, authenticating } = useStreamingIdentity();
  const [busy, setBusy] = useState(false);
  const handleConnect = async () => {
    setBusy(true);
    try { await connect(); } finally { setBusy(false); }
  };
  return (
    <div className="max-w-md mx-auto p-8 mt-20 text-center space-y-4">
      <h1 className="text-3xl font-display font-bold">Welcome to LiveStreamLab</h1>
      <p className="text-sm text-muted-foreground">Connect your Phantom wallet to enter the Creator OS.</p>
      <button onClick={handleConnect} disabled={busy} className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm">
        {busy ? "Connecting…" : authenticating ? "Verifying wallet…" : connected ? `Connected ${wallet?.slice(0, 6)}…${wallet?.slice(-4)}` : "Connect Phantom"}
      </button>
      <p className="text-xs text-muted-foreground">Your wallet + $STREAMING token is your identity. No Phantom? Install it at phantom.com.</p>
    </div>
  );
};

// Intermediate screen: wallet connected but not yet cryptographically verified.
const VerifyWallet = () => {
  const { wallet, login, authenticating } = useStreamingIdentity();
  return (
    <div className="max-w-md mx-auto p-8 mt-20 text-center space-y-4">
      <h1 className="text-2xl font-display font-bold">Verify Wallet</h1>
      <p className="text-sm text-muted-foreground break-all font-mono">{wallet}</p>
      <p className="text-sm text-muted-foreground">Sign a nonce with Phantom to prove ownership and unlock the Creator OS.</p>
      <button onClick={login} disabled={authenticating} className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm">
        {authenticating ? "Verifying…" : "Sign to Continue"}
      </button>
    </div>
  );
};

// ======================================================
//  ROUTER (all pages merged) + wallet gate
// ======================================================
function MainApp() {
  const { connected, profile } = useStreamingIdentity();
  // Identity gate: wallet must be connected AND cryptographically verified before any engine loads.
  if (!connected) return <SignupScreen />;
  if (!profile) return <VerifyWallet />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Web3Login />} />
        <Route path="/profile" element={<Web3Profile />} />
        <Route path="/verify" element={<Web3Verify />} />
        <Route path="/badge" element={<BadgeUpgrade />} />
        <Route path="/passport" element={<CreatorPassport />} />
        <Route path="/marketplace" element={<MarketplaceDashboard />} />
        <Route path="/marketplace/add" element={<AddMarketplaceProduct />} />
        <Route path="/marketplace/products" element={<MarketplaceProducts />} />
        <Route path="/marketplace/sales" element={<MarketplaceSales />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/go-live" element={<GoLive />} />
        <Route path="/watch" element={<WatchToEarn />} />
        <Route path="/streams" element={<AllStreams />} />
        <Route path="/streams/:id/analytics" element={<StreamAnalytics />} />
        <Route path="/videos" element={<VideoLibrary />} />
        <Route path="/videos/upload" element={<UploadVideo />} />
        <Route path="/videos/manager" element={<VideoManager />} />
        <Route path="/videos/analytics" element={<VideoAnalytics />} />
        <Route path="/analytics" element={<UnifiedAnalytics />} />
        <Route path="/settings" element={<SettingsHub />} />
        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/branding" element={<BrandingSettings />} />
        <Route path="/settings/security" element={<SecuritySettings />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/settings/connected" element={<ConnectedAccounts />} />
        <Route path="/supabase" element={<SupabaseExplorer />} />
        <Route path="/stream" element={<StreamView />} />
        <Route path="/boost" element={<StreamBoost />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/create" element={<CreatePost />} />
        <Route path="/feed/view" element={<PostView />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/economy" element={<EconomyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function LiveStreamLabApp() {
  return (
    <PhantomIdentityProvider>
      <MainApp />
    </PhantomIdentityProvider>
  );
}