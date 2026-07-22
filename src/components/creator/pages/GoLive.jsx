import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ImagePlus, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Input, useViewerWallet } from "@/components/creator/os";

// GoLive — broadcast control room. Now supports an optional cover photo that
// is uploaded via the UploadFile integration and attached to the stream as its
// thumbnail. The "Photo NFT" status badge reflects the queued/minted lifecycle;
// on-chain minting requires a backend mint function (not yet wired).
export default function GoLive() {
  const viewerWallet = useViewerWallet();
  const { signedInvoke } = useIdentity();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("gaming");
  const [stream, setStream] = useState(null);
  const [busy, setBusy] = useState(false);

  const [coverImage, setCoverImage] = useState(null); // { url }
  const [uploading, setUploading] = useState(false);
  const [nftStatus, setNftStatus] = useState("none"); // none | pending | minted | error
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNftStatus("pending");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCoverImage({ url: file_url });
    } catch {
      setNftStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const start = async () => {
    if (!viewerWallet || !title.trim()) return;
    setBusy(true);
    try {
      const res = await signedInvoke("web3Streams", {
        action: "start",
        creatorWallet: viewerWallet,
        title: title.trim(),
        category,
        thumbnail_url: coverImage?.url || undefined,
      });
      setStream(res);
      // Mint the cover as an off-chain NFT ledger entry attached to the stream.
      if (coverImage) {
        try {
          await signedInvoke("web3Nft", {
            action: "mint",
            creatorWallet: viewerWallet,
            streamId: res.id,
            imageUrl: coverImage.url,
            title: title.trim(),
          });
          setNftStatus("minted");
        } catch {
          setNftStatus("error");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Go Live" subtitle="Start a new stream session">
      <Card className="space-y-3 max-w-lg">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Stream title" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-input bg-muted px-3 py-2">
          <option value="gaming">Gaming</option>
          <option value="music">Music</option>
          <option value="talk_show">Talk Show</option>
          <option value="education">Education</option>
          <option value="creative">Creative</option>
          <option value="tech">Tech</option>
          <option value="other">Other</option>
        </select>

        {/* Photo NFT (optional cover) */}
        <div className="border-t border-border pt-3 space-y-2">
          <h3 className="text-xs font-semibold">Photo NFT (Optional)</h3>
          <div className="flex items-center gap-3">
            {coverImage ? (
              <img src={coverImage.url} alt="Cover" className="h-10 w-10 rounded-md object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              {coverImage ? "Change Photo" : "Upload Photo"}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">This photo is attached as the stream cover and queued for NFT mint when you go live.</p>
          {nftStatus !== "none" && (
            <div className="text-[11px]">
              {nftStatus === "pending" && <span className="text-amber-500">NFT will be created when you go live.</span>}
              {nftStatus === "minted" && <span className="text-accent inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Cover attached to this stream.</span>}
              {nftStatus === "error" && <span className="text-destructive">Upload failed. You can retry.</span>}
            </div>
          )}
        </div>

        <button onClick={start} disabled={busy || !title.trim()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
          {busy ? "Starting…" : "Start Stream"}
        </button>
        {stream && (
          <div className="pt-2 text-sm space-y-1 break-all">
            <p><span className="text-muted-foreground">Stream ID:</span> {stream.id}</p>
            <p><span className="text-muted-foreground">RTMP URL:</span> {stream.rtmpUrl}</p>
            <p><span className="text-muted-foreground">Stream Key:</span> <span className="font-mono">{stream.streamKey}</span>
            {coverImage && <span className="ml-2 text-[11px] text-accent">· cover attached</span>}</p>
            <div className="flex gap-4 pt-1">
              <Link to={`/streams/${stream.id}/analytics`} className="text-primary hover:underline">Stream Analytics →</Link>
              <Link to="/streams" className="text-primary hover:underline">All Streams →</Link>
            </div>
          </div>
        )}
      </Card>
    </Page>
  );
}