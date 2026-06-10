import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Image, Zap, DollarSign, Users, Lock, Globe,
  CheckCircle2, FileVideo, X, ChevronDown, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const CATEGORIES = ["Gaming", "Music", "Education", "Tech", "Fitness", "Lifestyle", "Art & Creative", "Talk / Commentary", "Other"];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", IconComp: Globe, desc: "Anyone can watch" },
  { value: "subscribers", label: "Subscribers Only", IconComp: Users, desc: "Your subscribers" },
  { value: "premium", label: "Premium", IconComp: Lock, desc: "Paid unlock required" },
];

const MONETIZATION = [
  { key: "ppv", icon: DollarSign, label: "Pay-Per-View", desc: "Charge a one-time USD fee to watch", color: "text-chart-3", bg: "bg-chart-3/10" },
  { key: "subscription", icon: Users, label: "Subscription", desc: "Available to active subscribers", color: "text-primary", bg: "bg-primary/10" },
  { key: "streaming", icon: Zap, label: "$STREAMING Unlock", desc: "Unlock with $STREAMING tokens", color: "text-accent", bg: "bg-accent/10" },
];

export default function UploadVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [monetization, setMonetization] = useState({ ppv: false, subscription: false, streaming: false });
  const [ppvPrice, setPpvPrice] = useState("");
  const [streamingPrice, setStreamingPrice] = useState("");
  const [videoDragging, setVideoDragging] = useState(false);
  const [thumbDragging, setThumbDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const xhrRef = useRef(null);

  const toggleMono = (key) => setMonetization(prev => ({ ...prev, [key]: !prev[key] }));

  const handleUploadAll = () => {
    if (!title.trim()) { toast.error("Please enter a title."); return; }
    setUploading(true);
    setUploadProgress(0);

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("category", category);
    form.append("visibility", visibility);
    form.append("monetization", JSON.stringify(monetization));
    if (ppvPrice) form.append("ppv_price", ppvPrice);
    if (streamingPrice) form.append("streaming_price", streamingPrice);
    if (videoFile) form.append("file", videoFile);
    if (thumbFile) form.append("thumbnail", thumbFile);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", "https://api.tridentsystem.live/video/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success("Video uploaded successfully!");
        setTitle(""); setDescription(""); setCategory(""); setVideoFile(null); setThumbFile(null);
        setMonetization({ ppv: false, subscription: false, streaming: false });
        setUploadProgress(0);
      } else {
        toast.error(`Upload failed (${xhr.status})`);
      }
    };
    xhr.onerror = () => { setUploading(false); toast.error("Network error during upload."); };
    xhr.send(form);
  };

  const cancelUpload = () => { xhrRef.current?.abort(); setUploading(false); setUploadProgress(0); };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Upload Video</h1>
          <p className="text-muted-foreground mt-1">Upload and monetize your video content via CreatorVault.</p>
        </div>
        <Badge className="bg-accent/10 text-accent border-accent/20 gap-1.5">
          <Zap className="w-3 h-3" /> $STREAMING Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — File Uploads */}
        <div className="lg:col-span-2 space-y-5">
          {/* Video Upload */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Video File</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setVideoDragging(true); }}
              onDragLeave={() => setVideoDragging(false)}
              onDrop={(e) => { e.preventDefault(); setVideoDragging(false); const f = e.dataTransfer.files[0]; if (f) setVideoFile(f); }}
              onClick={() => document.getElementById("video-input").click()}
              className={`relative h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                ${videoDragging ? "border-primary bg-primary/10" : videoFile ? "border-accent/50 bg-accent/5" : "border-border bg-secondary hover:border-primary/40"}`}
            >
              <input id="video-input" type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files[0])} />
              {videoFile ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-accent mb-2" />
                  <p className="text-sm font-medium text-foreground truncate max-w-[80%]">{videoFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  <button onClick={(e) => { e.stopPropagation(); setVideoFile(null); }} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <FileVideo className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Drag & drop or click</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM · Max 10GB</p>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Thumbnail</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setThumbDragging(true); }}
              onDragLeave={() => setThumbDragging(false)}
              onDrop={(e) => { e.preventDefault(); setThumbDragging(false); const f = e.dataTransfer.files[0]; if (f) setThumbFile(f); }}
              onClick={() => document.getElementById("thumb-input").click()}
              className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                ${thumbDragging ? "border-primary bg-primary/10" : thumbFile ? "border-accent/50 bg-accent/5" : "border-border bg-secondary hover:border-primary/40"}`}
            >
              <input id="thumb-input" type="file" accept="image/*" className="hidden" onChange={(e) => setThumbFile(e.target.files[0])} />
              {thumbFile ? (
                <><CheckCircle2 className="w-6 h-6 text-accent mb-1" /><p className="text-xs text-foreground truncate max-w-[80%]">{thumbFile.name}</p></>
              ) : (
                <><Image className="w-6 h-6 text-muted-foreground mb-1" /><p className="text-xs text-muted-foreground">Upload thumbnail (1280×720)</p></>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Visibility</Label>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY_OPTIONS.map(({ value, label, IconComp, desc }) => (
                <button key={value} onClick={() => setVisibility(value)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1
                    ${visibility === value ? "border-primary/50 bg-primary/10" : "border-border bg-secondary hover:border-primary/30"}`}>
                  <IconComp className={`w-4 h-4 ${visibility === value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium leading-tight ${visibility === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Metadata + Monetization */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a compelling title..." className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your video, add timestamps, links..." className="bg-secondary border-border h-28 resize-none" />
            </div>
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-secondary text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Monetization */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="font-display font-semibold text-foreground">Monetization</h3>
            </div>
            {MONETIZATION.map(({ key, icon: Icon, label, desc, color, bg }) => (
              <div key={key}>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <Switch checked={monetization[key]} onCheckedChange={() => toggleMono(key)} />
                </div>
                {key === "ppv" && monetization.ppv && (
                  <div className="mt-2 pl-2 flex items-center gap-3">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Price (USD)</Label>
                    <Input type="number" value={ppvPrice} onChange={(e) => setPpvPrice(e.target.value)} placeholder="4.99" className="bg-secondary border-border h-8 text-sm w-28" />
                  </div>
                )}
                {key === "streaming" && monetization.streaming && (
                  <div className="mt-2 pl-2 flex items-center gap-3">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">$STREAMING price</Label>
                    <Input type="number" value={streamingPrice} onChange={(e) => setStreamingPrice(e.target.value)} placeholder="50" className="bg-secondary border-border h-8 text-sm w-28" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Uploading… {uploadProgress}%</span>
                <button onClick={cancelUpload} className="text-destructive hover:underline">Cancel</button>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border" disabled={uploading}>Save as Draft</Button>
            <Button onClick={handleUploadAll} disabled={uploading} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? `Uploading ${uploadProgress}%` : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}