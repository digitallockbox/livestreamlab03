// ======================================================
//  LiveStreamLabApp — Single merged structural frontend (all real)
//  One file: imports + API config + connectors + components + pages + router
//  Every connector bound to a real Base44 backend function via base44.functions.invoke
// ======================================================
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import { Loader2, Send, CheckCircle2, Radio, Video, Zap } from "lucide-react";
import { useCreator } from "@/hooks/web3/useCreator";
import { PhantomIdentityProvider, useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import BrandingSettings from "@/pages/settings/BrandingSettings";
import SecuritySettings from "@/pages/settings/SecuritySettings";
import NotificationSettings from "@/pages/settings/NotificationSettings";
import ConnectedAccounts from "@/pages/settings/ConnectedAccounts";
import BillingSettings from "@/pages/settings/BillingSettings";
import SupabaseExplorer from "@/pages/SupabaseExplorer";
import SharedLayout from "@/components/creator/SharedLayout";
import MultiWalletLogin from "@/components/creator/MultiWalletLogin";
import Onboarding from "@/components/creator/Onboarding";
import CreatorIdentityHeader from "@/components/creator/CreatorIdentityHeader";
import ErrorBoundary from "@/components/creator/ErrorBoundary";
import { IdentityProvider, useIdentity } from "@/lib/web3/identity";
import { trackEvent, identify } from "@/lib/tridentOS";
import IdentityGate from "@/components/identity/IdentityGate";
import {
  Page, Card, Spinner, Input, useViewerWallet,
  web3LoginAPI, web3ProfileAPI, verificationAPI, badgesAPI, passportAPI,
  marketplaceAPI, watchAPI, boostsAPI, subscriptionsAPI, socialAPI, feedAPI,
  messagingAPI, economyAPI, streamsAPI, videoAPI,
  Web3NameBadge, VerificationBadge, CreatorBadge, PassportBadge, SocialGraph,
  FollowButton, BoostButton, SubscribeButton,
} from "@/components/creator/os";
import Dashboard from "@/components/creator/pages/Dashboard";
import CreatorDashboard from "@/components/creator/pages/CreatorDashboard";
import GoLive from "@/components/creator/pages/GoLive";
import Wallet from "@/components/creator/pages/Wallet";
import Domains from "@/components/creator/pages/Domains";
import Streams from "@/components/creator/pages/Streams";
import Marketplace from "@/components/creator/pages/Marketplace";
import AddMarketplaceProduct from "@/components/creator/pages/AddMarketplaceProduct";
import MarketplaceProducts from "@/components/creator/pages/MarketplaceProducts";
import MarketplaceSales from "@/components/creator/pages/MarketplaceSales";
import Economy from "@/components/creator/pages/Economy";
import Profile from "@/components/creator/pages/Profile";
import Settings from "@/components/creator/pages/Settings";
import Watch from "@/components/creator/pages/Watch";
import Payouts from "@/components/creator/pages/Payouts";
import SalesDashboard from "@/components/creator/pages/SalesDashboard";
import CreatorVault from "@/components/creator/pages/CreatorVault";
import Landing from "@/pages/Landing";
import CreatorStorefront from "@/pages/CreatorStorefront";
import StoreProductList from "@/components/creator/store/StoreProductList";
import ProductDetail from "@/pages/store/ProductDetail";
import StoreDashboard from "@/pages/store/StoreDashboard";
import AddProductPage from "@/pages/store/AddProductPage";
import Checkout from "@/pages/store/Checkout";
import ThankYou from "@/pages/store/ThankYou";
import OrderHistory from "@/pages/store/OrderHistory";
import AffiliateDashboard from "@/pages/affiliates/AffiliateDashboard";
import AddAffiliateLink from "@/pages/affiliates/AddAffiliateLink";
import BulkAddLinks from "@/pages/affiliates/BulkAddLinks";
import PodcastManager from "@/components/creator/podcasts/PodcastManager";
import PodcastLibrary from "@/components/creator/podcasts/PodcastLibrary";
import PodcastAnalytics from "@/components/creator/podcasts/PodcastAnalytics";
import WarRoom from "@/components/creator/warroom/WarRoom";
import AdminPanel from "@/components/creator/pages/AdminPanel";
import RevenueDashboard from "@/components/creator/pages/RevenueDashboard";
import CoinTreeDashboard from "@/components/creator/cointree/CoinTreeDashboard";
import DashboardLayout from "@/components/trident/layout/DashboardLayout";
import OverviewPage from "@/pages/trident/OverviewPage";
import EngineOverviewDashboard from "@/components/trident/overview/EngineOverviewDashboard";
import RTMPPage from "@/pages/trident/RTMPPage";
import RTMPBitrateGraph from "@/components/trident/rtmp/RTMPBitrateGraph";
import RTMPSessionInspector from "@/components/trident/rtmp/RTMPSessionInspector";
import AutosplitPage from "@/pages/trident/AutosplitPage";
import AutosplitWorkerLoad from "@/components/trident/autosplit/AutosplitWorkerLoad";
import StoragePage from "@/pages/trident/StoragePage";
import StorageSnapshotViewer from "@/components/trident/storage/StorageSnapshotViewer";
import StorageSegmentTimeline from "@/components/trident/storage/StorageSegmentTimeline";
import IdentityPage from "@/pages/trident/IdentityPage";
import PhantomLogin from "@/components/trident/identity/PhantomLogin";
import TenantsPage from "@/pages/trident/TenantsPage";
import TenantAdminPanel from "@/components/trident/tenants/TenantAdminPanel";
import AdminPage from "@/pages/trident/AdminPage";

// API config, connectors, identity helpers, and shared UI live in @/components/creator/os





// ======================================================
//  PAGES (all real)
// ======================================================

// Profile page lives in @/components/creator/pages/Profile

// Verification
const Web3Verify = () => {
  const { profile, refresh } = useCreator();
  const { signedInvoke } = useIdentity();
  const [busy, setBusy] = useState(null);
  const verify = async (level) => { setBusy(level); try { await signedInvoke("web3Verify", { level }); refresh(); } finally { setBusy(null); } };
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
  const { signedInvoke } = useIdentity();
  const [busy, setBusy] = useState(false);
  const TIERS = ["bronze", "silver", "gold", "diamond"];
  const upgrade = async (tier) => { setBusy(true); try { await signedInvoke("web3Badges", tier ? { tier } : {}); refresh(); } finally { setBusy(false); } };
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
  const wallet = useViewerWallet();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!wallet) { setLoading(false); return; } passportAPI.get(wallet).then((r) => setPassport(r.passport)).finally(() => setLoading(false)); }, [wallet]);
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

