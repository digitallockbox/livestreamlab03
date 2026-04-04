import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, AlertCircle, Loader2, FileVideo } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VODUploadPipeline() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const stages = [
    { step: 1, label: "Upload", desc: "File chunking", status: "complete" },
    { step: 2, label: "Validation", desc: "Aegis security scan", status: "complete" },
    { step: 3, label: "Transcoding", desc: "Multi-bitrate generation", status: "active" },
    { step: 4, label: "Packaging", desc: "DRM & encryption", status: "pending" },
    { step: 5, label: "Publishing", desc: "CDN distribution", status: "pending" },
  ];

  const getStatusIcon = (status) => {
    if (status === "complete") return <CheckCircle2 className="w-5 h-5 text-accent" />;
    if (status === "active") return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    return <div className="w-5 h-5 rounded-full border-2 border-border" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileVideo className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">VOD Ingestion Pipeline</h3>
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

      {/* Transcoding Outputs */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Transcoding Outputs</p>
        <div className="grid grid-cols-3 gap-3">
          {["4K", "1080p", "720p", "480p", "360p", "160p"].map(res => (
            <div key={res} className="bg-secondary rounded-lg px-3 py-2 text-center">
              <p className="text-xs font-mono font-semibold text-foreground">{res}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">H.265</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}