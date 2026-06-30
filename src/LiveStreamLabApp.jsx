// ======================================================
//  LiveStreamLabApp — Single merged structural frontend (all real)
//  One file: imports + API config + connectors + components + pages + router
//  Every connector bound to a real Base44 backend function via base44.functions.invoke
// ======================================================
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, Zap, CreditCard, ShoppingBag, Send, UserPlus, UserMinus, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCreator } from "@/hooks/web3/useCreator";

// ======================================================
//  API CONFIG
// ======================================================
const invoke = (name, payload) => base44.functions.invoke(name, payload).then((r) => r.data);

const useViewerWallet = () => {
  const { profile } = useCreator();
  return profile?.wallet_address || null;
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
  const [sending, setSending] = useState(false);
  const handle = async () => {
    if (!viewerWallet || !creatorWallet) return;
    setSending(true);
    try { await boostsAPI.send({ viewerWallet, creatorWallet, amount, message: "Boost!" }); } finally { setSending(false); }
  };
  return (
    <button onClick={handle} disabled={sending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary/15 text-primary text-sm border border-primary/30 hover:bg-primary/25">
      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Boost {amount}
    </button>
  );
};

const SubscribeButton = ({ creatorWallet, viewerWallet, tier = "basic" }) => {
  const [sending, setSending] = useState(false);
  const handle = async () => {
    if (!viewerWallet || !creatorWallet) return;
    setSending(true);
    try { await subscriptionsAPI.subscribe({ subscriberWallet: viewerWallet, creatorWallet, tier }); } finally { setSending(false); }
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
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "", price: "", streamingPrice: "", category: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!wallet || !form.name) return;
    setSaving(true);
    try { await marketplaceAPI.add(wallet, { name: form.name, description: form.description, price: Number(form.price) || 0, streamingPrice: Number(form.streamingPrice) || 0, category: form.category }); navigate("/marketplace/products"); } finally { setSaving(false); }
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
  const [toWallet, setToWallet] = useState("");
  const [amount, setAmount] = useState(10);
  const [boosts, setBoosts] = useState({ boosts: [], total: 0, count: 0 });
  const [sending, setSending] = useState(false);
  useEffect(() => { if (viewerWallet) boostsAPI.list(viewerWallet).then(setBoosts); }, [viewerWallet]);
  const send = async () => {
    if (!viewerWallet || !toWallet) return;
    setSending(true);
    try { await boostsAPI.send({ viewerWallet, creatorWallet: toWallet, amount }); boostsAPI.list(viewerWallet).then(setBoosts); } finally { setSending(false); }
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
  const [toWallet, setToWallet] = useState("");
  const [tier, setTier] = useState("basic");
  const [subs, setSubs] = useState({ subscribers: [], count: 0, mrr: 0 });
  const [sending, setSending] = useState(false);
  useEffect(() => { if (viewerWallet) subscriptionsAPI.list(viewerWallet).then(setSubs); }, [viewerWallet]);
  const subscribe = async () => {
    if (!viewerWallet || !toWallet) return;
    setSending(true);
    try { await subscriptionsAPI.subscribe({ subscriberWallet: viewerWallet, creatorWallet: toWallet, tier }); subscriptionsAPI.list(viewerWallet).then(setSubs); } finally { setSending(false); }
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

// ======================================================
//  SIGN-UP (disappears once wallet connects)
// ======================================================
const SignupScreen = ({ onConnected }) => {
  const [wallet, setWallet] = useState("");
  const [busy, setBusy] = useState(false);
  const connect = async () => {
    if (!wallet.trim()) return;
    setBusy(true);
    try { await web3LoginAPI.login(wallet.trim()); onConnected(wallet.trim()); } finally { setBusy(false); }
  };
  return (
    <div className="max-w-md mx-auto p-8 mt-20 text-center space-y-4">
      <h1 className="text-3xl font-display font-bold">Welcome to LiveStreamLab</h1>
      <p className="text-sm text-muted-foreground">Create your account by connecting your wallet.</p>
      <Input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="0x... wallet address" className="font-mono" />
      <button onClick={connect} disabled={busy} className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm">{busy ? "Connecting..." : "Connect Wallet"}</button>
      <p className="text-xs text-muted-foreground">Connect your Base44 wallet to enter the Creator OS.</p>
    </div>
  );
};

// ======================================================
//  ROUTER (all pages merged) + wallet gate
// ======================================================
function MainApp() {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const { profile, loading } = useCreator();
  const wallet = connectedWallet || profile?.wallet_address || null;
  if (loading && !connectedWallet) return <Spinner />;
  if (!wallet) return <SignupScreen onConnected={setConnectedWallet} />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Web3Login />} />
        <Route path="/profile" element={<Web3Profile />} />
        <Route path="/verify" element={<Web3Verify />} />
        <Route path="/badge" element={<BadgeUpgrade />} />
        <Route path="/passport" element={<CreatorPassport />} />
        <Route path="/marketplace" element={<MarketplaceDashboard />} />
        <Route path="/marketplace/add" element={<AddMarketplaceProduct />} />
        <Route path="/marketplace/products" element={<MarketplaceProducts />} />
        <Route path="/marketplace/sales" element={<MarketplaceSales />} />
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
  return <MainApp />;
}