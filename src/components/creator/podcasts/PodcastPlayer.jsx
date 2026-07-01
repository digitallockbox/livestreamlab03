import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, X, SkipBack, SkipForward } from "lucide-react";

const fmt = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// PodcastPlayer — in-browser audio player with play/pause and a scrub bar.
// Driven by a hidden <audio> element controlled via ref.
export default function PodcastPlayer({ episode, onClose }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = ref.current;
    if (!a || !episode) return;
    const onTime = () => setCurrent(a.currentTime);
    const onDur = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("durationchange", onDur);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    setCurrent(0);
    setPlaying(false);
    a.play().catch(() => setPlaying(false));
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("durationchange", onDur);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [episode?.id]);

  const toggle = () => {
    const a = ref.current; if (!a) return;
    if (a.paused) a.play(); else a.pause();
  };

  const seek = (e) => {
    const a = ref.current; if (!a) return;
    const v = Number(e.target.value);
    a.currentTime = v;
    setCurrent(v);
  };

  const skip = (delta) => {
    const a = ref.current; if (!a) return;
    a.currentTime = Math.max(0, Math.min((a.duration || 0), a.currentTime + delta));
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <audio ref={ref} src={episode.audio_url} preload="metadata" />

      {/* Play / pause */}
      <button
        onClick={toggle}
        className="w-11 h-11 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        title={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>

      {/* Title + scrubber */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{episode.title}</p>
            <p className="text-xs text-muted-foreground truncate">{episode.series || "Uncategorized"}</p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground shrink-0">
            <button onClick={() => skip(-10)} title="Back 10s" className="w-7 h-7 rounded-md hover:text-foreground hover:bg-muted flex items-center justify-center">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => skip(30)} title="Forward 30s" className="w-7 h-7 rounded-md hover:text-foreground hover:bg-muted flex items-center justify-center">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground tabular-nums w-9 text-right">{fmt(current)}</span>
          <div className="relative flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${pct}%` }} />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={seek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek"
            />
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums w-9">{fmt(duration)}</span>
        </div>
      </div>

      <button onClick={onClose} className="w-8 h-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center" title="Close player">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}