// ======================================================
//  Streaming Coin Tree — Full Value Distribution Engine
//
//  Implements the complete processing pipeline:
//  1. Ingest revenue events → V_gross
//  2. Compute fees + platform share → V_distributable
//  3. Apply branch ratios → B_branch
//  4. Build leaf sets per branch
//  5. Normalize weights → ŵ_leaf = w / Σw
//  6. Compute coins per leaf → C_leaf = B_branch × ŵ_leaf
//  7. Return allocations (caller persists to ledger)
//
//  Core formulas:
//    V_distributable = V_gross − V_fees − V_platform_share
//    B_branch = V_distributable × r_branch   (Σ r_branch = 1)
//    ŵ_leaf = w_leaf / Σ w_j
//    C_leaf = B_branch × ŵ_leaf
//
//  Community participation:
//    p_i = α·t_i + β·e_i + γ·s_i
//    ŵ_i = p_i / P   (P = Σ p_i)
//    C_i = B_community × ŵ_i
// ======================================================

export const BRANCH_TYPES = {
  creator:   { label: "Creator",   defaultRatio: 0.60 },
  collab:    { label: "Collab",    defaultRatio: 0.15 },
  community: { label: "Community", defaultRatio: 0.25 },
  platform:  { label: "Platform",  defaultRatio: 0 },
  sponsor:   { label: "Sponsor",   defaultRatio: 0 },
  other:     { label: "Other",     defaultRatio: 0 },
};

export const DEFAULT_CONFIG = {
  feeRate: 0.03,
  platformRate: 0.05,
  coinValue: 0.01, // 1 Streaming Coin = $0.01
  communityWeights: {
    watchTime: 0.50,     // α
    engagement: 0.30,    // β
    subscription: 0.20,  // γ
  },
  governance: {
    minCommunityShare: 0.10,
    maxPlatformShare: 0.10,
    maxSponsorShare: 0.50,
  },
  branches: [
    { type: "creator",   ratio: 0.60 },
    { type: "collab",    ratio: 0.15 },
    { type: "community", ratio: 0.25 },
  ],
};

// --- Coin conversion ---
export const usdToCoins = (usd, config = DEFAULT_CONFIG) => usd / config.coinValue;
export const coinsToUsd = (coins, config = DEFAULT_CONFIG) => coins * config.coinValue;

// --- Step 1–2: Distributable value ---
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

// --- Step 3: Branch values (Σ B_branch = V_distributable) ---
export function computeBranchValues(distributable, branches = DEFAULT_CONFIG.branches) {
  const result = {};
  branches.forEach((b) => { result[b.type] = distributable * (b.ratio || 0); });
  return result;
}

// --- Step 4: Build leaf sets per branch ---

export function buildCreatorLeaves(stream) {
  return [{
    leafId: `creator-${stream.id}`,
    accountId: stream.creator_wallet,
    accountName: "Creator",
    weight: 1,
  }];
}

export function buildCollabLeaves(stream, teamMembers) {
  return (teamMembers || []).map((m, i) => ({
    leafId: `collab-${stream.id}-${i}`,
    accountId: m.email || m.name,
    accountName: m.name,
    weight: m.split_percentage || 0,
  }));
}

export function buildCommunityLeaves(stream, watchSessions, config = DEFAULT_CONFIG) {
  const w = config.communityWeights;
  return (watchSessions || []).map((ws) => {
    const t = ws.minutes_watched || 0;
    const e = ws.engagement_score || 0;
    const s = ws.subscription_tier || 1;
    const participationScore = w.watchTime * t + w.engagement * e + w.subscription * s;
    return {
      leafId: `viewer-${ws.viewer_wallet}`,
      accountId: ws.viewer_wallet,
      weight: participationScore,
      participationScore,
      minutesWatched: t,
      engagementScore: e,
      subscriptionTier: s,
    };
  });
}

export function buildGenericLeaves(stream, branch) {
  return [{
    leafId: `${branch.type}-${stream.id}`,
    accountId: branch.accountId || branch.type,
    accountName: branch.label || BRANCH_TYPES[branch.type]?.label || branch.type,
    weight: 1,
  }];
}

export function buildLeaves(branch, ctx) {
  const { stream, watchSessions, teamMembers, config } = ctx;
  switch (branch.type) {
    case "creator":   return buildCreatorLeaves(stream);
    case "collab":    return buildCollabLeaves(stream, teamMembers);
    case "community": return buildCommunityLeaves(stream, watchSessions, config);
    default:          return buildGenericLeaves(stream, branch);
  }
}

