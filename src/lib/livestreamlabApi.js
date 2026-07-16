// ======================================================
//  LiveStreamLab API Client (v1)
//
//  Implements the LiveStreamLab API Specification by mapping
//  each module/action to Base44 entity SDK calls + engine logic.
//
//  Modules: streams, revenue, metrics, tree, autosplit, wallet,
//           accounts, cluster, governance, telemetry, token, webhooks
//
//  Usage:
//    import { streams, revenue, tree, autosplit } from "@/lib/livestreamlabApi";
//    const s = await streams.create({ creatorId, title });
//    const t = await tree.build({ streamId, branchRatios });
//    const r = await autosplit.execute({ streamId });
// ======================================================

import { base44 } from "@/api/base44Client";
import {
  processStreamDistribution, validateBranchConfig,
  usdToCoins, coinsToUsd, DEFAULT_CONFIG, BRANCH_TYPES,
} from "@/lib/coinTree";

// ======================================================
//  STREAMS — create, start, end, fetch
// ======================================================
export const streams = {
  async create({ creatorId, title, scheduledStart, category, description }) {
    return base44.entities.Stream.create({
      creator_wallet: creatorId,
      title,
      category,
      description,
      status: "scheduled",
    });
  },

  async start(streamId) {
    return base44.entities.Stream.update(streamId, { status: "live" });
  },

  async end(streamId) {
    return base44.entities.Stream.update(streamId, { status: "ended" });
  },

  async get(streamId) {
    return base44.entities.Stream.get(streamId);
  },

  async live() {
    return base44.entities.Stream.filter({ status: "live" }, "-created_date', 50");
  },

  async past(creatorId) {
    return base44.entities.Stream.filter({ creator_wallet: creatorId, status: "ended" }, "-created_date", 50);
  },
};

// ======================================================
//  REVENUE — tips, subscriptions, ads, sponsorships
// ======================================================
export const revenue = {
  async tip({ streamId, payerId, amount, currency = "USD" }) {
    return base44.entities.Transaction.create({
      type: "stream_tip",
      stream_id: streamId,
      sender_wallet: payerId,
      amount,
      status: "completed",
      description: `Tip for stream ${streamId}`,
    });
  },

  async subscription({ streamId, payerId, amount, currency = "USD" }) {
    return base44.entities.Transaction.create({
      type: "subscription",
      stream_id: streamId,
      sender_wallet: payerId,
      amount,
      status: "completed",
      description: `Subscription for stream ${streamId}`,
    });
  },

  async ad({ streamId, payerId, amount, currency = "USD" }) {
    return base44.entities.Transaction.create({
      type: "audio_boost",
      stream_id: streamId,
      sender_wallet: payerId,
      amount,
      status: "completed",
      description: `Ad revenue for stream ${streamId}`,
    });
  },

  async sponsor({ streamId, payerId, amount, currency = "USD" }) {
    return base44.entities.Transaction.create({
      type: "store_sale",
      stream_id: streamId,
      sender_wallet: payerId,
      amount,
      status: "completed",
      description: `Sponsorship for stream ${streamId}`,
    });
  },

  async events(streamId) {
    return base44.entities.Transaction.filter({ stream_id: streamId }, "-created_date", 200);
  },

  async grossForStream(streamId) {
    const events = await this.events(streamId);
    return events
      .filter((t) => (t.status || "completed") === "completed")
      .reduce((sum, t) => sum + (t.amount || t.streaming_amount || 0), 0);
  },
};

