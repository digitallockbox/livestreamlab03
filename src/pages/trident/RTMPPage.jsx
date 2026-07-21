import React from "react";
import { Link } from "react-router-dom";
import { Loader2, Radio, ExternalLink } from "lucide-react";
import RTMPSessionTable from "@/components/trident/rtmp/RTMPSessionTable";
import { useLiveSessions } from "@/state/trident/useTridentStores";

export default function RTMPPage() {
  const { data: sessions, loading } = useLiveSessions();
  if (loading && !sessions) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  const rows = sessions || [];
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Radio className="w-5 h-5 text-primary" /> RTMP Live Sessions</h2>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">No active RTMP sessions.</p> : <RTMPSessionTable sessions={rows} />}
      <Link to="/trident/rtmp/bitrate" className="text-primary hover:underline text-sm inline-flex items-center gap-1">
        <ExternalLink className="w-3.5 h-3.5" /> Open Bitrate Graph →
      </Link>
      <Link to="/trident/rtmp/inspector" className="text-primary hover:underline text-sm inline-flex items-center gap-1">
        <ExternalLink className="w-3.5 h-3.5" /> Open Session Inspector →
      </Link>
    </div>
  );
}