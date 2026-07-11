import React, { useEffect, useState } from "react";
import { Upload, HardDrive, CheckCircle2, FileVideo, FileAudio } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { base44Api, videoApi, audioApi } from "@/lib/tridentApi";
import { Card, Spinner } from "@/components/creator/os";

export default function StorageModule() {
  const { walletAddress } = useIdentity();
  const [storage, setStorage] = useState(null);
  const [health, setHealth] = useState(null);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const [sRes, hRes, vRes, aRes] = await Promise.allSettled([
        base44Api.storageInfo(),
        base44Api.storageCheck(),
        videoApi.list({ creatorWallet: walletAddress }),
        audioApi.list({ creatorWallet: walletAddress }),
      ]);
      if (sRes.status === "fulfilled") setStorage(sRes.value);
      if (hRes.status === "fulfilled") setHealth(hRes.value);
      if (vRes.status === "fulfilled") setVideos(vRes.value?.videos || []);
      if (aRes.status === "fulfilled") setAudios(aRes.value?.audios || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [walletAddress]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !walletAddress) return;
    setUploading(true);
    try {
      await base44Api.uploadFile({ creatorWallet: walletAddress, fileName: file.name, fileSize: file.size });
      load();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) return <Spinner />;

  const used = storage?.usedGB || 0;
  const total = storage?.totalGB || 10;
  const pct = Math.min((used / total) * 100, 100);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Storage</h3>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{used.toFixed(2)} / {total} GB</span>
            <span className="text-primary font-medium">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload File"}
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </Card>
      {health && (
        <Card>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${health.healthy ? "text-accent" : "text-destructive"}`} />
            <span className="text-sm">{health.healthy ? "Storage system operational" : "Storage issues detected"}</span>
          </div>
        </Card>
      )}
      <Card>
        <h3 className="font-display font-bold text-lg mb-4">Files</h3>
        <div className="space-y-2">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <FileVideo className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm truncate">{v.title}</span>
            </div>
          ))}
          {audios.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <FileAudio className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm truncate">{a.title}</span>
            </div>
          ))}
          {videos.length === 0 && audios.length === 0 && (
            <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}