// ======================================================
//  METRICS — watch time, engagement, aggregate
// ======================================================
export const metrics = {
  async watchtime({ streamId, viewerId, seconds }) {
    const stream = await base44.entities.Stream.get(streamId).catch(() => null);
    const sessions = await base44.entities.WatchSession.filter({
      stream_id: streamId, viewer_wallet: viewerId, status: "active",
    }).catch(() => []);

    if (sessions.length > 0) {
      const session = sessions[0];
      return base44.entities.WatchSession.update(session.id, {
        minutes_watched: (session.minutes_watched || 0) + Math.round(seconds / 60),
      });
    }
    return base44.entities.WatchSession.create({
      stream_id: streamId,
      viewer_wallet: viewerId,
      creator_wallet: stream?.creator_wallet || "",
      minutes_watched: Math.round(seconds / 60),
      status: "active",
    });
  },

  async engagement({ streamId, viewerId, event }) {
    const sessions = await base44.entities.WatchSession.filter({
      stream_id: streamId, viewer_wallet: viewerId, status: "active",
    }).catch(() => []);

    if (sessions.length > 0) {
      const session = sessions[0];
      return base44.entities.WatchSession.update(session.id, {
        engagement_score: (session.engagement_score || 0) + 1,
      });
    }
    // No active session — create one with the engagement event
    const stream = await base44.entities.Stream.get(streamId).catch(() => null);
    return base44.entities.WatchSession.create({
      stream_id: streamId,
      viewer_wallet: viewerId,
      creator_wallet: stream?.creator_wallet || "",
      engagement_score: 1,
      status: "active",
    });
  },

  async aggregate(streamId) {
    const sessions = await base44.entities.WatchSession.filter({ stream_id: streamId }).catch(() => []);
    const totalWatchTime = sessions.reduce((sum, s) => sum + (s.minutes_watched || 0), 0);
    const totalEngagement = sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0);
    const uniqueViewers = new Set(sessions.map((s) => s.viewer_wallet)).size;
    return {
      streamId,
      totalWatchTime,
      totalEngagement,
      totalUniqueViewers: uniqueViewers,
      engagementScore: uniqueViewers > 0 ? totalEngagement / uniqueViewers : 0,
      participationScores: sessions.map((s) => ({
        viewerId: s.viewer_wallet,
        minutes: s.minutes_watched || 0,
        engagement: s.engagement_score || 0,
      })),
    };
  },
};

// ======================================================
//  TREE — Streaming Coin Tree build + fetch
// ======================================================
export const tree = {
  async build({ streamId, branchRatios }) {
    const [stream, transactions, watchSessions] = await Promise.all([
      base44.entities.Stream.get(streamId).catch(() => null),
      base44.entities.Transaction.filter({ stream_id: streamId }).catch(() => []),
      base44.entities.WatchSession.filter({ stream_id: streamId }).catch(() => []),
    ]);

    if (!stream) throw new Error("Stream not found");

    const teamMembers = stream.creator_wallet
      ? await base44.entities.TeamMember.filter({ creator_wallet: stream.creator_wallet }).catch(() => [])
      : [];

    const branches = branchRatios
      ? Object.entries(branchRatios).map(([type, ratio]) => ({ type, ratio }))
      : DEFAULT_CONFIG.branches;

    const config = { ...DEFAULT_CONFIG, branches };
    return processStreamDistribution({ stream, transactions, watchSessions, teamMembers, config });
  },

  async get(streamId) {
    return base44.entities.CoinAllocation.filter({ stream_id: streamId }, "-created_date", 500);
  },
};

