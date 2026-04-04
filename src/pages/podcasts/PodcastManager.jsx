import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import AudioUploadPipeline from "@/components/podcasts/AudioUploadPipeline";
import PodcastMetadataEditor from "@/components/podcasts/PodcastMetadataEditor";
import PodcastMonetization from "@/components/podcasts/PodcastMonetization";
import PodcastDistribution from "@/components/podcasts/PodcastDistribution";

export default function PodcastManager() {
  const [activeTab, setActiveTab] = useState("upload");
  const tabs = [
    { id: "upload", label: "Upload & Pipeline" },
    { id: "metadata", label: "Episode Info" },
    { id: "distribution", label: "Distribution" },
    { id: "monetization", label: "Monetization" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Audio & Podcasts</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Podcast Manager</h1>
        <p className="text-muted-foreground mt-1">The Audio Engine — Upload, distribute, and monetize your podcast episodes.</p>
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
        {activeTab === "upload" && <AudioUploadPipeline />}
        {activeTab === "metadata" && <PodcastMetadataEditor />}
        {activeTab === "distribution" && <PodcastDistribution />}
        {activeTab === "monetization" && <PodcastMonetization />}
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Save className="w-4 h-4" /> Publish Episode
        </Button>
      </div>
    </div>
  );
}