import WebSocket, { WebSocketServer } from "ws";

const clients = new Set();

export function startLogServer(server) {
  const wss = new WebSocketServer({ server, path: "/logs" });

  wss.on("connection", ws => {
    clients.add(ws);

    ws.on("close", () => clients.delete(ws));
  });

  console.log("Log WebSocket server running at /logs");
}

export function broadcastLog(engine, message) {
  const payload = JSON.stringify({
    engine,
    message,
    ts: Date.now()
  });

  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}