// ======================================================
//  AUTOSPLIT — execute payouts, fetch results
// ======================================================
export const autosplit = {
  async execute({ streamId }) {
    // Step 4: Build the tree
    const treeResult = await tree.build({ streamId });

    // Step 7: Persist allocations to the ledger
    const records = treeResult.allocations.map((a) => ({
      stream_id: a.streamId,
      branch_type: a.branchType,
      branch_id: a.branchId,
      account_id: a.accountId,
      account_name: a.accountName || "",
      weight: a.weight,
      normalized_weight: a.normalizedWeight,
      coins_allocated: a.coinsAllocated,
      usd_value: a.usdValue,
      status: "processed",
    }));
    if (records.length > 0) {
      await base44.entities.CoinAllocation.bulkCreate(records);
    }

    // Step 8: Update CoinAccount balances
    const balanceMap = {};
    treeResult.allocations.forEach((a) => {
      if (!a.accountId) return;
      if (!balanceMap[a.accountId]) balanceMap[a.accountId] = { coins: 0, streams: new Set() };
      balanceMap[a.accountId].coins += a.coinsAllocated;
      balanceMap[a.accountId].streams.add(a.streamId);
    });

    const accountUpdates = [];
    for (const [accountId, data] of Object.entries(balanceMap)) {
      const existing = await base44.entities.CoinAccount.filter({ account_id: accountId }).catch(() => []);
      if (existing.length > 0) {
        const acct = existing[0];
        accountUpdates.push(base44.entities.CoinAccount.update(acct.id, {
          balance_coins: (acct.balance_coins || 0) + data.coins,
          total_earned_coins: (acct.total_earned_coins || 0) + data.coins,
          streams_participated: (acct.streams_participated || 0) + data.streams.size,
        }));
      } else {
        accountUpdates.push(base44.entities.CoinAccount.create({
          account_id: accountId,
          balance_coins: data.coins,
          total_earned_coins: data.coins,
          streams_participated: data.streams.size,
        }));
      }
    }
    await Promise.all(accountUpdates);

    return {
      streamId,
      allocations: records.length,
      accountsUpdated: Object.keys(balanceMap).length,
      tree: treeResult,
    };
  },

  async results(streamId) {
    return base44.entities.CoinAllocation.filter({ stream_id: streamId }, "-created_date", 500);
  },
};

// ======================================================
//  WALLET — balances, withdrawals, deposits
// ======================================================
export const wallet = {
  async balance(accountId) {
    const accounts = await base44.entities.CoinAccount.filter({ account_id: accountId }).catch(() => []);
    if (accounts.length > 0) return accounts[0];
    return { account_id: accountId, balance_coins: 0, total_earned_coins: 0, total_paid_out_coins: 0, streams_participated: 0 };
  },

  async withdraw({ accountId, amount, destinationAddress }) {
    // Record the withdrawal as a Payout
    const cycle = new Date().toISOString().slice(0, 7);
    const payout = await base44.entities.Payout.create({
      creator_wallet: accountId,
      cycle,
      amount: coinsToUsd(amount),
      status: "pending",
    });

    // Decrement the CoinAccount balance
    const accounts = await base44.entities.CoinAccount.filter({ account_id: accountId }).catch(() => []);
    if (accounts.length > 0) {
      const acct = accounts[0];
      await base44.entities.CoinAccount.update(acct.id, {
        balance_coins: Math.max(0, (acct.balance_coins || 0) - amount),
        total_paid_out_coins: (acct.total_paid_out_coins || 0) + amount,
      });
    }
    return { payout, withdrawn: amount };
  },

  async deposit({ accountId, amount, source }) {
    const accounts = await base44.entities.CoinAccount.filter({ account_id: accountId }).catch(() => []);
    if (accounts.length > 0) {
      const acct = accounts[0];
      return base44.entities.CoinAccount.update(acct.id, {
        balance_coins: (acct.balance_coins || 0) + amount,
      });
    }
    return base44.entities.CoinAccount.create({
      account_id: accountId,
      balance_coins: amount,
      total_earned_coins: amount,
    });
  },
};

// ======================================================
//  ACCOUNTS — profile, history
// ======================================================
export const accounts = {
  async get(accountId) {
    // Try Web3Profile first, then CoinAccount
    const [profiles, coinAccounts] = await Promise.all([
      base44.entities.Web3Profile.filter({ wallet_address: accountId }).catch(() => []),
      base44.entities.CoinAccount.filter({ account_id: accountId }).catch(() => []),
    ]);
    return {
      accountId,
      profile: profiles[0] || null,
      wallet: coinAccounts[0] || null,
    };
  },

  async history(accountId) {
    const [allocations, sessions] = await Promise.all([
      base44.entities.CoinAllocation.filter({ account_id: accountId }, "-created_date", 100).catch(() => []),
      base44.entities.WatchSession.filter({ viewer_wallet: accountId }, "-created_date", 100).catch(() => []),
    ]);
    const totalCoins = allocations.reduce((sum, a) => sum + (a.coins_allocated || 0), 0);
    return {
      accountId,
      streamsParticipated: new Set(allocations.map((a) => a.stream_id)).size,
      totalCoinsEarned: totalCoins,
      allocations,
      watchSessions: sessions,
    };
  },
};

