import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Database, Table2 } from "lucide-react";

const invoke = (payload) => base44.functions.invoke("supabaseInspector", payload).then((r) => r.data);
const Spinner = () => <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

export default function SupabaseExplorer() {
  const [projects, setProjects] = useState([]);
  const [projectRef, setProjectRef] = useState("");
  const [tables, setTables] = useState([]);
  const [table, setTable] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState("projects");
  const [error, setError] = useState("");

  useEffect(() => {
    invoke({ action: "projects" })
      .then((r) => setProjects(r.projects || []))
      .catch((e) => setError(e?.response?.data?.error || e?.message || "Failed to load projects"))
      .finally(() => setLoading(""));
  }, []);

  const loadTables = async (ref) => {
    setProjectRef(ref); setTables([]); setTable(""); setRows([]); setError(""); setLoading("tables");
    try { const r = await invoke({ action: "tables", projectRef: ref }); setTables(r.tables || []); }
    catch (e) { setError(e?.response?.data?.error || e?.message || "Failed to load tables"); }
    finally { setLoading(""); }
  };

  const loadRows = async (t) => {
    setTable(t); setRows([]); setError(""); setLoading("rows");
    try { const r = await invoke({ action: "read", projectRef, tableName: t, limit: 50 }); setRows(r.rows || []); }
    catch (e) { setError(e?.response?.data?.error || e?.message || "Failed to read table"); }
    finally { setLoading(""); }
  };

  const cols = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Database className="w-6 h-6 text-primary" /> Supabase Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Read-only browse of your connected Supabase projects (admin only).</p>
      </div>
      {error && <div className="text-sm text-destructive rounded-md bg-destructive/10 p-3">{error}</div>}

      {loading === "projects" ? <Spinner /> : (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <h3 className="font-display font-semibold">Projects</h3>
          {projects.length === 0 ? <p className="text-sm text-muted-foreground">No projects found.</p> : projects.map((p) => (
            <button key={p.ref} onClick={() => loadTables(p.ref)} className={`w-full text-left p-3 rounded-xl border transition-colors ${projectRef === p.ref ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{p.ref} · {p.region} · {p.status}</p>
            </button>
          ))}
        </div>
      )}

      {tables.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <h3 className="font-display font-semibold flex items-center gap-2"><Table2 className="w-4 h-4" /> Tables</h3>
          <div className="flex flex-wrap gap-2">
            {tables.map((t) => (
              <button key={t.name} onClick={() => loadRows(t.name)} className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${table === t.name ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>{t.name}</button>
            ))}
          </div>
        </div>
      )}

      {loading === "rows" ? <Spinner /> : rows.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 overflow-auto">
          <h3 className="font-display font-semibold mb-3">{table} <span className="text-xs text-muted-foreground font-normal">({rows.length} rows)</span></h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">{cols.map((c) => <th key={c} className="text-left p-2 text-muted-foreground font-medium">{c}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  {cols.map((c) => <td key={c} className="p-2 align-top font-mono text-xs break-all whitespace-pre-wrap">{String(row[c] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}