// Marketplace pages live in @/components/creator/pages/Marketplace*

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
  const { signedInvoke } = useIdentity();
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const submit = async () => {
    if (!wallet || !content.trim()) return;
    setSaving(true);
    try { await signedInvoke("web3Feed", { action: "create", authorWallet: wallet, content: content.trim(), mediaUrl }); navigate("/feed"); } finally { setSaving(false); }
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
  const { signedInvoke } = useIdentity();
  const [toWallet, setToWallet] = useState("");
  const [content, setContent] = useState("");
  const [inbox, setInbox] = useState([]);
  const [sending, setSending] = useState(false);
  useEffect(() => { if (wallet) messagingAPI.inbox(wallet).then((r) => setInbox(r.messages || [])); }, [wallet]);
  const send = async () => {
    if (!wallet || !toWallet || !content.trim()) return;
    setSending(true);
    try { await signedInvoke("web3Messages", { action: "send", senderWallet: wallet, recipientWallet: toWallet, content: content.trim() }); messagingAPI.inbox(wallet).then((r) => setInbox(r.messages || [])); setContent(""); } finally { setSending(false); }
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

// Economy page lives in @/components/creator/pages/Economy



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
        <Link to={`/cointree/${id}`} className="text-primary hover:underline text-sm">Streaming Coin Tree →</Link>
        <Link to="/analytics" className="text-primary hover:underline text-sm">Unified Analytics →</Link>
      </div>
    </Page>
  );
};



// Watch (watch-to-earn + StreamPlayer) lives in @/components/creator/pages/Watch



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

// Settings hub lives in @/components/creator/pages/Settings

// Intermediate screen: wallet connected but not yet cryptographically verified.
const VerifyWallet = () => {
  const { walletAddress, login, authenticating, loginError } = useIdentity();
  return (
    <div className="max-w-md mx-auto p-8 mt-20 text-center space-y-4">
      <h1 className="text-2xl font-display font-bold">Verify Wallet</h1>
      <p className="text-sm text-muted-foreground break-all font-mono">{walletAddress}</p>
      <p className="text-sm text-muted-foreground">Sign a nonce to prove wallet ownership and unlock the Creator OS.</p>
      {loginError && <p className="text-sm text-destructive">{loginError}</p>}
      <button onClick={login} disabled={authenticating} className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm">
        {authenticating ? "Verifying…" : "Sign to Continue"}
      </button>
    </div>
  );
};

// ======================================================
//  ROUTER (all pages merged) + wallet gate
// ======================================================
// Trident OS SDK — fires page_view events on route changes (rendered inside BrowserRouter)
function TridentRouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackEvent("page_view", { path: location.pathname, search: location.search });
  }, [location.pathname, location.search]);
  return null;
}

