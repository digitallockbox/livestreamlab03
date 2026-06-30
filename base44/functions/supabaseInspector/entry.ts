// supabaseInspector — read-only Supabase browser (shared connector)
// Actions: projects | tables | read
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SUPABASE_API = "https://api.supabase.com/v1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("supabase");
    if (!accessToken) return Response.json({ error: "Supabase not connected" }, { status: 502 });

    const body = await req.json().catch(() => ({}));
    const { action, projectRef, tableName, select, filters, order, limit, offset } = body;
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    if (action === "projects") {
      const res = await fetch(`${SUPABASE_API}/projects`, { headers: authHeaders });
      const data = await res.json().catch(() => []);
      const projects = (Array.isArray(data) ? data : []).map((p) => ({
        id: p.id, ref: p.ref || p.id, name: p.name, region: p.region, status: p.status,
      }));
      return Response.json({ projects });
    }

    if (!projectRef) return Response.json({ error: "projectRef required" }, { status: 400 });

    if (action === "tables") {
      const res = await fetch(`${SUPABASE_API}/projects/${projectRef}/database/query/read-only`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      const tables = [];
      const paths = data?.paths || {};
      for (const [name, def] of Object.entries(paths)) {
        const d = (def && typeof def === "object") ? def : {};
        const definitions = d.definitions || {};
        tables.push({ name, columns: Object.keys(definitions) });
      }
      return Response.json({ tables });
    }

    if (action === "read") {
      if (!tableName) return Response.json({ error: "tableName required" }, { status: 400 });
      const keysRes = await fetch(`${SUPABASE_API}/projects/${projectRef}/api-keys`, { headers: authHeaders });
      const keys = await keysRes.json().catch(() => []);
      const serviceKey = (Array.isArray(keys) ? keys : []).find((k) => k.name === "service_role");
      if (!serviceKey || !serviceKey.api_key) return Response.json({ error: "service_role key not found" }, { status: 502 });

      const params = new URLSearchParams();
      if (select) params.set("select", select);
      if (order) params.set("order", order);
      params.set("limit", String(limit || 100));
      params.set("offset", String(offset || 0));
      if (filters && typeof filters === "object") {
        for (const [k, v] of Object.entries(filters)) params.set(k, String(v));
      }
      const url = `https://${projectRef}.supabase.co/rest/v1/${tableName}?${params.toString()}`;
      const dataRes = await fetch(url, {
        headers: { apikey: serviceKey.api_key, Authorization: `Bearer ${serviceKey.api_key}` },
      });
      const rows = await dataRes.json().catch(() => []);
      return Response.json({ rows, contentRange: dataRes.headers.get("Content-Range"), status: dataRes.status });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("supabaseInspector error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});