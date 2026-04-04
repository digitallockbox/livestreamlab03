import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, Zap, MousePointer, TrendingUp, Copy,
  Edit3, ExternalLink, Pause, Play, Tag
} from "lucide-react";

const ALL_LINKS = [
  { id: 1, title: "StreamDeck Pro",    category: "Tech",      clicks: 1240, conversions: 38, commission: 142.00, streaming: 380,  status: "active",  ctr: 3.1 },
  { id: 2, title: "Elgato Gear Link",  category: "Streaming", clicks: 890,  conversions: 21, commission: 98.50,  streaming: 210,  status: "active",  ctr: 2.4 },
  { id: 3, title: "SecretLab Chair",   category: "Gaming",    clicks: 2150, conversions: 54, commission: 299.50, streaming: 540,  status: "active",  ctr: 2.5 },
  { id: 4, title: "Rode Microphones",  category: "Audio",     clicks: 640,  conversions: 16, commission: 88.00,  streaming: 160,  status: "active",  ctr: 2.5 },
  { id: 5, title: "Epidemic Sound",    category: "Audio",     clicks: 310,  conversions: 9,  commission: 45.00,  streaming: 90,   status: "paused",  ctr: 2.9 },
  { id: 6, title: "NordVPN Creator",   category: "Tech",      clicks: 760,  conversions: 28, commission: 168.00, streaming: 280,  status: "active",  ctr: 3.7 },
  { id: 7, title: "ASUS Monitor Link", category: "Tech",      clicks: 420,  conversions: 11, commission: 77.00,  streaming: 110,  status: "active",  ctr: 2.6 },
  { id: 8, title: "HyperX Headset",    category: "Gaming",    clicks: 530,  conversions: 14, commission: 56.00,  streaming: 140,  status: "paused",  ctr: 2.6 },
];

const CATEGORY_COLORS = {
  Tech:      "bg-primary/10 text-primary border-primary/20",
  Streaming: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Gaming:    "bg-destructive/10 text-destructive border-destructive/20",
  Audio:     "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Lifestyle: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

export default function AffiliateLinkList() {
  const [tab, setTab]       = useState("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(null);
  const [statuses, setStatuses] = useState(
    Object.fromEntries(ALL_LINKS.map(l => [l.id, l.status]))
  );

  const filtered = ALL_LINKS
    .filter(l => tab === "all" ? true : tab === "active" ? statuses[l.id] === "active" : statuses[l.id] === "paused")
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id) => setStatuses(prev => ({ ...prev, [id]: prev[id] === "active" ? "paused" : "active" }));

  const copy = (id) => { setCopied(id); setTimeout(() => setCopied(null), 1500); };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Affiliate Links</h1>
          <p className="text-muted-foreground mt-1">Manage your entire affiliate link catalog.</p>
        </div>
        <Link to="/affiliates/add">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Link</Button>
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Links",    value: ALL_LINKS.length, icon: Tag,          color: "text-primary" },
          { label: "Active",         value: ALL_LINKS.filter(l => l.status === "active").length, icon: TrendingUp, color: "text-accent" },
          { label: "Total Clicks",   value: ALL_LINKS.reduce((s, l) => s + l.clicks, 0).toLocaleString(), icon: MousePointer, color: "text-chart-3" },
          { label: "$STREAMING Earned", value: `${ALL_LINKS.reduce((s, l) => s + l.streaming, 0).toLocaleString()} $S`, icon: Zap, color: "text-chart-4" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-base font-display font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search links..." className="pl-9 bg-secondary border-border" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All ({ALL_LINKS.length})</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((link) => (
          <div key={link.id} className={`bg-card border rounded-2xl p-4 transition-all hover:border-primary/20 ${statuses[link.id] === "paused" ? "border-border opacity-70" : "border-border"}`}>
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{link.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs border ${CATEGORY_COLORS[link.category] || "bg-secondary text-muted-foreground border-border"}`}>{link.category}</Badge>
                  <Badge className={`text-xs border ${statuses[link.id] === "active" ? "bg-accent/10 text-accent border-accent/20" : "bg-muted text-muted-foreground border-border"}`}>
                    {statuses[link.id]}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => copy(link.id)}>
                  {copied === link.id ? <span className="text-accent text-xs font-bold">✓</span> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground"><Edit3 className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground"><ExternalLink className="w-3.5 h-3.5" /></Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-secondary/50 rounded-xl p-2 text-center">
                <p className="text-xs text-muted-foreground">Clicks</p>
                <p className="text-sm font-bold text-foreground">{link.clicks.toLocaleString()}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-2 text-center">
                <p className="text-xs text-muted-foreground">Conv.</p>
                <p className="text-sm font-bold text-foreground">{link.conversions}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-2 text-center">
                <p className="text-xs text-muted-foreground">CTR</p>
                <p className="text-sm font-bold text-foreground">{link.ctr}%</p>
              </div>
            </div>

            {/* Revenue */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border mb-3">
              <span className="text-xs text-muted-foreground">Earned</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-foreground">${link.commission.toFixed(2)}</span>
                <span className="flex items-center gap-1 text-xs text-accent font-medium"><Zap className="w-3 h-3" />{link.streaming} $S</span>
              </div>
            </div>

            {/* Toggle */}
            <Button onClick={() => toggle(link.id)} variant="outline"
              className={`w-full h-8 text-xs gap-1.5 border-border ${statuses[link.id] === "active" ? "text-muted-foreground" : "text-accent border-accent/30"}`}>
              {statuses[link.id] === "active"
                ? <><Pause className="w-3 h-3" /> Pause Link</>
                : <><Play className="w-3 h-3" /> Resume Link</>
              }
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {ALL_LINKS.length} links</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled className="border-border">Previous</Button>
          <Button size="sm" variant="outline" className="border-border">Next</Button>
        </div>
      </div>
    </div>
  );
}