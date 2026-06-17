import { useEffect, useState } from "react";
import { OperatorAPI } from "./api";

export default function Blocks() {
  const [blocks, setBlocks] = useState(null);

  useEffect(() => {
    OperatorAPI.get("/ledger/blocks").then(r => setBlocks(r.blocks));
  }, []);

  if (!blocks) return <div>Loading blocks…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ledger Blocks</h2>
      <div className="space-y-2">
        {blocks.map(b => (
          <div key={b.number} className="p-4 bg-gray-800 rounded">
            <p>Block #{b.number}</p>
            <p>Tx Count: {b.txCount}</p>
            <p>Timestamp: {b.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
