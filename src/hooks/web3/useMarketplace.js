import { useState, useEffect } from "react";
import { marketplace } from "@/lib/web3/marketplace";

export function useMarketplace(creatorWallet) {
  const [data, setData] = useState({ products: [], count: 0, revenue: 0, sales: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!creatorWallet) {
      setLoading(false);
      return;
    }
    marketplace
      .list(creatorWallet)
      .then((res) =>
        active && setData({ products: res.products || [], count: res.count || 0, revenue: res.revenue || 0, sales: res.sales || 0 })
      )
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [creatorWallet]);

  return { ...data, loading, error };
}