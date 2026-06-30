// ======================================================
//  LiveStreamLabApp — Single merged structural frontend
//  One file: imports + API config + connectors + components + pages + router
//  Base44-native: connectors call real backend functions via base44.functions.invoke
// ======================================================
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Loader2, Zap, CreditCard, ShoppingBag, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCreator } from "@/hooks/web3/useCreator";

// ======================================================
//  API CONFIG
// ======================================================
const invoke = (name, payload) => base44.functions.invoke(name, payload).then((r) => r.data);

// Viewer wallet (Base44-native — no external wallet adapter)
const useViewerWallet = () => {
  const { profile } = useCreator();
  return profile?.wallet_address || null;
};

// ======================================================
//  API CONNECTORS (ALL MERGED — bound to real Base44 functions)
// ======================================================

// Web3 Login
const web3LoginAPI = {
  login: (payload) => invoke("web3Login", { action: "login", ...payload }),
  nonce: () => invoke("web3Login", { action: "nonce" }),
  verify: (payload) => invoke("web3Verify", { action: "verify", ...payload }),
};

// Web3 Profile
const web3ProfileAPI = {
  get: (wallet) => invoke("web3Profile", { action: "get", wallet }),
  update: (payload) => invoke("web3Profile", { action: "update", ...payload }),
};

// Verification
const verificationAPI = {
  mint: (payload) => invoke("web3Verify", { action: "mint", ...payload }),
};

// Badges
const badgesAPI = {
  upgrade: (payload) => invoke("web3Badges", { action: "upgrade", ...payload }),
};

// Passport
const passportAPI = {
  issue: (payload) => invoke("web3Passport", { action: "issue", ...payload }),
  update: (payload) => invoke("web3Passport", { action: "update", ...payload }),
};

// Marketplace
const marketplaceAPI = {
  add: (creatorWallet, data) => invoke("web3Marketplace", { action: "add", creatorWallet, ...data }),
  list: (creatorWallet) => invoke("web3Marketplace", { action: "list", creatorWallet }),
  sales: (creatorWallet) => invoke("web3Marketplace", { action: "sales", creatorWallet }),
  purchase: (payload) => invoke("web3Marketplace", { action: "buy", ...payload }),
};

// Watch-to-earn (structural — backend not yet implemented)
const watchAPI = {
  start: async (viewerWallet, creatorWallet) => ({ id: null }),
  tick: async (sessionId) => ({}),
};

// Boosts
const boostsAPI = {
  send: (payload) => invoke("web3Boosts", { action: "send", ...payload }),
  list: (wallet) => invoke("web3Boosts", { action: "list", wallet }),
};

// Subscriptions
const subscriptionsAPI = {
  subscribe: (payload) => invoke("web3Subscriptions", { action: "subscribe", ...payload }),
  list: (wallet) => invoke("web3Subscriptions", { action: "list", wallet }),
};

// Social Graph (structural — backend not yet implemented)
const socialAPI = {
  follow: async (payload) => ({}),
  unfollow: async (payload) => ({}),
  graph: async (wallet) => ({ followers: [], following: [], connections: [] }),
};

// Feed (structural — backend not yet implemented)
const feedAPI = {
  create: async (payload) => ({}),
  get: async (wallet) => [],
};

// Messaging (structural — backend not yet implemented)
const messagingAPI = {
  send: async (payload) => ({}),
  inbox: async (wallet) => [],
};

