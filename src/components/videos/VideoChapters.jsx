import React, { useState, useEffect } from "react";
import { Layers, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VideoChapters({ video }) {
  const [chapters, setChapters] = useState([]);
  const [videoDuration, setVideoDuration] = useState(3600);

  useEffect(() => {
    if (video) {
      setChapters(video.chapters || []);
      setVideoDuration(video.duration_seconds || 3600);
    }
  }, [video]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const addChapter = () => {
    setChapters([
      ...chapters,
      { id: Date.now(), title: "New Chapter", timestamp: "0:00" },
    ]);
  };

  const updateChapter = (id, field, value) => {
    setChapters(chapters.map(ch => (ch.id === id ? { ...ch, [field]: value } : ch)));
  };

  const deleteChapter = (id) => {
    setChapters(chapters.filter(ch => ch.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Chapter Markers</h3>
        </div>
        <Button size="sm" onClick={addChapter} className="bg-primary hover:bg-primary/90 gap-1.5">
          <Plus className="w-3 h-3" /> Add Chapter
        </Button>
      </div>

      <div className="space-y-2">
        {chapters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No chapters added yet</p>
        ) : (
          chapters.map(chapter => (
            <div key={chapter.id} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <Input
                type="text"
                value={chapter.title}
                onChange={(e) => updateChapter(chapter.id, "title", e.target.value)}
                placeholder="Chapter title"
                className="bg-card border-border text-sm flex-1"
              />
              <Input
                type="text"
                value={chapter.timestamp}
                onChange={(e) => updateChapter(chapter.id, "timestamp", e.target.value)}
                placeholder="0:00"
                className="bg-card border-border text-sm w-20 font-mono"
              />
              <button
                onClick={() => deleteChapter(chapter.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}