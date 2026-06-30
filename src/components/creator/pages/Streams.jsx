import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Radio, History } from "lucide-react";
import { useViewerWallet, streamsAPI, Page, Card, Spinner } from "@/components/creator/os";
import StreamCard from "@/components/creator/pages/StreamCard";

export default function Streams() {
  const wallet = useViewerWallet();
  const [live, setLive] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([streamsAPI.live(), streamsAPI.past(wallet)])
      .then(([l, p]) => {
        if (!active) return;
        setLive(l.streams || []);
        setPast(p.streams || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [wallet]);

  if (loading) return <Page title="Streams" subtitle="Live now and past sessions"><Spinner /></Page>;

  return (
    <Page title="Streams" subtitle="Live now and past sessions">
      <div className="flex justify-end">
        <Link to="/go-live" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Go Live
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="font-display font-semibold flex items-center gap-2"><Radio className="w-4 h-4 text-destructive" /> Live Now</h2>
        {live.length === 0 ? (
          <Card><p className="text-sm text-muted-foreground">No live streams right now.</p></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {live.map((s) => <StreamCard key={s.id} stream={s} />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold flex items-center gap-2"><History className="w-4 h-4 text-muted-foreground" /> Past Streams</h2>
        {past.length === 0 ? (
          <Card><p className="text-sm text-muted-foreground">No past streams yet.</p></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {past.map((s) => <StreamCard key={s.id} stream={s} />)}
          </div>
        )}
      </section>
    </Page>
  );
}