import { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

// useStreamPresence — real-time viewer presence for a live stream.
// Pings every 10 seconds and returns the live viewer count (viewers who
// pinged within the last 30 seconds). Uses the StreamPresence entity +
// built-in realtime subscriptions — no backend function required.
export function useStreamPresence(streamId, viewerWallet) {
  const [viewerCount, setViewerCount] = useState(0);
  const presenceMap = useRef(new Map());

  // Load existing presence + subscribe to real-time updates.
  useEffect(() => {
    if (!streamId) return;

    const recalc = () => {
      const cutoff = Date.now() - 30000;
      let count = 0;
      presenceMap.current.forEach((pingTime) => {
        if (pingTime > cutoff) count++;
      });
      setViewerCount(count);
    };

    base44.entities.StreamPresence.filter({ stream_id: streamId }, null, 500)
      .then((records) => {
        records.forEach((r) => {
          presenceMap.current.set(r.viewer_wallet, new Date(r.last_ping_at).getTime());
        });
        recalc();
      })
      .catch(() => {});

    const unsubscribe = base44.entities.StreamPresence.subscribe((event) => {
      if (event.data?.stream_id !== streamId) return;
      if (event.type === "create" || event.type === "update") {
        presenceMap.current.set(
          event.data.viewer_wallet,
          new Date(event.data.last_ping_at).getTime()
        );
      } else if (event.type === "delete") {
        presenceMap.current.delete(event.data.viewer_wallet);
      }
      recalc();
    });

    const interval = setInterval(recalc, 5000);
    return () => { clearInterval(interval); unsubscribe(); };
  }, [streamId]);

  // Ping presence for this viewer every 10 seconds.
  useEffect(() => {
    if (!streamId || !viewerWallet) return;
    let recordId = null;

    const ping = async () => {
      try {
        const now = new Date().toISOString();
        if (!recordId) {
          const existing = await base44.entities.StreamPresence.filter(
            { stream_id: streamId, viewer_wallet: viewerWallet },
            null,
            1
          );
          if (existing.length > 0) {
            recordId = existing[0].id;
            await base44.entities.StreamPresence.update(recordId, { last_ping_at: now });
          } else {
            const created = await base44.entities.StreamPresence.create({
              stream_id: streamId,
              viewer_wallet: viewerWallet,
              joined_at: now,
              last_ping_at: now,
            });
            recordId = created.id;
          }
        } else {
          await base44.entities.StreamPresence.update(recordId, { last_ping_at: now });
        }
      } catch (_err) {
        // fail open — presence is best-effort
      }
    };

    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, [streamId, viewerWallet]);

  return viewerCount;
}