// ======================================================
//  CLUSTER — node + engine orchestration
// (Backend-dependent — stubs return placeholder data)
// ======================================================
export const cluster = {
  async nodes() {
    // Requires backend engine registry access
    return [
      { id: "engine-streams", status: "online", engines: ["web3Streams", "web3Watch"] },
      { id: "engine-store", status: "online", engines: ["web3Store", "web3Marketplace"] },
      { id: "engine-payments", status: "online", engines: ["create-checkout", "wix-payments-webhook"] },
    ];
  },

  async nodeRuntime(nodeId) {
    return { nodeId, runtimePlan: "active", netAmount: 0, engineOutputs: [] };
  },

  async rebalance() {
    // Requires backend cluster rebalancing
    return { status: "rebalance requested", note: "Requires Builder+ backend function" };
  },
};

// ======================================================
//  GOVERNANCE — charter, compliance, recovery
// ======================================================
export const governance = {
  async charter() {
    return DEFAULT_CONFIG.governance;
  },

  async complianceCheck(branches) {
    return validateBranchConfig(branches, DEFAULT_CONFIG.governance);
  },

  async recoveryExecute({ streamId, branchType, action }) {
    // Recovery engine: throttle or disable a specific branch under anomaly
    // For now, returns a recovery plan that the caller can apply
    return {
      streamId,
      branchType,
      action: action || "throttle",
      status: "recovery_plan_generated",
      note: "Apply by adjusting branch ratio to 0 and redistributing",
    };
  },
};

// ======================================================
//  TELEMETRY — stability, resilience, anomaly
// ======================================================
export const telemetry = {
  async get(streamId) {
    const [stream, sessions, transactions] = await Promise.all([
      base44.entities.Stream.get(streamId).catch(() => null),
      base44.entities.WatchSession.filter({ stream_id: streamId }).catch(() => []),
      base44.entities.Transaction.filter({ stream_id: streamId }).catch(() => []),
    ]);

    const viewers = new Set(sessions.map((s) => s.viewer_wallet)).size;
    const watchMinutes = sessions.reduce((sum, s) => sum + (s.minutes_watched || 0), 0);
    const engagement = sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0);
    const revenue = transactions
      .filter((t) => (t.status || "completed") === "completed")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Stability: revenue per viewer (higher = more stable income)
    const stability = viewers > 0 ? Math.min(1, revenue / (viewers * 10)) : 0;
    // Resilience: engagement relative to watch time
    const resilience = watchMinutes > 0 ? Math.min(1, engagement / watchMinutes) : 0;
    // Reliability: stream completed successfully
    const reliability = stream?.status === "ended" ? 1 : stream?.status === "live" ? 0.5 : 0;
    // Anomaly: low engagement or unusual revenue patterns
    const anomaly = viewers > 0 && engagement === 0 ? 1 : Math.max(0, 1 - stability - resilience);

    return { streamId, stability, resilience, reliability, anomaly, viewers, watchMinutes, engagement, revenue };
  },

  async update({ streamId, data }) {
    // Telemetry is computed on-demand from live data — no separate store needed.
    // This endpoint returns the freshly computed packet.
    return this.get(streamId);
  },
};

