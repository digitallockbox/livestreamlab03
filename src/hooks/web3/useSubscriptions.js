import { useState, useEffect } from "react";
import { subscriptions as subsApi } from "@/lib/web3/subscriptions";

export function useSubscribers(wallet) {
  const [data, setData] = useState({ subscribers: [], count: 0, mrr: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!wallet) {
      setLoading(false);
      return;
    }
    subsApi
      .list(wallet)
      .then((res) =>
        active && setData({ subscribers: res.subscribers || [], count: res.count || 0, mrr: res.mrr || 0 })
      )
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [wallet]);

  return { ...data, loading, error };
}