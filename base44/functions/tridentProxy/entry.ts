/**
 * Trident Proxy — Backend Function
 * Routes Base44 → Trident API safely.
 * The frontend calls this function; this function calls Trident.
 * Trident token is kept server-side only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TRIDENT_BASE = "https://api.trident.live/api";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { method, path, body } = await req.json();

    if (!path || !path.startsWith("/")) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    // Block engine/internal paths — sovereign protection
    const blocked = ["/engine", "/internal", "/private", "/bridge"];
    if (blocked.some(b => path.startsWith(b))) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const headers = { "Content-Type": "application/json" };

    const res = await fetch(`${TRIDENT_BASE}${path}`, {
      method: method || "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});