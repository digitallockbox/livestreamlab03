import React, { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, Settings2 } from "lucide-react";

// BroadcastControls — local camera/mic preview with device pickers and
// resolution/bitrate settings. Settings are lifted to the parent so they can
// be passed to the encoder/start flow. Preview uses getUserMedia; degrades
// gracefully when no camera/mic is available (e.g. preview sandbox).
const RESOLUTIONS = [
  { label: "720p", width: 1280, height: 720 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "480p", width: 854, height: 480 },
];

const BITRATES = [
  { label: "2500 kbps", value: 2500 },
  { label: "4500 kbps", value: 4500 },
  { label: "6000 kbps", value: 6000 },
  { label: "8000 kbps", value: 8000 },
];

export default function BroadcastControls({ resolution, setResolution, bitrate, setBitrate, disabled }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [cameraId, setCameraId] = useState("");
  const [micId, setMicId] = useState("");
  const [previewOn, setPreviewOn] = useState(false);
  const [error, setError] = useState("");

  // Enumerate devices once permission is granted (labels are empty until then).
  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput"));
      setMics(devices.filter((d) => d.kind === "audioinput"));
    } catch { /* ignore */ }
  };

  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setPreviewOn(false);
  };

  const startPreview = async () => {
    setError("");
    const res = RESOLUTIONS.find((r) => r.label === resolution) || RESOLUTIONS[0];
    const constraints = {
      video: { width: { ideal: res.width }, height: { ideal: res.height }, ...(cameraId ? { deviceId: { exact: cameraId } } : {}) },
      audio: micId ? { deviceId: { exact: micId } } : false,
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPreviewOn(true);
      loadDevices();
    } catch (e) {
      setError(e?.message || "Camera unavailable");
      setPreviewOn(false);
    }
  };

  // Restart preview when device/resolution changes while live.
  useEffect(() => {
    if (previewOn) {
      stopPreview();
      startPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId, resolution]);

  useEffect(() => () => stopPreview(), []);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-border">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {!previewOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
            <VideoOff className="w-6 h-6" />
            <span>{error || "Preview off"}</span>
            <button
              type="button"
              onClick={startPreview}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Video className="w-3.5 h-3.5" /> Enable Camera
            </button>
          </div>
        )}
        {previewOn && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> PREVIEW
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground flex items-center gap-1"><Video className="w-3 h-3" /> Camera</span>
          <select value={cameraId} onChange={(e) => setCameraId(e.target.value)} disabled={disabled} className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-xs">
            <option value="">Default</option>
            {cameras.map((c, i) => <option key={c.deviceId || i} value={c.deviceId}>{c.label || `Camera ${i + 1}`}</option>)}
          </select>
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground flex items-center gap-1"><Mic className="w-3 h-3" /> Microphone</span>
          <select value={micId} onChange={(e) => setMicId(e.target.value)} disabled={disabled} className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-xs">
            <option value="">Default</option>
            {mics.map((m, i) => <option key={m.deviceId || i} value={m.deviceId}>{m.label || `Mic ${i + 1}`}</option>)}
          </select>
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground flex items-center gap-1"><Settings2 className="w-3 h-3" /> Resolution</span>
          <select value={resolution} onChange={(e) => setResolution(e.target.value)} disabled={disabled} className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-xs">
            {RESOLUTIONS.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
          </select>
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground flex items-center gap-1"><Settings2 className="w-3 h-3" /> Bitrate</span>
          <select value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))} disabled={disabled} className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-xs">
            {BITRATES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </label>
      </div>

      {previewOn && (
        <button type="button" onClick={stopPreview} className="text-xs text-muted-foreground hover:text-foreground">Stop preview</button>
      )}
    </div>
  );
}