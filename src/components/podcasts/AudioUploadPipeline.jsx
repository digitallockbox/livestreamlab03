import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, Loader2, Mic2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AudioUploadPipeline() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const stages = [
    { step: 1, label: "Upload", desc: "Audio file ingestion", status: "complete" },
    { step: 2, label: "Validation", desc: "Aegis audio compliance", status: "complete" },
    { step: 3, label: "Encoding", desc: "Multi-format transcoding", status: "active" },
    { step: 4, label: "Metadata", desc: "ID3 tagging & artwork", status: "pending" },
    { step: 5, label: "Distribution", desc: "Podcast feed syndication", status: "pending" },
  ];

  const getStatusIcon = (status) => {
    if (status === "complete") return <CheckCircle2 className="w-5 h-5 text-accent" />;
    if (status === "active") return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    return <div className="w-5 h-5 rounded-full border-2 border-border" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Mic2 className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Audio Upload Pipeline</h3>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-semibold text-foreground">{uploadProgress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${uploadProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-3">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              stage.status === "complete"
                ? "bg-accent/5 border-accent/20"
                : stage.status === "active"
                ? "bg-primary/5 border-primary/20"
                : "bg-secondary border-border"
            }`}
          >
            {getStatusIcon(stage.status)}
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{stage.step}. {stage.label}</p>
              <p className="text-xs text-muted-foreground">{stage.desc}</p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                stage.status === "complete"
                  ? "bg-accent/10 text-accent border-accent/20"
                  : stage.status === "active"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
            >
              {stage.status === "complete" && "Complete"}
              {stage.status === "active" && "Processing"}
              {stage.status === "pending" && "Queued"}
            </Badge>
          </motion.div>
        ))}
      </div>

      {/* Encoding Outputs */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Encoding Formats</p>
        <div className="grid grid-cols-3 gap-3">
          {["MP3 320k", "AAC 256k", "FLAC", "OGG 192k", "M4A", "WAV"].map(fmt => (
            <div key={fmt} className="bg-secondary rounded-lg px-3 py-2 text-center">
              <p className="text-xs font-mono font-semibold text-foreground">{fmt}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Lossless</p>
            </div>
          ))}
        </div>
      </div>

      {/* Podcast Feeds */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Syndication Targets</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["Apple Podcasts", "Spotify", "Google Podcasts", "Amazon Music", "Anchor", "RSS Feed"].map(platform => (
            <div key={platform} className="bg-secondary rounded-lg px-3 py-2 text-center">
              <p className="text-xs font-semibold text-foreground">{platform}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}