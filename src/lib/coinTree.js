// ======================================================
//  Streaming Coin Tree — Value Distribution Engine
//
//  Root:   the Stream (total distributable value)
//  Branches: creator, collab, community
//  Leaves:  individual recipients (creator wallet, team members, viewers)
//
//  V_distributable = V_gross - V_fees - V_platform
//  B_branch = V_distributable × r_branch
//  coins_user = B_branch × w_user
// ======================================================

export const DEFAULT_CONFIG = {
  feeRate: 0.03,       // 3% processing fee
  platformRate: 0.05,  // 5% platform share
  branchRates: {
    creator: 0.60,      // 60% to creator
    collab: 0.15,       // 15% to collaborators
    community: 0.25,    // 25% to community
  },
  coinValue: 0.01,     // 1 Streaming Coin = $0.01
  communityWeights: {
    watchTime: 0.50,    // α — watch time weight
    engagement: 0.30,   // β — engagement weight
    subscription: 0.20, // γ — subscription tier weight
  },
};

// --- Core formulas ---

export function computeDistributableValue(grossRevenue, config = DEFAULT_CONFIG) {
  const fees = grossRevenue * config.feeRate;
  const platformShare = grossRevenue * config.platformRate;
  return {
    gross: grossRevenue,
    fees,
    platformShare,
    distributable: Math.max(0, grossRevenue - fees - platformShare),
  };
}

export function computeBranchAllocations(distributable, config = DEFAULT_CONFIG) {
  const r = config.branchRates;
  return {
    creator: distributable * r.creator,
    collab: distributable * r.collab,
    community: distributable * r.community,
  };
}

// Collab branch: split by agreed percentages across team members.
// teamMembers: [{ name, split_percentage }]
export function computeCollabShares(collabBranch, teamMembers) {
  const members = teamMembers || [];
  const totalPct = members.reduce((sum, m) => sum + (m.split_percentage || 0), 0);
  if (totalPct === 0) {
    return [{ name: "Creator (fallback)", percentage: 100, amount: collabBranch }];
  }
  return members.map((m) => ({
    name: m.name,
    percentage: m.split_percentage,
    amount: collabBranch * (m.split_percentage / 100),
  }));
}

// Community branch: split by participation score.
//   p_i = α·t_i + β·e_i + γ·s_i
//   coins_i = B_community × (p_i / P)
// participants: [{ viewer_wallet, minutes_watched, engagement_score, subscription_tier }]
export function computeCommunityShares(communityBranch, participants, config = DEFAULT_CONFIG) {
  const w = config.communityWeights;
  const scored = (participants || []).map((p) => {
    const t = p.minutes_watched || 0;
    const e = p.engagement_score || 0;
    const s = p.subscription_tier || 1;
    const participationScore = w.watchTime * t + w.engagement * e + w.subscription * s;
    return { ...p, participationScore };
  });

  const totalScore = scored.reduce((sum, p) => sum + p.participationScore, 0);
  if (totalScore === 0) return scored.map((p) => ({ ...p, share: 0, amount: 0 }));

  return scored
    .map((p) => ({
      ...p,
      share: p.participationScore / totalScore,
      amount: communityBranch * (p.participationScore / totalScore),
    }))
    .sort((a, b) => b.amount - a.amount);
}

// --- Coin helpers ---

export const usdToCoins = (usd, config = DEFAULT_CONFIG) => usd / config.coinValue;
export const coinsToUsd = (coins, config = DEFAULT_CONFIG) => coins * config.coinValue;

// --- Full tree ---

export function computeFullTree({ stream, transactions, watchSessions, teamMembers, config = DEFAULT_CONFIG }) {
  // Gross revenue: sum of completed transactions linked to this stream,
  // falling back to stream.tips_earned when no per-stream transactions exist.
  let grossRevenue;
  if (transactions && transactions.length > 0) {
    grossRevenue = transactions
      .filter((t) => (t.status || "completed") === "completed")
      .reduce((sum, t) => sum + (t.amount || t.streaming_amount || 0), 0);
  } else {
    grossRevenue = stream.tips_earned || 0;
  }

  const valueBreakdown = computeDistributableValue(grossRevenue, config);
  const branches = computeBranchAllocations(valueBreakdown.distributable, config);

  // Creator branch → single leaf
  const creatorLeaf = {
    wallet: stream.creator_wallet,
    amount: branches.creator,
    coins: usdToCoins(branches.creator, config),
  };

  // Collab branch → team member leaves
  const collabLeaves = computeCollabShares(branches.collab, teamMembers).map((m) => ({
    ...m,
    coins: usdToCoins(m.amount, config),
  }));

  // Community branch → viewer leaves by participation score
  const participants = (watchSessions || []).map((ws) => ({
    viewer_wallet: ws.viewer_wallet,
    minutes_watched: ws.minutes_watched || 0,
    engagement_score: ws.engagement_score || 0,
    subscription_tier: ws.subscription_tier || 1,
  }));
  const communityLeaves = computeCommunityShares(branches.community, participants, config).map((p) => ({
    ...p,
    coins: usdToCoins(p.amount, config),
  }));

  return {
    stream: {
      id: stream.id,
      title: stream.title,
      creator_wallet: stream.creator_wallet,
    },
    valueBreakdown: {
      ...valueBreakdown,
      grossCoins: usdToCoins(grossRevenue, config),
      distributableCoins: usdToCoins(valueBreakdown.distributable, config),
    },
    branches: {
      creator: { amount: branches.creator, coins: creatorLeaf.coins, leaves: [creatorLeaf] },
      collab: { amount: branches.collab, coins: usdToCoins(branches.collab, config), leaves: collabLeaves },
      community: { amount: branches.community, coins: usdToCoins(branches.community, config), leaves: communityLeaves },
    },
    totalLeaves: 1 + collabLeaves.length + communityLeaves.length,
  };
}