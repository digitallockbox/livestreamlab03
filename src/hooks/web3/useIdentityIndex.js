/**
 * useIdentityIndex — frontend binding for the Global Identity Index (Module I).
 *
 * Exposes three operations against the platform's identity index:
 *   - list():   fetch all registered creator / autosplit / token IDs
 *   - lookup(id): resolve a single ID to its full identity + type
 *   - search(q):  fuzzy search by wallet, creator URL, or route
 *
 * State is kept simple: each operation is called on demand and stored
 * independently so they don't clobber each other.
 */
import { useState, useCallback, useEffect } from "react";
import { base44Api } from "@/lib/tridentApi";

export function useIdentityIndex() {
  const [index, setIndex] = useState({ creators: [], autosplit: [], tokens: [] });
  const [lookupResult, setLookupResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44Api.identityList();
      setIndex({
        creators: res?.creators || [],
        autosplit: res?.autosplit || [],
        tokens: res?.tokens || [],
      });
    } catch (e) {
      setError(e?.message || "Failed to fetch identity list");
    } finally {
      setLoading(false);
    }
  }, []);

  const lookup = useCallback(async (id) => {
    if (!id) { setLookupResult(null); return null; }
    setLoading(true);
    setError("");
    try {
      const res = await base44Api.identityLookup(id);
      setLookupResult(res);
      return res;
    } catch (e) {
      setLookupResult(null);
      setError(e?.message || "Identity not found");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (q) => {
    if (!q) { setSearchResults([]); return []; }
    setLoading(true);
    setError("");
    try {
      const res = await base44Api.identitySearch(q);
      setSearchResults(res?.results || []);
      return res?.results || [];
    } catch (e) {
      setSearchResults([]);
      setError(e?.message || "Search failed");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  return {
    index, lookupResult, searchResults,
    loading, error,
    fetchList, lookup, search,
  };
}