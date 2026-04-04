import React from "react";
import { Headphones, Users, DollarSign } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export default function PodcastAnalytics() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Podcast Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your podcast performance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Listens" value="8,420" icon={Headphones} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatCard title="Subscribers" value="1,240" icon={Users} iconColor="text-accent" iconBg="bg-accent/10" />
        <StatCard title="Revenue" value="$154.00" icon={DollarSign} iconColor="text-chart-3" iconBg="bg-chart-3/10" />
      </div>
    </div>
  );
}