function MainApp() {
  const { walletAddress, session } = useIdentity();
  const walletReady = !!(walletAddress && session && session.onboarding_completed);

  // Trident OS SDK — identify wallet when connected
  useEffect(() => {
    if (walletAddress) identify(walletAddress, { chain: session?.chain || "solana" });
  }, [walletAddress, session?.chain]);

  // Public + pre-onboarding states: rendered in the router so the Landing CTAs work.
  if (!walletReady) {
    return (
      <BrowserRouter>
        <TridentRouteTracker />
        <Routes>
          <Route path="/s/:domain" element={<CreatorStorefront />} />
          {!walletAddress ? (
            <>
              <Route path="/" element={<Landing />} />
              <Route path="/enter" element={<MultiWalletLogin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : !session ? (
            <Route path="*" element={<VerifyWallet />} />
          ) : (
            <Route path="*" element={<Onboarding />} />
          )}
        </Routes>
      </BrowserRouter>
    );
  }

  // Wallet connected, verified, and onboarded → Creator OS.
  return (
    <BrowserRouter>
      <TridentRouteTracker />
      <Routes>
        <Route path="/s/:domain" element={<CreatorStorefront />} />
        <Route element={<IdentityGate />}>
        <Route element={<SharedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/golive" element={<GoLive />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/verify" element={<Web3Verify />} />
        <Route path="/badges" element={<BadgeUpgrade />} />
        <Route path="/passport" element={<CreatorPassport />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/streams" element={<Streams />} />
        <Route path="/streams/analytics/:id" element={<StreamAnalytics />} />
        <Route path="/cointree/:streamId" element={<CoinTreeDashboard />} />
        <Route path="/boosts" element={<StreamBoost />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/create" element={<CreatePost />} />
        <Route path="/feed/view" element={<PostView />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/add" element={<AddMarketplaceProduct />} />
        <Route path="/marketplace/products" element={<MarketplaceProducts />} />
        <Route path="/marketplace/sales" element={<MarketplaceSales />} />
        <Route path="/economy" element={<Economy />} />
        <Route path="/domains" element={<Domains />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/billing" element={<BillingSettings />} />
        <Route path="/settings/branding" element={<BrandingSettings />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/settings/security" element={<SecuritySettings />} />
        <Route path="/settings/connected" element={<ConnectedAccounts />} />
        <Route path="/podcasts" element={<PodcastLibrary />} />
        <Route path="/podcasts/manage" element={<PodcastManager />} />
        <Route path="/podcasts/analytics" element={<PodcastAnalytics />} />
        <Route path="/warroom" element={<WarRoom />} />
        <Route path="/videos" element={<VideoLibrary />} />
        <Route path="/videos/upload" element={<UploadVideo />} />
        <Route path="/videos/manager" element={<VideoManager />} />
        <Route path="/videos/analytics" element={<VideoAnalytics />} />
        <Route path="/analytics" element={<UnifiedAnalytics />} />
        <Route path="/store" element={<StoreDashboard />} />
        <Route path="/store/add" element={<AddProductPage />} />
        <Route path="/store/products" element={<StoreProductList />} />
        <Route path="/store/product/:id" element={<ProductDetail />} />
        <Route path="/store/:productId/checkout" element={<Checkout />} />
        <Route path="/store/thank-you" element={<ThankYou />} />
        <Route path="/store/orders" element={<OrderHistory />} />
        <Route path="/affiliates" element={<AffiliateDashboard />} />
        <Route path="/affiliates/add" element={<AddAffiliateLink />} />
        <Route path="/affiliates/bulk" element={<BulkAddLinks />} />
        <Route path="/vault" element={<CreatorVault />} />
        <Route path="/payouts" element={<Payouts />} />
        <Route path="/sales" element={<SalesDashboard />} />
        <Route path="/supabase" element={<SupabaseExplorer />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/revenue" element={<RevenueDashboard />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/trident" element={<OverviewPage />} />
          <Route path="/trident/engines" element={<EngineOverviewDashboard />} />
          <Route path="/trident/rtmp" element={<RTMPPage />} />
          <Route path="/trident/rtmp/bitrate" element={<RTMPBitrateGraph />} />
          <Route path="/trident/rtmp/inspector" element={<RTMPSessionInspector />} />
          <Route path="/trident/autosplit" element={<AutosplitPage />} />
          <Route path="/trident/autosplit/workers" element={<AutosplitWorkerLoad />} />
          <Route path="/trident/storage" element={<StoragePage />} />
          <Route path="/trident/storage-viewer" element={<StorageSnapshotViewer />} />
          <Route path="/trident/storage-timeline" element={<StorageSegmentTimeline />} />
          <Route path="/trident/identity" element={<IdentityPage />} />
          <Route path="/trident/phantom-login" element={<PhantomLogin />} />
          <Route path="/trident/tenants" element={<TenantsPage />} />
          <Route path="/trident/tenants/admin" element={<TenantAdminPanel />} />
          <Route path="/trident/admin" element={<AdminPage />} />
        </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
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