// ======================================================
//  TOKEN — Streaming Coin conversion
// ======================================================
export const token = {
  async rate() {
    return {
      coinValue: DEFAULT_CONFIG.coinValue,
      fiatRate: DEFAULT_CONFIG.coinValue,
      tokenRate: 1,
    };
  },

  async convert({ coins, to = "usd" }) {
    if (to === "usd") return { coins, value: coinsToUsd(coins) };
    if (to === "token") return { coins, value: coins }; // 1:1 with on-chain token
    return { coins, value: coinsToUsd(coins) };
  },

  async fromUsd({ usd }) {
    return { usd, coins: usdToCoins(usd) };
  },
};

// ======================================================
//  WEBHOOKS — handler functions (for backend wiring)
//  These are pure functions callable from backend functions
//  once the user upgrades to Builder+.
// ======================================================
export const webhooks = {
  async streamEnded({ streamId }) {
    await base44.entities.Stream.update(streamId, { status: "ended" });
    // Auto-run autosplit when stream ends
    return autosplit.execute({ streamId });
  },

  async payoutCompleted({ payoutId, txId }) {
    const payout = await base44.entities.Payout.get(payoutId).catch(() => null);
    if (!payout) return { status: "payout_not_found" };
    await base44.entities.Payout.update(payoutId, { status: "completed" });
    // Decrement the creator's CoinAccount
    const accts = await base44.entities.CoinAccount.filter({ account_id: payout.creator_wallet }).catch(() => []);
    if (accts.length > 0) {
      const acct = accts[0];
      await base44.entities.CoinAccount.update(acct.id, {
        balance_coins: Math.max(0, (acct.balance_coins || 0) - usdToCoins(payout.amount)),
        total_paid_out_coins: (acct.total_paid_out_coins || 0) + usdToCoins(payout.amount),
      });
    }
    return { status: "completed", payoutId, txId };
  },

  async viewerEarned({ viewerId, streamId, coins }) {
    const accts = await base44.entities.CoinAccount.filter({ account_id: viewerId }).catch(() => []);
    if (accts.length > 0) {
      const acct = accts[0];
      return base44.entities.CoinAccount.update(acct.id, {
        balance_coins: (acct.balance_coins || 0) + coins,
        total_earned_coins: (acct.total_earned_coins || 0) + coins,
      });
    }
    return base44.entities.CoinAccount.create({
      account_id: viewerId,
      balance_coins: coins,
      total_earned_coins: coins,
      streams_participated: 1,
    });
  },
};

// ======================================================
//  FULL PIPELINE — orchestrates the 10-step API flow
// ======================================================
export async function runPipeline({ streamId, branchRatios }) {
  // 1. Stream starts — assumed already started
  // 2. Revenue events — assumed already ingested
  // 3. Viewer metrics — assumed already ingested

  // 4. Tree build
  const treeResult = await tree.build({ streamId, branchRatios });

  // 5. Autosplit execute (includes steps 7–8: ledger + wallet updates)
  const autosplitResult = await autosplit.execute({ streamId });

  // 7. Telemetry update
  const telemetryData = await telemetry.get(streamId);

  // 8. Governance compliance check
  const branches = branchRatios
    ? Object.entries(branchRatios).map(([type, ratio]) => ({ type, ratio }))
    : DEFAULT_CONFIG.branches;
  const compliance = validateBranchConfig(branches, DEFAULT_CONFIG.governance);

  // 9. Recovery if needed (only if compliance fails)
  let recovery = null;
  if (!compliance.valid) {
    recovery = await governance.recoveryExecute({ streamId, action: "throttle" });
  }

  // 10. Cluster rebalance (stub — requires backend)
  const rebalance = await cluster.rebalance();

  return {
    streamId,
    tree: treeResult,
    autosplit: autosplitResult,
    telemetry: telemetryData,
    compliance,
    recovery,
    rebalance,
  };
}

// ======================================================
//  DEFAULT EXPORT — full API client
// ======================================================
export default {
  streams, revenue, metrics, tree, autosplit,
  wallet, accounts, cluster, governance, telemetry, token,
  webhooks, runPipeline,
};