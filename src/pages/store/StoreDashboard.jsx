import React from "react";
import { ShoppingBag, Package, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const recentOrders = [
  { id: 1, product: "Preset Pack v2", buyer: "@viewer123", amount: 24.99, date: "2026-04-04" },
  { id: 2, product: "Audio Samples", buyer: "@music_fan", amount: 14.99, date: "2026-04-03" },
  { id: 3, product: "Editing Course", buyer: "@newcreator", amount: 49.99, date: "2026-04-02" },
];

export default function StoreDashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Creator Store</h1>
          <p className="text-muted-foreground mt-1">Manage your products and track sales.</p>
        </div>
        <Link to="/store/add-product">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Sales" value="$892.00" icon={DollarSign} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatCard title="Orders" value="47" icon={ShoppingBag} iconColor="text-accent" iconBg="bg-accent/10" />
        <StatCard title="Products" value="8" icon={Package} iconColor="text-chart-4" iconBg="bg-chart-4/10" />
        <StatCard title="Growth" value="+23%" icon={TrendingUp} iconColor="text-chart-3" iconBg="bg-chart-3/10" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{order.product}</p>
                <p className="text-xs text-muted-foreground">{order.buyer}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">${order.amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}