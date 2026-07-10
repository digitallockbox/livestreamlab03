/**
 * useTokenAnalytics — fetches $STREAMING token analytics for the connected wallet.
 *
 * Calls the backend /api/token/analytics endpoint for two windows (30d + 7d)
 * in parallel. Each response includes lifetime stats (balance, total_earned,
 * total_spent, lastpayoutat) plus the window-specific earn/spend.
 *
 * Also fetches recent ledger entries via /api/token/ledger.
 *
 * Fail-open: if the backend is unavailable, falls back to local computation
 * from an empty ledger (all zeros) so the UI stays responsive.
 */
import { useState, useEffect, useCallback } from "react";
import { useIdentity } from "@/lib/web3/identity";
import { base44Api } from "@/lib/tridentApi";
import { getTokenIdentity } from "@/lib/web3/tokenIdentity";
import { getTokenAnalytics, initializeTokenLedger } from "@/lib/web3/tokenAnalytics";

export function useTokenAnalytics() {
  const { walletAddress } = useIdentity();
  const [tokenIdentity, setTokenIdentity] = useState(null);
  const [analytics30d, setAnalytics30d] = useState(null);
  const [analytics7d, setAnalytics7d] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    if (!walletAddress) {
      setTokenIdentity(null);
      setAnalytics30d(null);
      setAnalytics7d(null);
      setLedger([]);
      return;
    }
    setLoading(true);
    setError("");

    const empty = initializeTokenLedger();

    try {
      const [res30, res7, ledgerRes] = await Promise.all([
        base44Api.tokenAnalytics(30).catch(() => null),
        base44Api.tokenAnalytics(7).catch(() => null),
        base44Api.tokenLedger().catch(() => null),
      ]);

      // 30d response includes lifetime stats + 30d window
      setAnalytics30d(res30?.analytics || getTokenAnalytics(empty, 30));
      // 7d response includes 7d window
      setAnalytics7d(res7?.analytics || getTokenAnalytics(empty, 7));
      // Recent ledger entries — backend may return {ledger:[]} or {entries:[]}
      setLedger(ledgerRes?.ledger || ledgerRes?.entries || []);
    } catch (e) {
      // Fail-open: compute from empty state so the UI never breaks
      setAnalytics30d(getTokenAnalytics(empty, 30));
      setAnalytics7d(getTokenAnalytics(empty, 7));
      setLedger([]);
      setError(e?.message || "Failed to fetch token analytics");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Derive token identity on wallet connect
  useEffect(() => {
    if (!walletAddress) { setTokenIdentity(null); return; }
    let active = true;
    getTokenIdentity(walletAddress)
      .then((ti) => { if (active) setTokenIdentity(ti); })
      .catch(() => {});
    return () => { active = false; };
  }, [walletAddress]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    wallet: walletAddress,
    tokenIdentity,
    analytics30d,
    analytics7d,
    ledger,
    loading,
    error,
    refresh: fetchAnalytics,
  };
}