import { useEffect, useState } from "react";
import { OperatorAPI } from "./api";

export default function AutoSplit() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    OperatorAPI.get("/autosplit/status").then(r => setStatus(r.autosplit));
  }, []);

  if (!status) return <div>Loading AutoSplit…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">AutoSplit Engine</h2>
      <pre className="bg-gray-800 p-4 rounded">{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
