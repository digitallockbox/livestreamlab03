import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MousePointer, DollarSign, Zap, Plus, TrendingUp, Search,
  ExternalLink, Edit3, Copy, ArrowUpRight, Tag, Loader2
} from "lucide-react";
import { creatorAffiliateApi } from "@/lib/creatorApi";

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
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await creatorAffiliateApi.listLinks();
        setLinks(data);
      } catch (err) {
        console.error('Affiliate dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = links.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
  const totalCommissions = links.reduce((s, l) => s + (l.commission || 0), 0);
  const totalConversions = links.reduce((s, l) => s + (l.conversions || 0), 0);
  const totalStreaming = links.reduce((s, l) => s + (l.streaming || 0), 0);

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
          <h1 className="font-display text-3xl font-bold text-foreground">Affiliate Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track clicks, conversions, and $STREAMING bonuses.</p>
        </div>
        <Link to="/affiliates/add">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Link</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse"><div className="h-9 w-9 rounded-xl bg-muted mb-3"></div><div className="h-6 bg-muted rounded w-20 mb-2"></div><div className="h-4 bg-muted rounded w-16"></div></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Clicks",      value: totalClicks.toLocaleString(),    sub: "All time", icon: MousePointer, color: "text-primary",  bg: "bg-primary/10" },
            { label: "Commissions",       value: `$${totalCommissions.toFixed(2)}`,  sub: "Earned",    icon: DollarSign,  color: "text-accent",   bg: "bg-accent/10" },
            { label: "Conversions",       value: totalConversions.toString(),      sub: "Total",     icon: TrendingUp,  color: "text-chart-3",  bg: "bg-chart-3/10" },
            { label: "$STREAMING Bonus",  value: `${totalStreaming.toLocaleString()} $S`, sub: "Earned", icon: Zap,         color: "text-chart-4",  bg: "bg-chart-4/10" },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
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
      )}

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
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium pr-4">Link</th>
                  <th className="pb-3 font-medium pr-4">Category</th>
                  <th className="pb-3 font-medium pr-4">Clicks</th>
                  <th className="pb-3 font-medium pr-4">Conv.</th>
                  <th className="pb-3 font-medium pr-4">Commission</th>
                  <th className="pb-3 font-medium pr-4">$STREAMING</th>
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
                    <td className="py-3 pr-4 text-sm text-foreground">{link.clicks?.toLocaleString() || 0}</td>
                    <td className="py-3 pr-4 text-sm text-foreground">{link.conversions || 0}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-foreground">${link.commission?.toFixed(2) || "0"}</td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-accent flex items-center gap-1"><Zap className="w-3 h-3" />{link.streaming || 0} $S</span>
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
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">
            No affiliate links yet. <Link to="/affiliates/add" className="text-primary hover:underline">Add your first link</Link>
          </div>
        )}
      </div>
    </div>
  );
}