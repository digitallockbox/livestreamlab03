import { useState, useEffect } from "react";
import { boosts as boostsApi } from "@/lib/web3/boosts";

export function useBoosts(wallet) {
  const [data, setData] = useState({ boosts: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!wallet) {
      setLoading(false);
      return;
    }
    boostsApi
      .list(wallet)
      .then((res) => active && setData({ boosts: res.boosts || [], total: res.total || 0, count: res.count || 0 }))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [wallet]);

  return { ...data, loading, error };
}