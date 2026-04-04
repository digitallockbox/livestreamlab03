import React, { useState } from "react";
import { motion } from "framer-motion";
import { Video, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import VODUploadPipeline from "@/components/videos/VODUploadPipeline";
import VideoMetadataEditor from "@/components/videos/VideoMetadataEditor";
import VODMonetization from "@/components/videos/VODMonetization";
import VideoChapters from "@/components/videos/VideoChapters";

export default function VideoManager() {
  const [activeTab, setActiveTab] = useState("upload");
  const tabs = [
    { id: "upload", label: "Upload & Pipeline", icon: Video },
    { id: "metadata", label: "Metadata" },
    { id: "monetization", label: "Monetization" },
    { id: "chapters", label: "Chapters" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">VOD Archive</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Video Manager</h1>
        <p className="text-muted-foreground mt-1">The Video Engine — Upload, manage, and monetize your content library.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-secondary rounded-xl p-1 mb-8 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
        {activeTab === "upload" && <VODUploadPipeline />}
        {activeTab === "metadata" && <VideoMetadataEditor />}
        {activeTab === "monetization" && <VODMonetization />}
        {activeTab === "chapters" && <VideoChapters />}
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}