// Economy Dashboard
const economyAPI = {
  get: (wallet) => invoke("web3Economy", {}),
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

// ======================================================
//  COMPONENTS (structural + real bindings)
// ======================================================

// Identity badges (read from useCreator)
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

// Social graph
const SocialGraph = ({ graph }) => (
  <div className="text-sm text-muted-foreground">
    Followers: {graph?.followers?.length || 0} · Following: {graph?.following?.length || 0} · Connections: {graph?.connections?.length || 0}
  </div>
);

// Follow button (structural — social backend not implemented)
const FollowButton = ({ creatorWallet, isFollowing, viewerWallet }) => (
  <button
    onClick={() => (isFollowing ? socialAPI.unfollow({ followerWallet: viewerWallet, creatorWallet }) : socialAPI.follow({ followerWallet: viewerWallet, creatorWallet }))}
    className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80"
  >
    {isFollowing ? "Unfollow" : "Follow"}
  </button>
);

// Boost button (real)
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

// Subscription button (real)
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
//  PAGES (all merged)
// ======================================================

// Web3 Login (structural)
const Web3Login = () => <Page title="Web3 Login" subtitle="Connect your wallet to enter the Creator OS"><Card>Web3 login flow</Card></Page>;

// Web3 Profile (real)
const Web3Profile = () => {
  const { profile, loading } = useCreator();
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  return (
    <Page title="Web3 Profile" subtitle="Your on-chain creator identity">
      <Card className="space-y-2">
        <p className="text-sm font-mono">{profile?.wallet_address || "No wallet connected"}</p>
        <div className="flex gap-2"><Web3NameBadge creator={profile} /><VerificationBadge creator={profile} /><CreatorBadge creator={profile} /><PassportBadge creator={profile} /></div>
        <p className="text-sm text-muted-foreground mt-2">{profile?.bio}</p>
      </Card>
    </Page>
  );
};

// Verification (structural)
const Web3Verify = () => <Page title="Verification" subtitle="Mint your verification NFT"><Card>Verification flow</Card></Page>;

// Badge Upgrade (structural)
const BadgeUpgrade = () => <Page title="Badge Upgrade" subtitle="Upgrade your creator badge tier"><Card>Badge upgrade flow</Card></Page>;

// Passport (structural)
const CreatorPassport = () => <Page title="Creator Passport" subtitle="Your creator passport NFT"><Card>Passport flow</Card></Page>;

// Marketplace Dashboard (real)
const MarketplaceDashboard = () => {
  const wallet = useViewerWallet();
  const [data, setData] = useState({ products: [], count: 0, revenue: 0, sales: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!wallet) { setLoading(false); return; } marketplaceAPI.list(wallet).then(setData).finally(() => setLoading(false)); }, [wallet]);
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  return (
    <Page title="Marketplace" subtitle="Manage your digital products and track sales">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <Card><p className="text-xs text-muted-foreground">Products</p><p className="text-2xl font-display font-bold">{data.count}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Units Sold</p><p className="text-2xl font-display font-bold">{data.sales}</p></Card>
          <Card><p className="text-xs text-muted-foreground">Revenue</p><p className="text-2xl font-display font-bold text-accent">${data.revenue.toFixed(2)}</p></Card>
        </div>
        <Link to="/marketplace/add" className="ml-4 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Add Product</Link>
      </div>
    </Page>
  );
};

// Add Marketplace Product (real)
const AddMarketplaceProduct = () => {
  const wallet = useViewerWallet();
  const [form, setForm] = useState({ name: "", description: "", price: "", streamingPrice: "", category: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!wallet || !form.name) return;
    setSaving(true);
    try { await marketplaceAPI.add(wallet, { name: form.name, description: form.description, price: Number(form.price) || 0, streamingPrice: Number(form.streamingPrice) || 0, category: form.category }); } finally { setSaving(false); }
  };
  return (
    <Page title="Add Product" subtitle="Create a new digital product">
      <Card className="space-y-3 max-w-xl">
        <input value={form.name} onChange={set("name")} placeholder="Name" className="w-full rounded-md border border-input bg-muted px-3 py-2" />
        <textarea value={form.description} onChange={set("description")} placeholder="Description" rows={3} className="w-full rounded-md border border-input bg-muted px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.price} onChange={set("price")} type="number" placeholder="Price USD" className="rounded-md border border-input bg-muted px-3 py-2" />
          <input value={form.streamingPrice} onChange={set("streamingPrice")} type="number" placeholder="$STREAMING" className="rounded-md border border-input bg-muted px-3 py-2" />
        </div>
        <input value={form.category} onChange={set("category")} placeholder="Category" className="w-full rounded-md border border-input bg-muted px-3 py-2" />
        <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{saving ? "Saving..." : "Publish"}</button>
      </Card>
    </Page>
  );
};

// Marketplace Products (real)
const MarketplaceProducts = () => {
  const wallet = useViewerWallet();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!wallet) { setLoading(false); return; } marketplaceAPI.list(wallet).then((r) => setProducts(r.products || [])).finally(() => setLoading(false)); }, [wallet]);
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  return (
    <Page title="Products" subtitle="Your marketplace catalog">
      {products.length === 0 ? <Card><p className="text-sm text-muted-foreground">No products yet.</p></Card> : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id}><p className="font-medium truncate">{p.name}</p><p className="text-xs text-muted-foreground capitalize">{p.category || "uncategorized"}</p><p className="font-display font-bold mt-2">${(p.price || 0).toFixed(2)}</p></Card>
          ))}
        </div>
      )}
    </Page>
  );
};

// Marketplace Sales (real)
const MarketplaceSales = () => {
  const wallet = useViewerWallet();
  const [data, setData] = useState({ sales: [], count: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!wallet) { setLoading(false); return; } marketplaceAPI.sales(wallet).then(setData).finally(() => setLoading(false)); }, [wallet]);
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  return (
    <Page title="Sales" subtitle="Transaction history">
      <Card>{data.sales.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet.</p> : data.sales.map((s) => (<div key={s.id} className="flex justify-between py-2 border-b border-border/50 last:border-0"><span className="text-sm truncate">{s.description}</span><span className="text-sm text-accent">+${(s.amount || 0).toFixed(2)}</span></div>))}</Card>
    </Page>
  );
};

