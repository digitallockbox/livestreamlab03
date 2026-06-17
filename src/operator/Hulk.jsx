import { useEffect, useState } from "react";
import { OperatorAPI } from "./api";

export default function Hulk() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    OperatorAPI.get("/hulk/status").then(r => setStatus(r.hulk));
  }, []);

  if (!status) return <div>Loading HULK…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">HULK Engine</h2>
      <pre className="bg-gray-800 p-4 rounded">{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
