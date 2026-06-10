import React, { useState, useEffect } from "react";
import { FileText, Tag, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VideoMetadataEditor({ video }) {
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    tags: [],
    category: "creative",
    chapters: [],
  });

  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (video) {
      setMetadata({
        title: video.title || "",
        description: video.description || "",
        tags: video.tags || [],
        category: video.category || "creative",
        chapters: video.chapters || [],
      });
    }
  }, [video]);

  const addTag = () => {
    if (newTag && !metadata.tags.includes(newTag)) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, newTag],
      });
      setNewTag("");
    }
  };

  const categories = ["gaming", "music", "education", "creative", "tech", "talk_show"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Video Metadata</h3>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Title</label>
        <Input
          value={metadata.title}
          onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
          placeholder="Enter video title"
          className="bg-secondary border-border"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Description</label>
        <textarea
          value={metadata.description}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          placeholder="Enter video description"
          rows="4"
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Category</label>
        <select
          value={metadata.category}
          onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Add a tag and press Enter"
            className="bg-secondary border-border text-sm"
          />
          <Button size="sm" onClick={addTag} className="bg-primary hover:bg-primary/90">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {metadata.tags.map(tag => (
            <div
              key={tag}
              className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-2"
            >
              #{tag}
              <button
                onClick={() =>
                  setMetadata({
                    ...metadata,
                    tags: metadata.tags.filter(t => t !== tag),
                  })
                }
                className="text-primary/60 hover:text-primary"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}