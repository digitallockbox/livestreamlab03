import React, { useEffect, useState } from "react";
import { useStreamingIdentity } from "@/lib/web3/streamingIdentity";
import { streamsAPI, watchAPI, Page, Card, Spinner } from "@/components/creator/os";
import StreamPlayer from "@/components/creator/stream/StreamPlayer";

export default function Watch() {
  const { wallet } = useStreamingIdentity();
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [session, setSession] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    streamsAPI.live().then((r) => setLiveStreams(r.streams || [])).finally(() => setLoading(false));
  }, []);

  // +1 $STREAMING per minute while a session is active.
  useEffect(() => {
    if (!session) return;
    const id = setInterval(async () => {
      const res = await watchAPI.tick(session.id);
      const earned = res.session?.tokens_earned;
      const watched = res.session?.minutes_watched;
      setTokens((t) => (earned != null ? earned : t + 1));
      setMinutes((m) => (watched != null ? watched : m + 1));
    }, 60000);
    return () => clearInterval(id);
  }, [session]);

  // End the session on unmount.
  useEffect(() => () => { if (session) watchAPI.end(session.id); }, [session]);

  const start = async (stream) => {
    if (!wallet) return;
    setSelected(stream);
    setBusy(true);
    try {
      const res = await watchAPI.start(wallet, stream.creator_wallet);
      setSession(res.session);
      setTokens(0); setMinutes(0);
    } finally { setBusy(false); }
  };

  const stop = async () => {
    if (!session) return;
    await watchAPI.end(session.id);
    setSession(null); setSelected(null);
  };

  if (session && selected) {
    return (
      <Page title="Watch-to-Earn" subtitle="Earn $STREAMING for every minute you watch">
        <StreamPlayer stream={selected} tokens={tokens} minutes={minutes} onStop={stop} />
      </Page>
    );
  }

  return (
    <Page title="Watch-to-Earn" subtitle="Earn $STREAMING for every minute you watch">
      {loading ? <Spinner /> : liveStreams.length === 0 ? (
        <Card><p className="text-sm text-muted-foreground">No live streams right now.</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveStreams.map((s) => (
            <Card key={s.id} className="flex flex-col gap-3">
              <div className="min-w-0">
                <h3 className="font-display font-semibold truncate">{s.title}</h3>
                <p className="font-mono text-xs text-muted-foreground break-all">{s.creator_wallet}</p>
              </div>
              <button onClick={() => start(s)} disabled={busy} className="mt-auto px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
                {busy ? "Starting…" : "Watch & earn"}
              </button>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}