// Stream View (watch-to-earn — structural)
const StreamView = ({ creatorWallet }) => {
  const viewerWallet = useViewerWallet();
  const [sessionId, setSessionId] = useState(null);
  useEffect(() => { if (!viewerWallet) return; watchAPI.start(viewerWallet, creatorWallet).then((s) => setSessionId(s.id)); }, [viewerWallet]);
  useEffect(() => { if (!sessionId) return; const i = setInterval(() => watchAPI.tick(sessionId), 60000); return () => clearInterval(i); }, [sessionId]);
  return <Page title="Stream View" subtitle="Watch-to-earn"><Card><div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">Stream Player</div></Card></Page>;
};

// Boost Page (real)
const StreamBoost = () => {
  const viewerWallet = useViewerWallet();
  const [toWallet, setToWallet] = useState("");
  const [amount, setAmount] = useState(10);
  const [sending, setSending] = useState(false);
  const send = async () => {
    if (!viewerWallet || !toWallet) return;
    setSending(true);
    try { await boostsAPI.send({ viewerWallet, creatorWallet: toWallet, amount }); } finally { setSending(false); }
  };
  return (
    <Page title="Stream Boosts" subtitle="Send $STREAMING boosts to creators">
      <Card className="space-y-3 max-w-xl">
        <input value={toWallet} onChange={(e) => setToWallet(e.target.value)} placeholder="Creator wallet 0x..." className="w-full rounded-md border border-input bg-muted px-3 py-2 font-mono" />
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="rounded-md border border-input bg-muted px-3 py-2" />
        <button onClick={send} disabled={sending} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">{sending ? "Sending..." : "Send Boost"}</button>
      </Card>
    </Page>
  );
};

// Subscriptions (real)
const Subscriptions = () => {
  const viewerWallet = useViewerWallet();
  const [toWallet, setToWallet] = useState("");
  const [tier, setTier] = useState("basic");
  const [sending, setSending] = useState(false);
  const [subs, setSubs] = useState({ subscribers: [], count: 0, mrr: 0 });
  useEffect(() => { if (viewerWallet) subscriptionsAPI.list(viewerWallet).then(setSubs); }, [viewerWallet]);
  const subscribe = async () => {
    if (!viewerWallet || !toWallet) return;
    setSending(true);
    try { await subscriptionsAPI.subscribe({ subscriberWallet: viewerWallet, creatorWallet: toWallet, tier }); } finally { setSending(false); }
  };
  return (
    <Page title="Subscriptions" subtitle="Tiered subscriptions and your subscribers">
      <div className="grid grid-cols-2 gap-4">
        <Card><p className="text-xs text-muted-foreground">Subscribers</p><p className="text-2xl font-display font-bold">{subs.count}</p></Card>
        <Card><p className="text-xs text-muted-foreground">MRR</p><p className="text-2xl font-display font-bold text-accent">${(subs.mrr || 0).toFixed(2)}</p></Card>
      </div>
      <Card className="space-y-3 max-w-xl">
        <input value={toWallet} onChange={(e) => setToWallet(e.target.value)} placeholder="Creator wallet 0x..." className="w-full rounded-md border border-input bg-muted px-3 py-2 font-mono" />
        <select value={tier} onChange={(e) => setTier(e.target.value)} className="rounded-md border border-input bg-muted px-3 py-2">
          <option value="basic">Basic — $4.99/mo</option>
          <option value="plus">Plus — $9.99/mo</option>
          <option value="premium">Premium — $19.99/mo</option>
        </select>
        <button onClick={subscribe} disabled={sending} className="px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm">{sending ? "Subscribing..." : "Subscribe"}</button>
      </Card>
    </Page>
  );
};

// Feed (structural)
const Feed = () => <Page title="Feed" subtitle="Creator feed"><Card>Feed coming soon</Card></Page>;
const CreatePost = () => <Page title="Create Post" subtitle="Publish to your feed"><Card>Post composer coming soon</Card></Page>;
const PostView = () => <Page title="Post" subtitle="View a post"><Card>Post view coming soon</Card></Page>;

// Messaging (structural)
const Messages = () => <Page title="Messages" subtitle="Direct messages"><Card>Messaging coming soon</Card></Page>;

// Economy Dashboard (real)
const EconomyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { economyAPI.get().then(setData).finally(() => setLoading(false)); }, []);
  if (loading || !data) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
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
//  ROUTER (all pages merged)
// ======================================================
export default function LiveStreamLabApp() {
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
        <Route path="/stream" element={<StreamView creatorWallet={"WALLET"} />} />
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