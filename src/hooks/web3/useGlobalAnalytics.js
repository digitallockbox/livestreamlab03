import { useState, useEffect, useCallback } from 'react';
import { globalAnalytics } from '@/lib/web3/globalAnalytics';

/**
 * useGlobalAnalytics — React hook for the Global Creator Analytics Engine.
 * Fetches platform-wide analytics with fail-open fallback to local computation.
 */
export function useGlobalAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await globalAnalytics.getOverview();
      setData(result);
    } catch (e) {
      setError(e?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}