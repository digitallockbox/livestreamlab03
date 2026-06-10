import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { contentApi } from "@/lib/creatorApi";
import VODUploadPipeline from "@/components/videos/VODUploadPipeline";
import VideoMetadataEditor from "@/components/videos/VideoMetadataEditor";
import VODMonetization from "@/components/videos/VODMonetization";
import VideoChapters from "@/components/videos/VideoChapters";

export default function VideoManager() {
  const [activeTab, setActiveTab] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("id");
  const navigate = useNavigate();

  const tabs = [
    { id: "upload", label: "Upload & Pipeline", icon: Video },
    { id: "metadata", label: "Metadata" },
    { id: "monetization", label: "Monetization" },
    { id: "chapters", label: "Chapters" },
  ];

  useEffect(() => {
    if (videoId) {
      loadVideo(videoId);
    }
  }, [videoId]);

  const loadVideo = async (id) => {
    try {
      setLoading(true);
      const data = await contentApi.getVideo(id);
      setVideoData(data);
    } catch (err) {
      toast.error(`Failed to load video: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (videoId && videoData) {
        await contentApi.updateVideo({ id: videoId, ...videoData });
        toast.success("Video updated successfully!");
      } else {
        toast.info("No video to update");
      }
      navigate('/videos');
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
      {loading && !videoData ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          {activeTab === "upload" && <VODUploadPipeline />}
          {activeTab === "metadata" && <VideoMetadataEditor video={videoData} />}
          {activeTab === "monetization" && <VODMonetization video={videoData} />}
          {activeTab === "chapters" && <VideoChapters video={videoData} />}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="outline" onClick={() => navigate('/videos')}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90 gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}