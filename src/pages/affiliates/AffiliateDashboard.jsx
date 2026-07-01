import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MousePointerClick, TrendingUp, DollarSign, Zap, Plus, Search, ExternalLink,
  Copy, CheckCircle2, Loader2, Tag, Link2, ShoppingBag, Download,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import AffiliatePerformanceChart from "@/components/creator/affiliate/AffiliatePerformanceChart";
import AffiliateConversionTrend from "@/components/creator/affiliate/AffiliateConversionTrend";

const usd = (n) => `$${Number(n || 0).toFixed(2)}`;
const CATEGORY_COLORS = {
  Tech: "bg-primary/10 text-primary border-primary/20",
  Streaming: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Gaming: "bg-destructive/10 text-destructive border-destructive/20",
  Audio: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Lifestyle: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

// AffiliateDashboard — manage referral links with per-link click counts,
// conversion rates, and total commission earned. Bound to the AffiliateLink
// entity, filtered by the connected creator's wallet.
export default function AffiliateDashboard() {
  const { walletAddress } = useIdentity();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    let active = true;
    base44.entities.AffiliateLink.filter({ creator_wallet: walletAddress }, "-created_date", 200)
      .then((data) => { if (active) setLinks(data || []); })
      .catch(() => { if (active) setLinks([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [walletAddress]);

  const totals = useMemo(() => {
    const clicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
    const conversions = links.reduce((s, l) => s + (l.conversions || 0), 0);
    const commission = links.reduce((s, l) => s + (l.commission_earned || 0), 0);
    const streaming = links.reduce((s, l) => s + (l.streaming_bonus || 0), 0);
    return { clicks, conversions, commission, streaming, rate: clicks ? (conversions / clicks) * 100 : 0 };
  }, [links]);

  const filtered = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter((l) => (l.title || "").toLowerCase().includes(q) || (l.url || "").toLowerCase().includes(q));
  }, [links, search]);

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleExportCSV = () => {
    const headers = ["Title", "URL", "Category", "Clicks", "Conversions", "Conv. Rate (%)", "Commission (USD)", "$STREAMING Bonus"];
    const escape = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = links.map((l) => {
      const rate = l.clicks ? ((l.conversions || 0) / l.clicks) * 100 : 0;
      return [l.title, l.url, l.category, l.clicks || 0, l.conversions || 0, rate.toFixed(2), (l.commission_earned || 0).toFixed(2), l.streaming_bonus || 0].map(escape).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiliate-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpen = (link) => {
    // Track the click locally so dashboard stats stay fresh.
    base44.entities.AffiliateLink.update(link.id, { clicks: (link.clicks || 0) + 1 }).catch(() => {});
    base44.entities.AffiliateEvent.create({ link_id: link.id, link_title: link.title, event_type: "click", creator_wallet: walletAddress }).catch(() => {});
    setLinks((prev) => prev.map((l) => l.id === link.id ? { ...l, clicks: (l.clicks || 0) + 1 } : l));
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  if (!walletAddress) {
    return <div className="p-6 max-w-7xl mx-auto"><p className="text-sm text-muted-foreground">Connect your wallet to manage affiliate links.</p></div>;
  }

  const kpis = [
    { label: "Total Links", value: links.length, icon: Link2, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Clicks", value: totals.clicks.toLocaleString(), icon: MousePointerClick, color: "text-chart-4", bg: "bg-chart-4/10" },
    { label: "Conversions", value: totals.conversions.toLocaleString(), icon: ShoppingBag, color: "text-foreground", bg: "bg-secondary" },
    { label: "Conv. Rate", value: `${totals.rate.toFixed(1)}%`, icon: TrendingUp, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Commission Earned", value: usd(totals.commission), icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
    { label: "$STREAMING Bonus", value: `${totals.streaming} ◎`, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Affiliate Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track clicks, conversion rates, and commission earned per referral link.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleExportCSV} disabled={loading || links.length === 0} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link to="/affiliates/add" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Link
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}><Icon className={`w-4 h-4 ${color}`} /></div>
              <p className="text-xl font-display font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      <AffiliatePerformanceChart wallet={walletAddress} />
      <AffiliateConversionTrend wallet={walletAddress} links={links} />

      {/* Links table */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h3 className="font-display font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-accent" /> Referral Links</h3>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search links…" className="w-full rounded-md border border-input bg-secondary pl-9 pr-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">{links.length === 0 ? "No affiliate links yet." : "No links match your search."}</p>
            {links.length === 0 && (
              <Link to="/affiliates/add" className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary hover:underline">
                <Plus className="w-4 h-4" /> Add your first link
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-3 pr-4 font-medium">Link</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium text-right">Clicks</th>
                  <th className="pb-3 pr-4 font-medium text-right">Conv.</th>
                  <th className="pb-3 pr-4 font-medium text-right">Conv. Rate</th>
                  <th className="pb-3 pr-4 font-medium text-right">Commission</th>
                  <th className="pb-3 pr-4 font-medium text-right">$STREAMING</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link) => {
                  const rate = link.clicks ? ((link.conversions || 0) / link.clicks) * 100 : 0;
                  return (
                    <tr key={link.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4 max-w-[180px]">
                        <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[link.category] || "bg-secondary text-muted-foreground border-border"}`}>{link.category || "Other"}</span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-right">{(link.clicks || 0).toLocaleString()}</td>
                      <td className="py-3 pr-4 text-sm text-right">{link.conversions || 0}</td>
                      <td className="py-3 pr-4 text-sm text-right">{rate.toFixed(1)}%</td>
                      <td className="py-3 pr-4 text-sm font-semibold text-right text-accent">{usd(link.commission_earned)}</td>
                      <td className="py-3 pr-4 text-sm text-right text-primary inline-flex items-center gap-1 justify-end"><Zap className="w-3 h-3" /> {link.streaming_bonus || 0}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => handleCopy(link.id, link.url)} className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" title="Copy URL">
                            {copied === link.id ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleOpen(link)} className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" title="Open link">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}