// --- Step 5: Normalize weights (ŵ = w / Σw) ---
export function normalizeLeafWeights(leaves) {
  const totalWeight = leaves.reduce((sum, l) => sum + (l.weight || 0), 0);
  if (totalWeight === 0) return leaves.map((l) => ({ ...l, normalizedWeight: 0 }));
  return leaves.map((l) => ({
    ...l,
    normalizedWeight: (l.weight || 0) / totalWeight,
  }));
}

// --- Step 6: Allocate coins (C_leaf = B_branch × ŵ_leaf) ---
export function allocateCoins(branchValue, leaves, config = DEFAULT_CONFIG) {
  return leaves.map((l) => ({
    ...l,
    coinsAllocated: branchValue * (l.normalizedWeight || 0),
    usdValue: branchValue * (l.normalizedWeight || 0),
    coins: usdToCoins(branchValue * (l.normalizedWeight || 0), config),
  }));
}

// --- Governance: validate branch config ---
export function validateBranchConfig(branches, governance = {}) {
  const errors = [];
  const sum = branches.reduce((s, b) => s + (b.ratio || 0), 0);
  if (Math.abs(sum - 1) > 0.001) {
    errors.push(`Branch ratios must sum to 1.0 (currently ${sum.toFixed(4)})`);
  }
  if (governance.minCommunityShare != null) {
    const community = branches.find((b) => b.type === "community");
    if (community && community.ratio < governance.minCommunityShare) {
      errors.push(`Community share must be ≥ ${(governance.minCommunityShare * 100)}% (currently ${(community.ratio * 100)}%)`);
    }
  }
  if (governance.maxPlatformShare != null) {
    const platform = branches.find((b) => b.type === "platform");
    if (platform && platform.ratio > governance.maxPlatformShare) {
      errors.push(`Platform share must be ≤ ${(governance.maxPlatformShare * 100)}% (currently ${(platform.ratio * 100)}%)`);
    }
  }
  if (governance.maxSponsorShare != null) {
    const sponsor = branches.find((b) => b.type === "sponsor");
    if (sponsor && sponsor.ratio > governance.maxSponsorShare) {
      errors.push(`Sponsor share must be ≤ ${(governance.maxSponsorShare * 100)}% (currently ${(sponsor.ratio * 100)}%)`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// --- Full pipeline (steps 1–7) ---
export function processStreamDistribution({ stream, transactions, watchSessions, teamMembers, config = DEFAULT_CONFIG }) {
  // Step 1: Ingest revenue events → V_gross
  let grossRevenue;
  if (transactions && transactions.length > 0) {
    grossRevenue = transactions
      .filter((t) => (t.status || "completed") === "completed")
      .reduce((sum, t) => sum + (t.amount || t.streaming_amount || 0), 0);
  } else {
    grossRevenue = stream.tips_earned || 0;
  }

  // Step 2: Compute fees + platform → V_distributable
  const valueBreakdown = computeDistributableValue(grossRevenue, config);

  // Step 3: Apply branch ratios → B_branch
  const branchValues = computeBranchValues(valueBreakdown.distributable, config.branches);

  // Steps 4–6: Build leaves, normalize, allocate
  const ctx = { stream, watchSessions, teamMembers, config };
  const branchResults = config.branches.map((branch) => {
    const rawLeaves = buildLeaves(branch, ctx);
    const normalizedLeaves = normalizeLeafWeights(rawLeaves);
    const allocatedLeaves = allocateCoins(branchValues[branch.type], normalizedLeaves, config);
    return {
      branchId: branch.type,
      streamId: stream.id,
      type: branch.type,
      label: BRANCH_TYPES[branch.type]?.label || branch.type,
      ratio: branch.ratio,
      branchValue: branchValues[branch.type],
      coins: usdToCoins(branchValues[branch.type], config),
      leaves: allocatedLeaves,
    };
  });

  // Flatten allocations for persistence (step 7 output)
  const allocations = branchResults.flatMap((b) =>
    b.leaves.map((leaf) => ({
      streamId: stream.id,
      branchType: b.type,
      branchId: b.branchId,
      accountId: leaf.accountId,
      accountName: leaf.accountName,
      weight: leaf.weight,
      normalizedWeight: leaf.normalizedWeight,
      coinsAllocated: leaf.coins,
      usdValue: leaf.usdValue,
    }))
  );

  return {
    stream: { id: stream.id, title: stream.title, creator_wallet: stream.creator_wallet },
    valueBreakdown: {
      ...valueBreakdown,
      grossCoins: usdToCoins(grossRevenue, config),
      distributableCoins: usdToCoins(valueBreakdown.distributable, config),
    },
    branches: branchResults,
    allocations,
    totalLeaves: allocations.length,
  };
}