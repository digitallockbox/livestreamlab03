import React, { useEffect, useState } from "react";
import { Loader2, Zap, CreditCard, UserPlus, UserMinus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { storeApi as engineStore, marketplaceApi as engineMarketplace } from "@/lib/tridentApi";
import { useIdentity } from "@/lib/web3/identity";

const invoke = (name, payload) => base44.functions.invoke(name, payload).then((r) => r.data);

// Identity root: the unified (Solana or EVM) wallet address is the viewer/creator identity across the whole OS.
export const useViewerWallet = () => {
  const { walletAddress } = useIdentity();
  return walletAddress;
};

// ======================================================
//  API CONNECTORS (bound to real Base44 functions)
// ======================================================
export const web3LoginAPI = {
  login: (wallet_address) => invoke("web3Login", { wallet_address }),
  nonce: () => invoke("web3Login", {}),
  verify: (payload) => invoke("web3Verify", payload),
};

export const web3ProfileAPI = {
  me: (wallet_address) => invoke("web3Profile", { action: "me", wallet_address }),
  get: (wallet_address) => invoke("web3Profile", { action: "get", wallet_address }),
  update: (payload) => invoke("web3Profile", { action: "update", ...payload }),
};

export const verificationAPI = {
  mint: (level) => invoke("web3Verify", { level }),
};

export const badgesAPI = {
  upgrade: (tier) => invoke("web3Badges", tier ? { tier } : {}),
};

export const passportAPI = {
  get: (wallet_address) => invoke("web3Passport", { wallet_address }),
};

export const marketplaceAPI = {
  add: (creatorWallet, data) => engineMarketplace.add({ creatorWallet, ...data }),
  list: (creatorWallet) => engineMarketplace.list({ creatorWallet }),
  sales: (creatorWallet) => engineMarketplace.sales({ creatorWallet }),
  purchase: (payload) => engineMarketplace.buy(payload),
};

export const watchAPI = {
  start: (viewerWallet, creatorWallet) => invoke("web3Watch", { action: "start", viewerWallet, creatorWallet }),
  tick: (sessionId) => invoke("web3Watch", { action: "tick", sessionId }),
  end: (sessionId) => invoke("web3Watch", { action: "end", sessionId }),
  leaderboard: (streamId, creatorWallet) => invoke("web3Watch", { action: "leaderboard", streamId, creatorWallet }),
  streak: (wallet) => invoke("web3Watch", { action: "streak", wallet }),
  notifications: (wallet) => invoke("web3Watch", { action: "notifications", wallet }),
  markRead: (wallet) => invoke("web3Watch", { action: "markRead", wallet }),
};

export const boostsAPI = {
  send: (payload) => invoke("web3Boosts", { action: "send", ...payload }),
  list: (wallet) => invoke("web3Boosts", { action: "list", wallet }),
};

export const subscriptionsAPI = {
  subscribe: (payload) => invoke("web3Subscriptions", { action: "subscribe", ...payload }),
  list: (wallet) => invoke("web3Subscriptions", { action: "list", wallet }),
};

export const socialAPI = {
  follow: (payload) => invoke("web3Social", { action: "follow", ...payload }),
  unfollow: (payload) => invoke("web3Social", { action: "unfollow", ...payload }),
  graph: (wallet) => invoke("web3Social", { action: "graph", wallet }),
};

export const feedAPI = {
  create: (payload) => invoke("web3Feed", { action: "create", ...payload }),
  get: (wallet) => invoke("web3Feed", { action: "get", wallet }),
  view: (postId) => invoke("web3Feed", { action: "view", postId }),
};

export const messagingAPI = {
  send: (payload) => invoke("web3Messages", { action: "send", ...payload }),
  inbox: (wallet) => invoke("web3Messages", { action: "inbox", wallet }),
};

export const economyAPI = {
  get: () => invoke("web3Economy", {}),
};

export const streamsAPI = {
  start: (creatorWallet, title, extra = {}) => invoke("web3Streams", { action: "start", creatorWallet, title, ...extra }),
  live: () => invoke("web3Streams", { action: "live" }),
  past: (creatorWallet) => invoke("web3Streams", { action: "past", creatorWallet }),
  end: (streamId) => invoke("web3Streams", { action: "end", streamId }),
  analytics: (streamId) => invoke("web3Streams", { action: "analytics", streamId }),
};

export const transfersAPI = {
  record: (payload) => invoke("web3Transfers", { action: "record", ...payload }),
  list: (wallet) => invoke("web3Transfers", { action: "list", wallet }),
};

export const videoAPI = {
  list: (creatorWallet) => invoke("web3Videos", { action: "list", creatorWallet }),
  create: (creatorWallet, data) => invoke("web3Videos", { action: "create", creatorWallet, ...data }),
  update: (id, data) => invoke("web3Videos", { action: "update", id, ...data }),
  remove: (id) => invoke("web3Videos", { action: "delete", id }),
  analytics: (creatorWallet) => invoke("web3Videos", { action: "analytics", creatorWallet }),
};

export const domainsAPI = {
  purchase: (payload) => invoke("freenamePurchase", { action: "purchase", ...payload }),
  list: (wallet) => invoke("freenamePurchase", { action: "list", wallet }),
  get: (wallet) => invoke("freenamePurchase", { action: "get", wallet }),
};

export const storeAPI = {
  list: (creatorWallet) => engineStore.list({ creatorWallet }),
  searchAmazon: (searchTerm) => engineStore.searchAmazon({ searchTerm }),
  addAmazon: (payload) => engineStore.addAmazon(payload),
  addCustom: (payload) => engineStore.addCustom(payload),
  storefront: (domain) => engineStore.storefront({ domain }),
  click: (payload) => engineStore.click(payload),
};

// ======================================================
//  SHARED UI HELPERS
// ======================================================
export const Page = ({ title, subtitle, children }) => (
  <div className="max-w-5xl mx-auto space-y-6 p-4">
    <div>
      <h1 className="text-2xl font-display font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);
export const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>{children}</div>
);
export const Spinner = () => <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
export const Input = (props) => <input {...props} className={`w-full rounded-md border border-input bg-muted px-3 py-2 ${props.className || ""}`} />;

// ======================================================
//  SHARED BADGES & BUTTONS
// ======================================================
export const Web3NameBadge = ({ creator }) => <span className="font-mono text-sm">{creator?.ens_name || creator?.display_name || "—"}</span>;
export const VerificationBadge = ({ creator }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full ${creator?.verified ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
    {creator?.verified ? "Verified" : "Unverified"}
  </span>
);
export const CreatorBadge = ({ creator }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary capitalize">{creator?.badge_tier || "bronze"}</span>
);
export const PassportBadge = ({ creator }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
    {creator?.verification_level === "full" ? "Passport Active" : "No Passport"}
  </span>
);

export const SocialGraph = ({ graph }) => (
  <div className="text-sm text-muted-foreground">
    Followers: {graph?.followers_count || 0} · Following: {graph?.following_count || 0} · Connections: {(graph?.following || []).length}
  </div>
);

export const FollowButton = ({ creatorWallet, viewerWallet }) => {
  const { signedInvoke } = useIdentity();
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
      const res = await (following ? signedInvoke("web3Social", { action: "unfollow", followerWallet: viewerWallet, creatorWallet }) : signedInvoke("web3Social", { action: "follow", followerWallet: viewerWallet, creatorWallet }));
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

export const BoostButton = ({ creatorWallet, viewerWallet, amount = 10 }) => {
  const { signedInvoke } = useIdentity();
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

export const SubscribeButton = ({ creatorWallet, viewerWallet, tier = "basic" }) => {
  const { signedInvoke } = useIdentity();
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