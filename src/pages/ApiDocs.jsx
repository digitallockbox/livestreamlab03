import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Copy, CheckCircle2, ChevronDown, ChevronRight, Shield, Zap, Lock, FolderOpen, Folder, FileCode2, GitBranch } from "lucide-react";

const BASE_URL = "https://api.livestreamlab.live";

const METHOD_STYLES = {
  GET:    "bg-primary/10 text-primary border-primary/20",
  POST:   "bg-accent/10 text-accent border-accent/20",
  PATCH:  "bg-chart-3/10 text-chart-3 border-chart-3/20",
  DELETE: "bg-destructive/10 text-destructive border-destructive/20",
};

const ENDPOINTS = [
  {
    group: "Auth & User",
    icon: "🔐",
    color: "text-primary",
    bg: "bg-primary/10",
    routes: [
      { method: "POST",  path: "/auth/signup",  desc: "Create a new creator account.", auth: false, body: '{ "email": "string", "password": "string", "username": "string" }', response: '{ "token": "jwt", "user": { "id": "...", "email": "..." } }' },
      { method: "POST",  path: "/auth/login",   desc: "Authenticate and return a JWT.", auth: false, body: '{ "email": "string", "password": "string" }', response: '{ "token": "jwt", "user": { ... } }' },
      { method: "GET",   path: "/auth/me",      desc: "Return the logged-in creator's profile.", auth: true, response: '{ "id": "...", "email": "...", "username": "...", "segment": "..." }' },
    ],
  },
  {
    group: "Creator Onboarding",
    icon: "🚀",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    routes: [
      { method: "POST", path: "/creator/onboarding/start",  desc: "Runs Aegis risk baseline, Overwatch segmentation, and Omega payout setup.", auth: true, body: '{ "creator_id": "string" }', response: '{ "status": "initiated", "workflow_id": "..." }' },
      { method: "GET",  path: "/creator/onboarding/status", desc: "Returns current onboarding progress and step completion.", auth: true, response: '{ "step": 3, "total": 5, "complete": false, "steps": [...] }' },
    ],
  },
  {
    group: "Creator Profile",
    icon: "👤",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    routes: [
      { method: "GET",   path: "/creator/profile", desc: "Returns segment, monetization layer, risk level, payout status, and analytics summary.", auth: true, response: '{ "segment": "Gold", "monetization_layer": 3, "risk_level": "low", "payout_status": "active" }' },
      { method: "PATCH", path: "/creator/profile", desc: "Update creator profile fields.", auth: true, body: '{ "bio": "string", "avatar_url": "string", "display_name": "string" }', response: '{ "updated": true, "profile": { ... } }' },
    ],
  },
  {
    group: "Streaming",
    icon: "📡",
    color: "text-destructive",
    bg: "bg-destructive/10",
    routes: [
      { method: "POST", path: "/stream/start",        desc: "Start a new live stream session.", auth: true, body: '{ "title": "string", "category": "string" }', response: '{ "stream_id": "...", "stream_key": "...", "rtmp_url": "..." }' },
      { method: "POST", path: "/stream/end",          desc: "End the active live stream session.", auth: true, body: '{ "stream_id": "string" }', response: '{ "ended": true, "duration_minutes": 42 }' },
      { method: "GET",  path: "/stream/:id",          desc: "Get stream details by ID.", auth: false, response: '{ "id": "...", "title": "...", "status": "live", "viewer_count": 1240 }' },
      { method: "GET",  path: "/stream/:id/chat",     desc: "Fetch recent chat messages for a stream.", auth: false, response: '{ "messages": [{ "user": "...", "text": "...", "ts": "..." }] }' },
      { method: "POST", path: "/stream/:id/chat",     desc: "Send a chat message to a stream.", auth: true, body: '{ "text": "string" }', response: '{ "sent": true }' },
      { method: "POST", path: "/stream/:id/tip",      desc: "Viewer sends a tip. Omega handles the payout split automatically.", auth: true, body: '{ "amount": 50, "currency": "STREAMING" }', response: '{ "tip_id": "...", "routed": true }' },
    ],
  },
  {
    group: "Video / Audio / Podcast",
    icon: "🎬",
    color: "text-primary",
    bg: "bg-primary/10",
    routes: [
      { method: "POST",   path: "/content/upload",  desc: "Upload video, audio, or podcast content.", auth: true, body: '{ "type": "video|audio|podcast", "file_url": "string", "title": "string" }', response: '{ "content_id": "...", "status": "processing" }' },
      { method: "GET",    path: "/content/list",    desc: "List all creator content.", auth: true, response: '{ "items": [{ "id": "...", "type": "...", "title": "...", "status": "..." }] }' },
      { method: "GET",    path: "/content/:id",     desc: "Get full details for a content item.", auth: false, response: '{ "id": "...", "title": "...", "url": "...", "views": 0 }' },
      { method: "DELETE", path: "/content/:id",     desc: "Delete a content item.", auth: true, response: '{ "deleted": true }' },
    ],
  },
  {
    group: "Store & Marketplace",
    icon: "🛒",
    color: "text-accent",
    bg: "bg-accent/10",
    routes: [
      { method: "POST", path: "/store/item",            desc: "Create a new store product.", auth: true, body: '{ "name": "string", "price": 0, "streaming_price": 0, "file_url": "string" }', response: '{ "item_id": "...", "status": "published" }' },
      { method: "GET",  path: "/store/items",           desc: "List all creator store products.", auth: true, response: '{ "items": [{ "id": "...", "name": "...", "price": 0 }] }' },
      { method: "POST", path: "/store/purchase",        desc: "Viewer purchases an item. Omega handles the revenue split.", auth: true, body: '{ "item_id": "string", "payment": "usd|streaming" }', response: '{ "order_id": "...", "download_url": "..." }' },
      { method: "GET",  path: "/marketplace/products",  desc: "List affiliate marketplace products.", auth: false, response: '{ "products": [{ "id": "...", "title": "...", "commission": 0.05 }] }' },
      { method: "POST", path: "/marketplace/purchase",  desc: "Affiliate sale. Omega handles multi-party split.", auth: true, body: '{ "product_id": "string", "ref": "string" }', response: '{ "sale_id": "...", "split_executed": true }' },
    ],
  },
  {
    group: "Payouts — Omega Façade",
    icon: "💰",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    routes: [
      { method: "GET",  path: "/payouts/summary",  desc: "Returns creator share, platform fee, pending payouts, and payout history.", auth: true, response: '{ "creator_share": 840.00, "pending": 210.00, "platform_fee": 0.05, "history": [...] }' },
      { method: "POST", path: "/payouts/request",  desc: "Creator requests a payout withdrawal.", auth: true, body: '{ "amount": 500, "method": "bank|crypto|streaming" }', response: '{ "request_id": "...", "status": "processing" }' },
      { method: "GET",  path: "/payouts/methods",  desc: "List available payout methods for the creator.", auth: true, response: '{ "methods": ["bank_transfer", "crypto", "streaming_token"] }' },
    ],
  },
  {
    group: "Segmentation — Overwatch Façade",
    icon: "🎯",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    routes: [
      { method: "GET",  path: "/creator/segment",         desc: "Returns segment tier, monetization layer, and features unlocked.", auth: true, response: '{ "segment": "Gold", "layer": 3, "features": ["tips", "store", "premium_content"] }' },
      { method: "POST", path: "/creator/segment/refresh", desc: "Re-run Overwatch segmentation for this creator.", auth: true, response: '{ "refreshed": true, "new_segment": "Platinum" }' },
    ],
  },
  {
    group: "Risk & Fraud — Aegis Façade",
    icon: "🛡️",
    color: "text-destructive",
    bg: "bg-destructive/10",
    routes: [
      { method: "GET",  path: "/creator/risk",         desc: "Returns trust score, risk level, and active flags.", auth: true, response: '{ "trust_score": 92, "risk_level": "low", "flags": [] }' },
      { method: "POST", path: "/creator/risk/refresh", desc: "Re-run Aegis risk evaluation for this creator.", auth: true, response: '{ "refreshed": true, "new_risk_level": "low" }' },
    ],
  },
  {
    group: "Analytics",
    icon: "📊",
    color: "text-primary",
    bg: "bg-primary/10",
    routes: [
      { method: "GET", path: "/analytics/overview",      desc: "High-level stats across all content types.", auth: true, response: '{ "total_revenue": 1840, "streams": 12, "views": 48200, "tips": 320 }' },
      { method: "GET", path: "/analytics/stream/:id",    desc: "Detailed analytics for a specific stream.", auth: true, response: '{ "peak_viewers": 840, "duration": 72, "tips": 145, "chat_messages": 2400 }' },
      { method: "GET", path: "/analytics/content/:id",   desc: "Detailed analytics for a video, audio, or podcast.", auth: true, response: '{ "views": 4200, "watch_time_hours": 190, "revenue": 340 }' },
    ],
  },
  {
    group: "Tenant / Enterprise",
    icon: "🏢",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    routes: [
      { method: "POST", path: "/tenant/register",       desc: "Register an enterprise tenant (Walmart, Target, agency).", auth: true, body: '{ "name": "string", "domain": "string", "plan": "enterprise" }', response: '{ "tenant_id": "...", "status": "active" }' },
      { method: "GET",  path: "/tenant/:id/creators",   desc: "List all creators under a tenant.", auth: true, response: '{ "creators": [{ "id": "...", "username": "..." }] }' },
      { method: "POST", path: "/tenant/:id/invite",     desc: "Invite a creator to join a tenant.", auth: true, body: '{ "email": "string", "role": "creator|manager" }', response: '{ "invite_sent": true }' },
    ],
  },
  {
    group: "System / Health",
    icon: "⚙️",
    color: "text-muted-foreground",
    bg: "bg-secondary",
    routes: [
      { method: "GET", path: "/system/health",  desc: "Check backend service status.", auth: false, response: '{ "status": "ok", "uptime": "99.98%" }' },
      { method: "GET", path: "/engines/health", desc: "Check Omega, Aegis, and Overwatch engine connectivity.", auth: false, response: '{ "omega": "ok", "aegis": "ok", "overwatch": "ok" }' },
    ],
  },
];

