import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Upload, Zap, Mic2, CheckCircle2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

async function callAudioUpload(body) {
  const res = await fetch("https://api.tridentsystem.live/audio/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json().catch(() => ({}));
}

export default function UploadAudio() {
  const [audioFile, setAudioFile] = useState(null);
  const [title, setTitle] = useState("");
  const [series, setSeries] = useState("");
  const [description, setDescription] = useState("");
  const [monetize, setMonetize] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePublish = async () => {
    if (!title.trim()) { toast.error("Please enter an episode title."); return; }
    setLoading(true);
    try {
      await callAudioUpload({
        title,
        series,
        description,
        monetize,
        filename: audioFile?.name || null,
      });
      toast.success("Episode published successfully!");
      setTitle(""); setSeries(""); setDescription(""); setAudioFile(null); setMonetize(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Upload Audio</h1>
          <p className="text-muted-foreground mt-1">Upload a new podcast episode.</p>
        </div>
        <Badge className="bg-accent/10 text-accent border-accent/20 gap-1.5">
          <Zap className="w-3 h-3" /> $STREAMING Ready
        </Badge>
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        {/* Audio file drop zone */}
        <div>
          <Label className="mb-2 block">Audio File</Label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setAudioFile(f); }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
              ${dragging ? "border-primary bg-primary/10" : audioFile ? "border-accent/50 bg-accent/5" : "border-border bg-secondary hover:border-primary/40"}`}
          >
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files[0])} />
            {audioFile ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-accent mb-2" />
                <p className="text-sm font-medium text-foreground truncate max-w-[75%]">{audioFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                <button onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Mic2 className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Drag & drop or click</p>
                <p className="text-xs text-muted-foreground mt-1">MP3, WAV, AAC — Max 500MB</p>
              </>
            )}
          </div>
        </div>

        <div><Label className="mb-1.5 block">Episode Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Episode title" className="bg-secondary border-border" /></div>
        <div><Label className="mb-1.5 block">Series</Label><Input value={series} onChange={(e) => setSeries(e.target.value)} placeholder="Series name (optional)" className="bg-secondary border-border" /></div>
        <div><Label className="mb-1.5 block">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Episode description..." className="bg-secondary border-border h-24 resize-none" /></div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Enable Monetization</p>
                <p className="text-xs text-muted-foreground">Allow $STREAMING boosts</p>
              </div>
            </div>
            <Switch checked={monetize} onCheckedChange={setMonetize} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-border" disabled={loading}>Save Draft</Button>
          <Button onClick={handlePublish} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}