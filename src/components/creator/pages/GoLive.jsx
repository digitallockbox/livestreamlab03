import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "@/lib/web3/identity";
import { Page, Card, Input, useViewerWallet } from "@/components/creator/os";

export default function GoLive() {
  const viewerWallet = useViewerWallet();
  const { signedInvoke } = useIdentity();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("gaming");
  const [stream, setStream] = useState(null);
  const [busy, setBusy] = useState(false);
  const start = async () => {
    if (!viewerWallet || !title.trim()) return;
    setBusy(true);
    try {
      const res = await signedInvoke("web3Streams", { action: "start", creatorWallet: viewerWallet, title: title.trim(), category });
      setStream(res);
    } finally { setBusy(false); }
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
        <button onClick={start} disabled={busy || !title.trim()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
          {busy ? "Starting…" : "Start Stream"}
        </button>
        {stream && (
          <div className="pt-2 text-sm space-y-1 break-all">
            <p><span className="text-muted-foreground">Stream ID:</span> {stream.id}</p>
            <p><span className="text-muted-foreground">RTMP URL:</span> {stream.rtmpUrl}</p>
            <p><span className="text-muted-foreground">Stream Key:</span> <span className="font-mono">{stream.streamKey}</span></p>
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