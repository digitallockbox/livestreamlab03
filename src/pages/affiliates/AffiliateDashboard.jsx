import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MousePointer, DollarSign, Zap, Plus, TrendingUp, Search,
  BarChart2, ExternalLink, Edit3, Copy, ArrowUpRight, ShoppingBag, Tag
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const CHART_STYLE = {
  tooltip: { background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)" },
};

const CLICK_DATA = [
  { day: "Mar 29", clicks: 180, conversions: 9 },
  { day: "Mar 30", clicks: 290, conversions: 14 },
  { day: "Mar 31", clicks: 210, conversions: 11 },
  { day: "Apr 1",  clicks: 420, conversions: 22 },
  { day: "Apr 2",  clicks: 380, conversions: 19 },
  { day: "Apr 3",  clicks: 510, conversions: 27 },
  { day: "Apr 4",  clicks: 340, conversions: 18 },
];

const LINKS = [
  { id: 1, title: "StreamDeck Pro",      category: "Tech",      url: "https://elgato.com/ref/sam", clicks: 1240, conversions: 38, ctr: 3.1, commission: 142.00, streaming: 380, status: "active" },
  { id: 2, title: "Elgato Gear Link",    category: "Streaming", url: "https://elgato.com/ref/sam", clicks: 890,  conversions: 21, ctr: 2.4, commission: 98.50,  streaming: 210, status: "active" },
  { id: 3, title: "SecretLab Chair",     category: "Gaming",    url: "https://secretlab.co/ref",   clicks: 2150, conversions: 54, ctr: 2.5, commission: 299.50, streaming: 540, status: "active" },
  { id: 4, title: "Rode Microphones",    category: "Audio",     url: "https://rode.com/ref/sam",   clicks: 640,  conversions: 16, ctr: 2.5, commission: 88.00,  streaming: 160, status: "active" },
  { id: 5, title: "Epidemic Sound",      category: "Audio",     url: "https://epidemicsound.com",  clicks: 310,  conversions: 9,  ctr: 2.9, commission: 45.00,  streaming: 90,  status: "paused" },
  { id: 6, title: "NordVPN Creator",     category: "Tech",      url: "https://nordvpn.com/ref",    clicks: 760,  conversions: 28, ctr: 3.7, commission: 168.00, streaming: 280, status: "active" },
];

const STATS = [
  { label: "Total Clicks",      value: "5,990",    sub: "+18% this week", icon: MousePointer, color: "text-primary",  bg: "bg-primary/10" },
  { label: "Commissions",       value: "$841.00",  sub: "+$142 today",    icon: DollarSign,  color: "text-accent",   bg: "bg-accent/10" },
  { label: "Conversions",       value: "166",      sub: "2.8% avg CTR",   icon: TrendingUp,  color: "text-chart-3",  bg: "bg-chart-3/10" },
  { label: "$STREAMING Bonus",  value: "1,660 $S", sub: "+280 this week", icon: Zap,         color: "text-chart-4",  bg: "bg-chart-4/10" },
];

const STATUS_STYLES = {
  active: "bg-accent/10 text-accent border-accent/20",
  paused: "bg-muted text-muted-foreground border-border",
};

const CATEGORY_COLORS = {
  Tech:      "bg-primary/10 text-primary border-primary/20",
  Streaming: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Gaming:    "bg-destructive/10 text-destructive border-destructive/20",
  Audio:     "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Lifestyle: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

export default function AffiliateDashboard() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(null);

  const filtered = LINKS.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Affiliate Marketplace</h1>
          <p className="text-muted-foreground mt-1">Track clicks, conversions, and $STREAMING bonuses.</p>
        </div>
        <Link to="/affiliates/add">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Link</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            <p className="text-xs text-accent mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Clicks & Conversions — Last 7 Days</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CLICK_DATA}>
            <defs>
              <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(262, 83%, 62%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(262, 83%, 62%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(165, 82%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(165, 82%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,18%,18%)" />
            <XAxis dataKey="day" stroke="hsl(220,10%,50%)" fontSize={11} />
            <YAxis stroke="hsl(220,10%,50%)" fontSize={11} />
            <Tooltip contentStyle={CHART_STYLE.tooltip} />
            <Area type="monotone" dataKey="clicks"      name="Clicks"      stroke="hsl(262,83%,62%)" fill="url(#gClicks)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="conversions" name="Conversions" stroke="hsl(165,82%,51%)" fill="url(#gConv)"   strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded bg-primary inline-block" /> Clicks</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded bg-accent inline-block" /> Conversions</span>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Affiliate Links</h3>
          </div>
          <div className="relative w-52">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search links..." className="pl-8 h-8 bg-secondary border-border text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium pr-4">Link</th>
                <th className="pb-3 font-medium pr-4">Category</th>
                <th className="pb-3 font-medium pr-4">Clicks</th>
                <th className="pb-3 font-medium pr-4">Conv.</th>
                <th className="pb-3 font-medium pr-4">CTR</th>
                <th className="pb-3 font-medium pr-4">Commission</th>
                <th className="pb-3 font-medium pr-4">$STREAMING</th>
                <th className="pb-3 font-medium pr-4">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => (
                <tr key={link.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-foreground">{link.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">{link.url}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge className={`text-xs border ${CATEGORY_COLORS[link.category] || "bg-secondary text-muted-foreground border-border"}`}>
                      {link.category}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-sm text-foreground">{link.clicks.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-sm text-foreground">{link.conversions}</td>
                  <td className="py-3 pr-4 text-sm text-foreground">{link.ctr}%</td>
                  <td className="py-3 pr-4 text-sm font-semibold text-foreground">${link.commission.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-accent flex items-center gap-1"><Zap className="w-3 h-3" />{link.streaming} $S</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge className={`text-xs border ${STATUS_STYLES[link.status]}`}>{link.status}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(link.id, link.url)}>
                        {copied === link.id ? <span className="text-accent text-xs">✓</span> : <Copy className="w-3 h-3" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}