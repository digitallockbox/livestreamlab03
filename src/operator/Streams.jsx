import { useEffect, useState } from "react";
import { OperatorAPI } from "./api";

export default function Streams() {
  const [streams, setStreams] = useState(null);

  useEffect(() => {
    OperatorAPI.get("/streams/live").then(r => setStreams(r.live_streams));
  }, []);

  if (!streams) return <div>Loading live streams…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Live Streams</h2>
      <pre className="bg-gray-800 p-4 rounded">{JSON.stringify(streams, null, 2)}</pre>
    </div>
  );
}
