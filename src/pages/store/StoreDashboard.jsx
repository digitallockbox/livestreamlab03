import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, DollarSign, TrendingUp, Zap, Plus, Package,
  Eye, ArrowRight, CheckCircle2, Clock, BarChart2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

const CHART_STYLE = {
  grid: "hsl(230, 18%, 18%)",
  axis: "hsl(220, 10%, 50%)",
  tooltip: { background: "hsl(230, 22%, 10%)", border: "1px solid hsl(230, 18%, 18%)", borderRadius: "12px", color: "hsl(220, 20%, 95%)" },
};

const SALES_DATA = [
  { day: "Mar 29", usd: 120, streaming: 80 },
  { day: "Mar 30", usd: 190, streaming: 140 },
  { day: "Mar 31", usd: 95, streaming: 60 },
  { day: "Apr 1", usd: 280, streaming: 200 },
  { day: "Apr 2", usd: 175, streaming: 130 },
  { day: "Apr 3", usd: 310, streaming: 240 },
  { day: "Apr 4", usd: 220, streaming: 180 },
];

const TOP_PRODUCTS = [
  { name: "Preset Pack v2", sales: 18, revenue: 449.82, streaming: true },
  { name: "Editing Course", sales: 8, revenue: 399.92, streaming: false },
  { name: "Audio Samples Pack", sales: 12, revenue: 179.88, streaming: true },
  { name: "LUT Bundle", sales: 6, revenue: 149.94, streaming: true },
];

const RECENT_ORDERS = [
  { id: "#ORD-1041", product: "Preset Pack v2", buyer: "@viewer123", amount: 24.99, method: "usd", date: "Apr 4, 10:22am", status: "completed" },
  { id: "#ORD-1040", product: "Audio Samples Pack", buyer: "@music_fan", amount: 14.99, method: "streaming", date: "Apr 3, 6:14pm", status: "completed" },
  { id: "#ORD-1039", product: "Editing Course", buyer: "@newcreator", amount: 49.99, method: "usd", date: "Apr 3, 2:08pm", status: "completed" },
  { id: "#ORD-1038", product: "LUT Bundle", buyer: "@filmmaker99", amount: 19.99, method: "streaming", date: "Apr 2, 9:55am", status: "completed" },
  { id: "#ORD-1037", product: "Preset Pack v2", buyer: "@colorist_x", amount: 24.99, method: "usd", date: "Apr 1, 4:33pm", status: "completed" },
];

const STATS = [
  { label: "Total Sales", value: "$1,389", sub: "+23% this week", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  { label: "Total Orders", value: "47", sub: "5 today", icon: ShoppingBag, color: "text-accent", bg: "bg-accent/10" },
  { label: "$STREAMING Sales", value: "2,840 $S", sub: "+41% this week", icon: Zap, color: "text-chart-4", bg: "bg-chart-4/10" },
  { label: "Active Products", value: "8", sub: "2 drafts", icon: Package, color: "text-chart-3", bg: "bg-chart-3/10" },
];

const PERIODS = ["7D", "30D", "All"];

export default function StoreDashboard() {
  const [period, setPeriod] = useState("7D");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Store Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor sales, orders, and $STREAMING commerce.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/store/products">
            <Button variant="outline" className="border-border gap-2"><Eye className="w-4 h-4" /> View Products</Button>
          </Link>
          <Link to="/store/add">
            <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
          </Link>
        </div>
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
            <p className="text-xs text-accent mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Sales Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Revenue by Day</h3>
            </div>
            <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${period === p ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SALES_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
              <XAxis dataKey="day" stroke={CHART_STYLE.axis} fontSize={11} />
              <YAxis stroke={CHART_STYLE.axis} fontSize={11} />
              <Tooltip contentStyle={CHART_STYLE.tooltip} />
              <Bar dataKey="usd" name="USD Sales" fill="hsl(262, 83%, 62%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="streaming" name="$STREAMING" fill="hsl(165, 82%, 51%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded bg-primary inline-block" /> USD Sales</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded bg-accent inline-block" /> $STREAMING</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-chart-3" />
            <h3 className="font-display font-semibold text-foreground">Top Products</h3>
          </div>
          <div className="space-y-3">
            {TOP_PRODUCTS.map(({ name, sales, revenue, streaming }, i) => (
              <div key={name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-primary/20 text-primary" : i === 1 ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">{sales} sales · ${revenue}</p>
                </div>
                {streaming && <Zap className="w-3.5 h-3.5 text-accent shrink-0" />}
              </div>
            ))}
          </div>
          <Link to="/store/products">
            <Button variant="outline" className="w-full mt-4 border-border gap-2 text-xs">
              View All Products <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Recent Orders</h3>
          </div>
          <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">{RECENT_ORDERS.length} orders</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-3 pr-4 font-medium">Order ID</th>
                <th className="pb-3 pr-4 font-medium">Product</th>
                <th className="pb-3 pr-4 font-medium">Buyer</th>
                <th className="pb-3 pr-4 font-medium">Method</th>
                <th className="pb-3 pr-4 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 pr-4 text-xs font-mono text-muted-foreground">{order.id}</td>
                  <td className="py-3 pr-4 text-sm text-foreground">{order.product}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{order.buyer}</td>
                  <td className="py-3 pr-4">
                    {order.method === "streaming"
                      ? <Badge className="bg-accent/10 text-accent border-accent/20 gap-1 text-xs"><Zap className="w-2.5 h-2.5" />$STREAMING</Badge>
                      : <Badge className="bg-secondary text-muted-foreground border-border text-xs">USD</Badge>
                    }
                  </td>
                  <td className="py-3 pr-4 text-sm font-medium text-foreground">${order.amount.toFixed(2)}</td>
                  <td className="py-3 text-xs text-muted-foreground">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Add New Product", desc: "List a digital or physical product", icon: Plus, to: "/store/add", primary: true },
          { label: "View All Products", desc: "Manage your product catalog", icon: Package, to: "/store/products", primary: false },
          { label: "Stream Analytics", desc: "Revenue & performance deep dive", icon: BarChart2, to: "/analytics", primary: false },
        ].map(({ label, desc, icon: Icon, to, primary }) => (
          <Link key={label} to={to}>
            <div className={`p-4 rounded-2xl border cursor-pointer transition-all hover:border-primary/30 ${primary ? "bg-primary/10 border-primary/20" : "bg-card border-border"}`}>
              <Icon className={`w-5 h-5 mb-2 ${primary ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`text-sm font-medium ${primary ? "text-primary" : "text-foreground"}`}>{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}