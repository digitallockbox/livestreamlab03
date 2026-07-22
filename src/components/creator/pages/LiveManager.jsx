import React, { useEffect, useState } from "react";
import { Radio, Copy, Check, Square, Users, Gauge } from "lucide-react";
import { streamsAPI, Card } from "@/components/creator/os";

// LiveManager — shown once a stream is started. Polls the stream analytics
// endpoint for live viewer count + peak, exposes copy-key, and ends the
// stream via the web3Streams "end" action.
export default function LiveManager({ stream, bitrate, onEnd, onEnded }) {
  const [viewers, setViewers] = useState(0);
  const [peak, setPeak] = useState(0);
  const [copied, setCopied] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!stream?.id) return;
    let active = true;
    const poll = async () => {
      try {
        const res = await streamsAPI.analytics(stream.id);
        if (!active) return;
        setViewers(res?.stream?.viewer_count || 0);
        setPeak(res?.concurrentPeak || res?.stream?.peak_viewers || 0);
      } catch { /* ignore transient */ }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { active = false; clearInterval(id); };
  }, [stream?.id]);

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(stream.streamKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const end = async () => {
    setEnding(true);
    try {
      await (onEnd ? onEnd(stream.id) : streamsAPI.end(stream.id));
      onEnded?.();
    } catch { /* surface nothing for now */ } finally {
      setEnding(false);
    }
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/15 text-destructive">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> LIVE
        </span>
        <Radio className="w-4 h-4 text-destructive" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted p-2">
          <Users className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
          <p className="text-lg font-display font-bold mt-1">{viewers}</p>
          <p className="text-[10px] text-muted-foreground">Viewers</p>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <Radio className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
          <p className="text-lg font-display font-bold mt-1">{peak}</p>
          <p className="text-[10px] text-muted-foreground">Peak</p>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <Gauge className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
          <p className="text-lg font-display font-bold mt-1">{bitrate}</p>
          <p className="text-[10px] text-muted-foreground">kbps</p>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <p className="text-muted-foreground">RTMP URL</p>
        <p className="font-mono break-all bg-muted rounded-md px-2 py-1.5">{stream.rtmpUrl}</p>
        <p className="text-muted-foreground mt-2">Stream Key</p>
        <div className="flex items-center gap-2">
          <p className="font-mono break-all bg-muted rounded-md px-2 py-1.5 flex-1">{stream.streamKey}</p>
          <button onClick={copyKey} className="px-2 py-1.5 rounded-md border border-border hover:bg-muted">
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <button onClick={end} disabled={ending} className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-destructive/15 text-destructive text-sm hover:bg-destructive/25">
        <Square className="w-3.5 h-3.5 fill-current" /> {ending ? "Ending…" : "End Stream"}
      </button>
    </Card>
  );
}