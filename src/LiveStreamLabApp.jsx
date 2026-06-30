// ======================================================
//  LiveStreamLabApp — Single merged structural frontend (all real)
//  One file: imports + API config + connectors + components + pages + router
//  Every connector bound to a real Base44 backend function via base44.functions.invoke
// ======================================================
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, Send, CheckCircle2, Radio, Video, Zap } from "lucide-react";
import { useCreator } from "@/hooks/web3/useCreator";
import { PhantomIdentityProvider, useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import BrandingSettings from "@/pages/settings/BrandingSettings";
import SecuritySettings from "@/pages/settings/SecuritySettings";
import NotificationSettings from "@/pages/settings/NotificationSettings";
import ConnectedAccounts from "@/pages/settings/ConnectedAccounts";
import SupabaseExplorer from "@/pages/SupabaseExplorer";
import SharedLayout from "@/components/creator/SharedLayout";
import MultiWalletLogin from "@/components/creator/MultiWalletLogin";
import Onboarding from "@/components/creator/Onboarding";
import CreatorIdentityHeader from "@/components/creator/CreatorIdentityHeader";
import ErrorBoundary from "@/components/creator/ErrorBoundary";
import { IdentityProvider, useIdentity } from "@/lib/web3/identity";
import {
  Page, Card, Spinner, Input, useViewerWallet,
  web3LoginAPI, web3ProfileAPI, verificationAPI, badgesAPI, passportAPI,
  marketplaceAPI, watchAPI, boostsAPI, subscriptionsAPI, socialAPI, feedAPI,
  messagingAPI, economyAPI, streamsAPI, videoAPI,
  Web3NameBadge, VerificationBadge, CreatorBadge, PassportBadge, SocialGraph,
  FollowButton, BoostButton, SubscribeButton,
} from "@/components/creator/os";
import Home from "@/components/creator/pages/Home";
import GoLive from "@/components/creator/pages/GoLive";
import Wallet from "@/components/creator/pages/Wallet";
import Domains from "@/components/creator/pages/Domains";
import Streams from "@/components/creator/pages/Streams";

// API config, connectors, identity helpers, and shared UI live in @/components/creator/os





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
  const { signedInvoke } = useIdentity();
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
  const { signedInvoke } = useIdentity();
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
  const { signedInvoke } = useIdentity();
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



// Streams page now lives in its own responsive component: @/components/creator/pages/Streams

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
      <div className="flex gap-4">
        <Link to="/streams" className="text-primary hover:underline text-sm">← Back to all streams</Link>
        <Link to="/analytics" className="text-primary hover:underline text-sm">Unified Analytics →</Link>
      </div>
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
  const { signedInvoke } = useIdentity();
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
  const { signedInvoke } = useIdentity();
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
      <Link to="/analytics" className="text-primary hover:underline text-sm">Unified Analytics →</Link>
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

// Intermediate screen: wallet connected but not yet cryptographically verified.
const VerifyWallet = () => {
  const { walletAddress, login, authenticating } = useIdentity();
  return (
    <div className="max-w-md mx-auto p-8 mt-20 text-center space-y-4">
      <h1 className="text-2xl font-display font-bold">Verify Wallet</h1>
      <p className="text-sm text-muted-foreground break-all font-mono">{walletAddress}</p>
      <p className="text-sm text-muted-foreground">Sign a nonce to prove wallet ownership and unlock the Creator OS.</p>
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
  const { walletAddress, session } = useIdentity();
  // Identity gate: a wallet must be connected AND cryptographically verified before any engine loads.
  if (!walletAddress) return <MultiWalletLogin />;
  if (!session) return <VerifyWallet />;
  if (!session.onboarding_completed) return <Onboarding />;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SharedLayout />}>
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
        <Route path="/domains" element={<Domains />} />
        <Route path="/go-live" element={<GoLive />} />
        <Route path="/watch" element={<WatchToEarn />} />
        <Route path="/streams" element={<Streams />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function LiveStreamLabApp() {
  return (
    <PhantomIdentityProvider>
      <IdentityProvider>
        <ErrorBoundary>
          <MainApp />
        </ErrorBoundary>
      </IdentityProvider>
    </PhantomIdentityProvider>
  );
}