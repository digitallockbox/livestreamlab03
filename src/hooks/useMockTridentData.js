import { useState, useEffect, useCallback } from "react";

const MOCK_TRANSACTIONS = [
  { id: 1, type: "digital_sale", amount: 50, currency: "USD", description: "$50 Digital Product Sale" },
  { id: 2, type: "stream_tip", amount: 250, currency: "STREAMING", description: "250 $STREAMING Tip" },
  { id: 3, type: "ppv_unlock", amount: 19.99, currency: "USD", description: "$19.99 Video Unlock" },
  { id: 4, type: "subscription", amount: 9.99, currency: "USD", description: "$9.99 Monthly Sub" },
  { id: 5, type: "affiliate", amount: 125.50, currency: "USD", description: "$125.50 Affiliate Sale" },
  { id: 6, type: "store_sale", amount: 39.99, currency: "USD", description: "$39.99 Store Sale" },
  { id: 7, type: "stream_tip", amount: 500, currency: "STREAMING", description: "500 $STREAMING Tip" },
  { id: 8, type: "ppv_unlock", amount: 4.99, currency: "USD", description: "$4.99 Episode Unlock" },
];

const MOCK_TOP_FANS = [
  { id: 1, name: "crypto_sage", tips: 8450, engagement: "1,240 messages" },
  { id: 2, name: "stream_junkie", tips: 6320, engagement: "892 messages" },
  { id: 3, name: "neon_wolf", tips: 4890, engagement: "756 messages" },
  { id: 4, name: "pixel_queen", tips: 3210, engagement: "645 messages" },
  { id: 5, name: "shadow_dev", tips: 2145, engagement: "423 messages" },
];

const MOCK_TOKEN_SETTLEMENTS = [
  { user: "luna_stream", amount: "500 $STREAMING", time: "2s ago" },
  { user: "darkbyte_", amount: "250 $STREAMING", time: "15s ago" },
  { user: "viewer_99", amount: "1000 $STREAMING", time: "45s ago" },
  { user: "cyber_rex", amount: "750 $STREAMING", time: "2m ago" },
  { user: "neon_wolf", amount: "500 $STREAMING", time: "3m ago" },
];

export function useMockTridentData() {
  const [realtimeTransaction, setRealtimeTransaction] = useState(null);
  const [viewerCount, setViewerCount] = useState(2431);
  const [engagementVelocity, setEngagementVelocity] = useState(145);
  const [systemHealth, setSystemHealth] = useState("secure");
  const [tokenSettlements, setTokenSettlements] = useState(MOCK_TOKEN_SETTLEMENTS);
  const [stressMode, setStressMode] = useState(false);

  const triggerBurst = useCallback(async (count = 10, delayMs = 200) => {
    setStressMode(true);
    for (let i = 0; i < count; i++) {
      const randomTx = MOCK_TRANSACTIONS[Math.floor(Math.random() * MOCK_TRANSACTIONS.length)];
      setRealtimeTransaction({ ...randomTx, id: Date.now() + i, timestamp: new Date().toLocaleTimeString() });
      setViewerCount(prev => Math.min(prev + Math.floor(Math.random() * 200 + 50), 10000));
      setEngagementVelocity(prev => Math.min(prev + Math.floor(Math.random() * 80 + 20), 500));
      await new Promise(r => setTimeout(r, delayMs));
    }
    setStressMode(false);
  }, []);

  useEffect(() => {
    // Simulate random transactions every 3-7 seconds
    const transactionInterval = setInterval(() => {
      const randomTx = MOCK_TRANSACTIONS[Math.floor(Math.random() * MOCK_TRANSACTIONS.length)];
      setRealtimeTransaction({
        ...randomTx,
        timestamp: new Date().toLocaleTimeString(),
      });
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(transactionInterval);
  }, []);

  useEffect(() => {
    // Simulate viewer count growth/fluctuation
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 100) - 30;
        return Math.max(2000, prev + change);
      });
    }, 5000);

    return () => clearInterval(viewerInterval);
  }, []);

  useEffect(() => {
    // Simulate engagement velocity
    const engagementInterval = setInterval(() => {
      setEngagementVelocity(prev => {
        const change = Math.floor(Math.random() * 50) - 15;
        return Math.max(100, prev + change);
      });
    }, 4000);

    return () => clearInterval(engagementInterval);
  }, []);

  useEffect(() => {
    // Simulate token settlement ticker rotation
    const tickerInterval = setInterval(() => {
      setTokenSettlements(prev => [...prev.slice(1), prev[0]]);
    }, 3000);

    return () => clearInterval(tickerInterval);
  }, []);

  return {
    realtimeTransaction,
    viewerCount,
    engagementVelocity,
    systemHealth,
    topFans: MOCK_TOP_FANS,
    tokenSettlements,
    stressMode,
    triggerBurst,
  };
}