import { useEffect, useState } from "react";
import { OperatorAPI } from "./api";

export default function Engines() {
  const [data, setData] = useState(null);

  useEffect(() => {
    OperatorAPI.get("/engines").then(setData);
  }, []);

  if (!data) return <div>Loading engines…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Engine Health</h2>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(data).map(([name, info]) => (
          <div key={name} className="p-4 bg-gray-800 rounded">
            <h3 className="text-xl font-semibold capitalize">{name}</h3>
            <p>Status: {info.status}</p>
            <p>Latency: {info.latency ?? "n/a"} ms</p>
            <p>Errors: {info.errors ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
