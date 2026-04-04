import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import AffiliateTracker from "@/components/affiliates/AffiliateTracker";
import CommissionStructure from "@/components/affiliates/CommissionStructure";
import PartnershipCampaigns from "@/components/affiliates/PartnershipCampaigns";
import MarketplaceIntegration from "@/components/affiliates/MarketplaceIntegration";

export default function AffiliateManager() {
  const [activeTab, setActiveTab] = useState("tracking");
  const tabs = [
    { id: "tracking", label: "Real-Time Tracking" },
    { id: "commissions", label: "Commission Rates" },
    { id: "campaigns", label: "Campaigns" },
    { id: "marketplace", label: "Marketplace" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Partnerships & Commerce</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Affiliate Manager</h1>
        <p className="text-muted-foreground mt-1">The Partnership Engine — Manage affiliates, commissions, campaigns, and marketplace integration.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-secondary rounded-xl p-1 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        {activeTab === "tracking" && <AffiliateTracker />}
        {activeTab === "commissions" && <CommissionStructure />}
        {activeTab === "campaigns" && <PartnershipCampaigns />}
        {activeTab === "marketplace" && <MarketplaceIntegration />}
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>
    </div>
  );
}