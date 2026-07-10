/**
 * useCreatorDashboard — single-call unified creator dashboard hook.
 *
 * Calls GET /api/creator/dashboard on wallet connect, receiving the merged
 * identity + autosplit + token + storage object in one response.
 *
 * Fail-open: if the backend is unavailable, builds the dashboard locally from
 * the derived identity pieces (Modules C/D/E/F) so the UI stays responsive.
 */
import { useState, useEffect, useCallback } from "react";
import { useIdentity } from "@/lib/web3/identity";
import { base44Api } from "@/lib/tridentApi";
import { getCreatorIdentity } from "@/lib/web3/creatorIdentity";
import { getAutoSplitIdentity } from "@/lib/web3/autosplitIdentity";
import { getTokenIdentity } from "@/lib/web3/tokenIdentity";
import { getCreatorStorageTree } from "@/lib/web3/creatorStorage";
import { buildCreatorDashboard } from "@/lib/web3/creatorDashboard";
import { getWalletToken } from "@/lib/web3/identity";

export function useCreatorDashboard() {
  const { walletAddress } = useIdentity();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    if (!walletAddress) {
      setDashboard(null);
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Try the unified backend endpoint first.
      const res = await base44Api.creatorDashboard();
      if (res?.creator_id) {
        setDashboard(res);
        return;
      }
      throw new Error("Incomplete dashboard response");
    } catch (e) {
      // Fail-open: build locally from derived identities.
      try {
        const [creator, autosplit, token] = await Promise.all([
          getCreatorIdentity(walletAddress),
          getAutoSplitIdentity(walletAddress),
          getTokenIdentity(walletAddress),
        ]);
        const storage = getCreatorStorageTree(creator.creator_id);
        const local = buildCreatorDashboard({
          creator,
          autosplit,
          token,
          storage,
          wallet: walletAddress,
          sessionToken: getWalletToken(),
        });
        setDashboard(local);
      } catch (localErr) {
        setError(localErr?.message || "Failed to build dashboard");
        setDashboard(null);
      }
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    wallet: walletAddress,
    dashboard,
    loading,
    error,
    refresh: fetchDashboard,
  };
}