function EndpointRow({ route }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullPath = `${BASE_URL}${route.path}`;
  const copy = () => { navigator.clipboard.writeText(fullPath); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className={`border border-border rounded-xl overflow-hidden transition-all ${open ? "bg-card" : "bg-secondary/30 hover:bg-secondary/50"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3.5 text-left">
        <Badge className={`text-xs border shrink-0 w-16 justify-center ${METHOD_STYLES[route.method]}`}>{route.method}</Badge>
        <code className="text-sm text-foreground font-mono flex-1">{route.path}</code>
        {route.auth && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">{route.desc}</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md flex-1 truncate font-mono">{fullPath}</code>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={copy}>
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
          {route.auth && (
            <div className="flex items-center gap-2 text-xs text-chart-3">
              <Lock className="w-3 h-3" />
              <span>Requires <code className="bg-secondary px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code></span>
            </div>
          )}
          {route.body && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Request Body</p>
              <pre className="text-xs bg-background border border-border rounded-xl p-3 text-foreground overflow-x-auto font-mono">{route.body}</pre>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Response</p>
            <pre className="text-xs bg-background border border-border rounded-xl p-3 text-accent overflow-x-auto font-mono">{route.response}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

const FOLDER_TREE = [
  {
    name: "apps/api/src/", type: "root", children: [
      {
        name: "routes/", type: "folder", desc: "REST endpoints Base44 calls. One file = one endpoint.", children: [
          { name: "auth/", type: "folder", files: ["login.ts", "signup.ts", "me.ts"] },
          { name: "creator/", type: "folder", files: ["profile.ts", "onboarding.ts", "segment.ts", "risk.ts"] },
          { name: "stream/", type: "folder", files: ["start.ts", "end.ts", "details.ts", "chat.ts", "tip.ts"] },
          { name: "content/", type: "folder", files: ["upload.ts", "list.ts", "details.ts", "delete.ts"] },
          { name: "store/", type: "folder", files: ["createItem.ts", "listItems.ts", "purchase.ts"] },
          { name: "marketplace/", type: "folder", files: ["listProducts.ts", "purchase.ts"] },
          { name: "payouts/", type: "folder", files: ["summary.ts", "request.ts", "methods.ts"] },
          { name: "analytics/", type: "folder", files: ["overview.ts", "streamAnalytics.ts", "contentAnalytics.ts"] },
          { name: "tenant/", type: "folder", files: ["register.ts", "creators.ts", "invite.ts"] },
          { name: "system/", type: "folder", files: ["health.ts", "enginesHealth.ts"] },
        ],
      },
      {
        name: "controllers/", type: "folder", desc: "Receive requests and call services.", files: [
          "authController.ts", "creatorController.ts", "streamController.ts", "contentController.ts",
          "storeController.ts", "marketplaceController.ts", "payoutsController.ts",
          "analyticsController.ts", "tenantController.ts", "systemController.ts",
        ],
      },
      {
        name: "services/", type: "folder", desc: "Workflow logic. Calls engine façades. Logic stays safe.", files: [
          "onboardingService.ts", "streamService.ts", "contentService.ts",
          "payoutsService.ts", "analyticsService.ts", "tenantService.ts",
        ],
      },
      {
        name: "engines/", type: "folder", color: "text-destructive", desc: "Façade layer only. Private engines are never in this repo.", files: [
          "omega.ts — façade", "aegis.ts — façade", "overwatch.ts — façade", "bridge.ts — secure connector",
        ],
      },
      {
        name: "middleware/", type: "folder", desc: "Auth, CORS, rate limiting, error handling.", files: [
          "auth.ts", "cors.ts", "errorHandler.ts", "rateLimit.ts",
        ],
      },
      {
        name: "utils/", type: "folder", desc: "Helpers: JWT, file uploads, validation, logging.", files: [
          "jwt.ts", "uploader.ts", "validator.ts", "logger.ts",
        ],
      },
      { name: "index.ts", type: "file", desc: "Bootstraps the API server." },
    ],
  },
];

function FolderNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const pl = depth * 16;
  const isEngine = node.name === "engines/";

  if (node.type === "file") {
    return (
      <div style={{ paddingLeft: pl }} className="flex items-center gap-2 py-1">
        <FileCode2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-mono text-muted-foreground">{node.name}</span>
        {node.desc && <span className="text-xs text-muted-foreground/60 ml-2">— {node.desc}</span>}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setOpen(!open)} style={{ paddingLeft: pl }}
        className="flex items-center gap-2 py-1.5 w-full text-left group hover:bg-secondary/40 rounded-lg px-2 -ml-2 transition-colors">
        {open
          ? <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isEngine ? "text-destructive" : "text-chart-3"}`} />
          : <Folder className={`w-3.5 h-3.5 shrink-0 ${isEngine ? "text-destructive" : "text-chart-3"}`} />}
        <span className={`text-xs font-mono font-semibold ${isEngine ? "text-destructive" : "text-foreground"}`}>{node.name}</span>
        {isEngine && <Badge className="text-[10px] bg-destructive/10 text-destructive border-destructive/20 py-0 px-1.5">private façade</Badge>}
        {node.desc && !isEngine && <span className="text-xs text-muted-foreground/60 hidden sm:block ml-1">— {node.desc}</span>}
        {open ? <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto" /> : <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />}
      </button>
      {open && (
        <div>
          {node.children?.map((child, i) => <FolderNode key={i} node={child} depth={depth + 1} />)}
          {node.files?.map((file, i) => (
            <div key={i} style={{ paddingLeft: (depth + 1) * 16 }} className="flex items-center gap-2 py-0.5">
              <FileCode2 className="w-3 h-3 text-muted-foreground/50 shrink-0" />
              <span className={`text-xs font-mono ${isEngine ? "text-destructive/70" : "text-muted-foreground"}`}>{file}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArchitectureTab() {
  return (
    <div className="space-y-6">
      {/* Flow diagram */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Request Flow</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { label: "Base44 UI", color: "bg-primary/10 text-primary border-primary/20" },
            { label: "→" },
            { label: "routes/", color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
            { label: "→" },
            { label: "controllers/", color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
            { label: "→" },
            { label: "services/", color: "bg-accent/10 text-accent border-accent/20" },
            { label: "→" },
            { label: "engines/ façade", color: "bg-destructive/10 text-destructive border-destructive/20" },
            { label: "→" },
            { label: "🔒 Private Engines", color: "bg-secondary text-muted-foreground border-border" },
          ].map((item, i) =>
            item.color
              ? <Badge key={i} className={`border text-xs ${item.color}`}>{item.label}</Badge>
              : <span key={i} className="text-muted-foreground font-bold">{item.label}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Private engines (Omega, Aegis, Overwatch) live outside the repo. The façade layer in <code className="bg-secondary px-1 rounded">engines/</code> is the only bridge.</p>
      </div>

      {/* Folder tree */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-4 h-4 text-chart-3" />
          <h3 className="font-display font-semibold text-foreground">Folder Structure</h3>
          <Badge className="bg-secondary text-muted-foreground border-border text-xs">apps/api/src/</Badge>
        </div>
        <div className="font-mono">
          {FOLDER_TREE[0].children.map((node, i) => <FolderNode key={i} node={node} depth={0} />)}
        </div>
      </div>

      {/* Layer descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: "📁", label: "routes/", desc: "One file per endpoint. Base44 calls these directly via REST.", color: "border-chart-3/20 bg-chart-3/5" },
          { icon: "🎮", label: "controllers/", desc: "Receive the HTTP request and delegate to the right service.", color: "border-chart-4/20 bg-chart-4/5" },
          { icon: "⚙️", label: "services/", desc: "Business workflow logic. Calls engine façades. Logic stays server-side.", color: "border-accent/20 bg-accent/5" },
          { icon: "🛡️", label: "engines/ (façade)", desc: "Thin wrappers around Omega, Aegis, Overwatch. Engines never exposed.", color: "border-destructive/20 bg-destructive/5" },
          { icon: "🔒", label: "middleware/", desc: "Auth guards, CORS policy, rate limiting, global error handling.", color: "border-primary/20 bg-primary/5" },
          { icon: "🔧", label: "utils/", desc: "JWT helpers, file uploader, input validator, structured logger.", color: "border-border bg-secondary/30" },
        ].map(item => (
          <div key={item.label} className={`border rounded-xl p-3 ${item.color}`}>
            <p className="text-sm font-semibold text-foreground">{item.icon} <code className="font-mono">{item.label}</code></p>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApiDocs() {
  const [tab, setTab] = useState("endpoints");
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);

  const filtered = ENDPOINTS.map(group => ({
    ...group,
    routes: group.routes.filter(r =>
      r.path.toLowerCase().includes(search.toLowerCase()) ||
      r.desc.toLowerCase().includes(search.toLowerCase()) ||
      r.method.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.routes.length > 0);

  const totalEndpoints = ENDPOINTS.reduce((s, g) => s + g.routes.length, 0);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">API Reference</h1>
            <p className="text-muted-foreground text-sm">LiveStreamLab.live — Public Façade Endpoints</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Base URL</p>
            <code className="text-sm font-mono text-primary">{BASE_URL}</code>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-accent" />{totalEndpoints} endpoints</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-chart-3" />JWT Auth</span>
            <Badge className="bg-accent/10 text-accent border-accent/20">REST / JSON</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-6 w-fit">
        {[{ id: "endpoints", label: "API Endpoints" }, { id: "architecture", label: "Backend Structure" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "architecture" && <ArchitectureTab />}
      {tab === "endpoints" && <>

      {/* Auth note */}
      <div className="bg-chart-3/5 border border-chart-3/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Lock className="w-4 h-4 text-chart-3 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Authentication</p>
          <p className="text-xs text-muted-foreground mt-0.5">Protected endpoints require <code className="bg-secondary px-1 py-0.5 rounded text-xs">Authorization: Bearer &lt;token&gt;</code> header. Obtain a token via <code className="bg-secondary px-1 py-0.5 rounded text-xs">POST /auth/login</code>.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search endpoints, methods, paths..." className="pl-9 bg-secondary border-border" />
      </div>

      {/* Group nav */}
      {!search && (
        <div className="flex flex-wrap gap-2 mb-6">
          {ENDPOINTS.map(g => (
            <button key={g.group} onClick={() => setActiveGroup(activeGroup === g.group ? null : g.group)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                ${activeGroup === g.group ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}>
              {g.icon} {g.group}
            </button>
          ))}
        </div>
      )}

      {/* Endpoint Groups */}
      <div className="space-y-6">
        {(search ? filtered : (activeGroup ? ENDPOINTS.filter(g => g.group === activeGroup) : ENDPOINTS)).map(group => (
          <div key={group.group}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-lg ${group.bg} flex items-center justify-center text-sm`}>{group.icon}</div>
              <h3 className={`font-display font-semibold ${group.color}`}>{group.group}</h3>
              <Badge className="bg-secondary text-muted-foreground border-border text-xs">{group.routes.length}</Badge>
            </div>
            <div className="space-y-2">
              {group.routes.map(route => (
                <EndpointRow key={`${route.method}-${route.path}`} route={route} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-10 p-4 rounded-2xl bg-card border border-border text-center">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Frontend calls endpoints → Backend calls engines → Engines stay private.</span>
          <br />The Trident engines (Omega, Aegis, Overwatch) are never exposed to the frontend. All logic runs server-side.
        </p>
      </div>
      </>}
    </div>
  );
}