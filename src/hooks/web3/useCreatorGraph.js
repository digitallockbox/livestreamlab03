import { useState, useEffect } from "react";
import { passport } from "@/lib/web3/passport";

export function useCreatorGraph() {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    passport
      .me()
      .then((res) => active && setGraph(res.passport))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { graph, loading, error };
}