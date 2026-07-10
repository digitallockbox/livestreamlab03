/**
 * IdentityExplorer — UI for the Global Identity Index (Module I).
 *
 * Three tabs:
 *   - Browse:  lists all registered creator / autosplit / token IDs
 *   - Lookup:  resolve a single ID to its full identity object
 *   - Search:  fuzzy search by wallet, creator URL, or route path
 *
 * Uses the useIdentityIndex hook bound to the platform's identity APIs.
 */
import React, { useState } from "react";
import {
  Search, Eye, List, Fingerprint, Loader2, Copy, Check,
  Users, Split, Coins, ExternalLink,
} from "lucide-react";
import { useIdentityIndex } from "@/hooks/web3/useIdentityIndex";

const NS_META = {
  creators:  { label: "Creators",  icon: Users,  color: "text-chart-4" },
  autosplit: { label: "AutoSplits", icon: Split,  color: "text-chart-3" },
  tokens:    { label: "Tokens",    icon: Coins,  color: "text-accent" },
};

const copyText = async (text) => {
  try { await navigator.clipboard.writeText(text); } catch {}
};

function CopyableId({ id }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { copyText(id); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground truncate"
    >
      {id}
      {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3 opacity-50" />}
    </button>
  );
}

export default function IdentityExplorer() {
  const { index, lookupResult, searchResults, loading, error, fetchList, lookup, search } = useIdentityIndex();
  const [tab, setTab] = useState("browse");
  const [lookupInput, setLookupInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const handleLookup = (e) => {
    e.preventDefault();
    lookup(lookupInput.trim());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    search(searchInput.trim());
  };

  const tabs = [
    { key: "browse", label: "Browse", icon: List },
    { key: "lookup", label: "Lookup", icon: Eye },
    { key: "search", label: "Search", icon: Search },
  ];

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">{error}</p>
      )}

      {/* Browse tab */}
      {tab === "browse" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">All registered identities</span>
            <button onClick={fetchList} disabled={loading} className="text-xs text-muted-foreground hover:text-foreground">
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(NS_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const ids = index[key] || [];
              return (
                <div key={key} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                    <span className="text-xs font-medium">{meta.label}</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">{ids.length}</span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {ids.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground py-2">No entries</p>
                    ) : (
                      ids.map((id) => (
                        <div key={id} className="flex items-center gap-1 py-1 border-b border-border/30 last:border-0">
                          <CopyableId id={id} />
                          <button
                            onClick={() => { setTab("lookup"); setLookupInput(id); lookup(id); }}
                            className="ml-auto opacity-50 hover:opacity-100"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lookup tab */}
      {tab === "lookup" && (
        <div className="space-y-3">
          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Enter creator, autosplit, or token ID…"
              className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
            />
            <button type="submit" disabled={loading || !lookupInput.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} Lookup
            </button>
          </form>
          {lookupResult && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Type: {lookupResult.type}</span>
              </div>
              <pre className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 overflow-x-auto max-h-64">
                {JSON.stringify(lookupResult.identity || lookupResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Search tab */}
      {tab === "search" && (
        <div className="space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by wallet, creator URL, or route…"
              className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
            />
            <button type="submit" disabled={loading || !searchInput.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
            </button>
          </form>
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{searchResults.length} result{searchResults.length === 1 ? "" : "s"}</span>
              {searchResults.map((r, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground truncate">{r.wallet || "—"}</span>
                    {r.routes?.creator_home && (
                      <a href={r.routes.creator_home} target="_blank" rel="noreferrer" className="ml-auto opacity-50 hover:opacity-100">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {r.metadata && (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(r.metadata).map(([k, v]) => (
                        <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{k}: {String(v).slice(0, 12)}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}