import { useEffect, useState } from "react";
import { OperatorAPI } from "./api";

export default function Volume() {
  const [volume, setVolume] = useState(null);

  useEffect(() => {
    OperatorAPI.get("/ledger/volume").then(r => setVolume(r.volume));
  }, []);

  if (!volume) return <div>Loading volume…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ledger Volume</h2>
      <pre className="bg-gray-800 p-4 rounded">{JSON.stringify(volume, null, 2)}</pre>
    </div>
  );
}
