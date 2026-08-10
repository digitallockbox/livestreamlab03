import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ImagePlus, CheckCircle2, Copy, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Input, useViewerWallet } from "@/components/creator/os";
import BroadcastControls from "@/components/creator/pages/BroadcastControls";
import LiveManager from "@/components/creator/pages/LiveManager";
import NftMintPanel from "@/components/creator/pages/NftMintPanel";
import MultiPlatformBroadcast from "@/components/creator/pages/MultiPlatformBroadcast";
import { useTridentRouting } from "@/hooks/web3/useTridentRouting";

// GoLive — broadcast control room. Camera/mic preview + resolution/bitrate
// controls, optional cover photo (minted as an off-chain NFT on go-live), and
// a live manager (viewer count, peak, copy key, end stream) once started.
export default function GoLive() {
  const viewerWallet = useViewerWallet();
  const { signedInvoke } = useIdentity();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("gaming");
  const [resolution, setResolution] = useState("720p");
  const [bitrate, setBitrate] = useState(4500);
  const [stream, setStream] = useState(null);
  const [busy, setBusy] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState("");
  const { routeStream } = useTridentRouting();

  const [coverImage, setCoverImage] = useState(null); // { url }
  const [uploading, setUploading] = useState(false);
  const [nftStatus, setNftStatus] = useState("none"); // none | pending | minting | minted | error
  const [mintedNft, setMintedNft] = useState(null);
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
      // Request a real ingest route from the Trident gateway (wallet-authenticated
      // via tridentProxy). Failure here doesn't kill the already-started stream.
      try {
        const routeRes = await routeStream(res.id, "compute");
        setRoute(routeRes || null);
      } catch (e) {
        setRouteError(e?.message || "Routing unavailable");
      }
      if (coverImage) {
        setNftStatus("minting");
        try {
          const mintRes = await signedInvoke("web3Nft", {
            action: "mint",
            creatorWallet: viewerWallet,
            streamId: res.id,
            imageUrl: coverImage.url,
            title: title.trim(),
          });
          setMintedNft(mintRes?.nft || null);
          setNftStatus("minted");
        } catch {
          setNftStatus("error");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const endStream = async (streamId) => {
    await signedInvoke("web3Streams", { action: "end", streamId });
  };

  const copyKey = async () => {
    if (!stream?.streamKey) return;
    try {
      await navigator.clipboard.writeText(stream.streamKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <Page title="Go Live" subtitle="Broadcast control room">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: preview + broadcast controls + setup */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="space-y-3">
            <BroadcastControls
              resolution={resolution}
              setResolution={setResolution}
              bitrate={bitrate}
              setBitrate={setBitrate}
              disabled={!!stream}
            />
          </Card>

          <MultiPlatformBroadcast disabled={!!stream} />

          <Card className="space-y-3">
            <h2 className="font-display font-semibold text-sm">Stream Setup</h2>
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
                  disabled={uploading || !!stream}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                  {coverImage ? "Change Photo" : "Upload Photo"}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">This photo is attached as the stream cover and minted as an NFT when you go live.</p>
              {nftStatus !== "none" && (
                <div className="text-[11px]">
                  {nftStatus === "pending" && <span className="text-amber-500">NFT will be created when you go live.</span>}
                  {nftStatus === "minting" && <span className="text-blue-500 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Minting NFT…</span>}
                  {nftStatus === "minted" && <span className="text-accent inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> NFT minted and attached to this stream.</span>}
                  {nftStatus === "error" && <span className="text-destructive">Mint failed. You can retry.</span>}
                </div>
              )}
            </div>

            {!stream ? (
              <button onClick={start} disabled={busy || !title.trim()} className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
                {busy ? "Starting…" : "Start Stream"}
              </button>
            ) : (
              <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                Stream is live. Use the live manager to copy your key or end the stream.
              </div>
            )}
          </Card>
        </div>

        {/* Right: live manager / quick info */}
        <div className="space-y-4">
          {stream ? (
            <LiveManager
              stream={stream}
              bitrate={bitrate}
              onEnd={endStream}
              onEnded={() => { setStream(null); setRoute(null); setRouteError(""); }}
            />
          ) : (
            <Card className="space-y-2">
              <h2 className="font-display font-semibold text-sm">Ready to broadcast</h2>
              <p className="text-xs text-muted-foreground">Set your title, pick your camera and bitrate, then hit Start Stream. Your RTMP URL and key appear here once live.</p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="rounded-lg bg-muted p-2"><p className="text-muted-foreground">Resolution</p><p className="font-medium">{resolution}</p></div>
                <div className="rounded-lg bg-muted p-2"><p className="text-muted-foreground">Bitrate</p><p className="font-medium">{bitrate} kbps</p></div>
              </div>
            </Card>
          )}

          {stream && (
            <NftMintPanel
              stream={stream}
              coverImage={coverImage}
              mintedNft={mintedNft}
              nftStatus={nftStatus}
            />
          )}

          {stream && (
            <Card className="space-y-2 text-xs">
              <h2 className="font-display font-semibold text-sm">Quick info</h2>
              <p><span className="text-muted-foreground">Stream ID:</span> <span className="break-all">{stream.id}</span></p>
              {route ? (
                <div className="space-y-1 rounded-md bg-muted/60 p-2">
                  {route.rtmpUrl && <p><span className="text-muted-foreground">RTMP URL:</span> <span className="break-all font-mono">{route.rtmpUrl}</span></p>}
                  {route.node && <p><span className="text-muted-foreground">Node:</span> {route.node}{route.gpuIndex != null ? ` · GPU ${route.gpuIndex}` : ""}</p>}
                  {route.engineId && <p><span className="text-muted-foreground">Engine:</span> {route.engineId}</p>}
                  {route.ingestUrl && <p><span className="text-muted-foreground">Ingest:</span> <span className="break-all font-mono">{route.ingestUrl}</span></p>}
                </div>
              ) : routeError ? (
                <p className="text-destructive">Route: {routeError}</p>
              ) : (
                <p className="text-muted-foreground inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Requesting ingest route…</p>
              )}
              <div className="flex gap-2">
                <button onClick={copyKey} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border hover:bg-muted">
                  {keyCopied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />} Copy key
                </button>
                <Link to={`/streams/${stream.id}/analytics`} className="text-primary hover:underline">Analytics →</Link>
                <Link to="/streams" className="text-primary hover:underline">All Streams →</Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}