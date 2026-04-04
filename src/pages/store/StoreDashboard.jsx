import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, Package, DollarSign, TrendingUp, Plus, Zap,
  Eye, BarChart2, ArrowUpRight, Star
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const SALES_DATA = [
  { day: "Mar 28", usd: 120, streaming: 45 },
  { day: "Mar 29", usd: 95, streaming: 60 },
  { day: "Mar 30", usd: 210, streaming: 80 },
  { day: "Mar 31", usd: 175, streaming: 55 },
  { day: "Apr 1",  usd: 290, streaming: 110 },
  { day: "Apr 2",  usd: 240, streaming: 90 },
  { day: "Apr 3",  usd: 320, streaming: 140 },
];

const RECENT_ORDERS = [
  { id: "#ORD-4821", product: "Preset Pack v2",       buyer: "@viewer123",   amount: 24.99, method: "usd",       date: "Apr 4" },
  { id: "#ORD-4820", product: "Audio Samples Pack",   buyer: "@music_fan",   amount: 80,    method: "streaming", date: "Apr 4" },
  { id: "#ORD-4819", product: "Editing Course",       buyer: "@newcreator",  amount: 49.99, method: "usd",       date: "Apr 3" },
  { id: "#ORD-4818", product: "Template Bundle",      buyer: "@designpro",   amount: 120,   method: "streaming", date: "Apr 3" },
  { id: "#ORD-4817", product: "Lightroom Presets",    buyer: "@photog_99",   amount: 19.99, method: "usd",       date: "Apr 2" },
  { id: "#ORD-4816", product: "Preset Pack v2",       buyer: "@content_x",   amount: 24.99, method: "usd",       date: "Apr 2" },
];

const STATS = [
  { label: "Total Sales",      value: "$1,450",  sub: "+18% this week", icon: DollarSign, color: "text-primary",  bg: "bg-primary/10" },
  { label: "Total Orders",     value: "63",      sub: "+9 today",       icon: ShoppingBag, color: "text-accent",  bg: "bg-accent/10" },
  { label: "$STREAMING Sales", value: "525 $S",  sub: "8 token orders", icon: Zap,         color: "text-chart-4", bg: "bg-chart-4/10" },
  { label: "Top Product",      value: "Presets", sub: "18 sales",       icon: Star,        color: "text-chart-3", bg: "bg-chart-3/10" },
];

const QUICK_ACTIONS = [
  { label: "Add Product",   icon: Plus,      path: "/store/add",      primary: true },
  { label: "View Products", icon: Package,   path: "/store/products", primary: false },
  { label: "Analytics",     icon: BarChart2, path: "/video-analytics",primary: false },
];

const TOOLTIP_STYLE = { background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)" };

export default function StoreDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Creator Store</h1>
          <p className="text-muted-foreground mt-1">Manage products and track sales via CreatorVault.</p>
        </div>
        <div className="flex gap-2">
          {QUICK_ACTIONS.map(({ label, icon: Icon, path, primary }) => (
            <Link key={label} to={path}>
              <Button className={`gap-2 ${primary ? "bg-primary hover:bg-primary/90" : "border-border"}`} variant={primary ? "default" : "outline"}>
                <Icon className="w-4 h-4" /> {label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            <p className="text-xs text-accent mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{sub}</p>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Sales — Last 7 Days</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> USD</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> $STREAMING</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={SALES_DATA}>
            <defs>
              <linearGradient id="gUsd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(262, 83%, 62%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(262, 83%, 62%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gStr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(165, 82%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(165, 82%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,18%,18%)" />
            <XAxis dataKey="day" stroke="hsl(220,10%,50%)" fontSize={11} />
            <YAxis stroke="hsl(220,10%,50%)" fontSize={11} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="usd"       name="USD"        stroke="hsl(262,83%,62%)" fill="url(#gUsd)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="streaming" name="$STREAMING" stroke="hsl(165,82%,51%)" fill="url(#gStr)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Recent Orders</h3>
          </div>
          <Button variant="outline" size="sm" className="border-border text-xs gap-1.5">
            <Eye className="w-3 h-3" /> View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left pb-3 font-medium">Order</th>
                <th className="text-left pb-3 font-medium">Product</th>
                <th className="text-left pb-3 font-medium">Buyer</th>
                <th className="text-left pb-3 font-medium">Method</th>
                <th className="text-right pb-3 font-medium">Amount</th>
                <th className="text-right pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                  <td className="py-3 font-medium text-foreground">{o.product}</td>
                  <td className="py-3 text-muted-foreground">{o.buyer}</td>
                  <td className="py-3">
                    {o.method === "streaming" ? (
                      <Badge className="bg-accent/10 text-accent border-accent/20 gap-1 text-xs"><Zap className="w-2.5 h-2.5" />$STREAMING</Badge>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">USD</Badge>
                    )}
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {o.method === "streaming" ? `${o.amount} $S` : `$${o.amount.toFixed(2)}`}
                  </td>
                  <td className="py-3 text-right text-muted-foreground text-xs">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}