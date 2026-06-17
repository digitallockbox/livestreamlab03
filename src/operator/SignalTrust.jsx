import { useEffect, useState } from "react";
import { OperatorAPI } from "./api";

export default function SignalTrust() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    OperatorAPI.get("/signaltrust/status").then(r => setStatus(r.signaltrust));
  }, []);

  if (!status) return <div>Loading SignalTrust…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">SignalTrust Engine</h2>
      <pre className="bg-gray-800 p-4 rounded">{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
