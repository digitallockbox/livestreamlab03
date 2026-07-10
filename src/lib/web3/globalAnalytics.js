/**
 * Global Creator Analytics Engine — Module K
 *
 * Platform-wide analytics aggregated across all creators, built on top of
 * the Global Identity Index (Module I). Provides cross-creator leaderboards,
 * revenue breakdowns, growth trends, and distribution stats.
 *
 * Fail-open: if the backend analytics endpoint is unavailable, computes
 * analytics locally from Base44 entities.
 */
import { base44Api } from '@/lib/tridentApi';
import { base44 } from '@/api/base44Client';

// ─── Local fail-open computation from Base44 entities ─────────────────────

async function computeLocally() {
  const [profiles, txns, streams, boosts] = await Promise.all([
    base44.entities.Web3Profile.list('-created_date', 500).catch(() => []),
    base44.entities.Transaction.filter({ status: 'completed' }, '-created_date', 500).catch(() => []),
    base44.entities.Stream.list('-created_date', 500).catch(() => []),
    base44.entities.Boost.list('-created_date', 200).catch(() => []),
  ]);

  const totalCreators = profiles.length;
  const onboarded = profiles.filter((p) => p.onboarding_completed).length;
  const verified = profiles.filter((p) => p.verified).length;

  // Badge tier distribution
  const badgeTiers = { bronze: 0, silver: 0, gold: 0, diamond: 0 };
  for (const p of profiles) badgeTiers[p.badge_tier || 'bronze']++;

  // Revenue by source — streams measured in $STREAMING, others in USD
  const revenueBySource = { streams: 0, store: 0, affiliate: 0, subscription: 0, other: 0 };
  for (const t of txns) {
    const amt = Number(t.amount) || 0;
    const streaming = Number(t.streaming_amount) || 0;
    switch (t.type) {
      case 'stream_tip':
      case 'audio_boost':
      case 'podcast':
        revenueBySource.streams += streaming || amt;
        break;
      case 'store_sale':
      case 'video_unlock':
        revenueBySource.store += amt;
        break;
      case 'affiliate':
        revenueBySource.affiliate += amt;
        break;
      case 'subscription':
        revenueBySource.subscription += amt;
        break;
      default:
        revenueBySource.other += amt;
    }
  }
  const totalRevenue =
    revenueBySource.store + revenueBySource.affiliate + revenueBySource.subscription + revenueBySource.other;
  const totalStreamingDistributed =
    boosts.reduce((s, b) => s + (Number(b.amount) || 0), 0) + revenueBySource.streams;

  // Top creators by earnings
  const earningsByWallet = new Map();
  for (const t of txns) {
    const w = t.recipient_wallet;
    if (!w) continue;
    const amt = t.streaming_amount ? Number(t.streaming_amount) : Number(t.amount) || 0;
    earningsByWallet.set(w, (earningsByWallet.get(w) || 0) + amt);
  }
  const profileMap = new Map(profiles.map((p) => [p.wallet_address, p]));
  const topCreators = [...earningsByWallet.entries()]
    .map(([wallet, earnings]) => {
      const p = profileMap.get(wallet);
      return {
        wallet,
        display_name: p?.display_name || p?.ens_name || `${wallet.slice(0, 6)}…${wallet.slice(-4)}`,
        avatar_url: p?.avatar_url,
        badge_tier: p?.badge_tier || 'bronze',
        verified: p?.verified || false,
        earnings,
      };
    })
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 10);

  // Stream stats
  const liveStreams = streams.filter((s) => s.status === 'live').length;
  const totalViewers = streams.reduce((s, st) => s + (Number(st.viewer_count) || 0), 0);
  const categoryDist = {};
  for (const s of streams) {
    const c = s.category || 'other';
    categoryDist[c] = (categoryDist[c] || 0) + 1;
  }

  // Top streams by viewer count
  const topStreams = [...streams]
    .sort((a, b) => (Number(b.viewer_count) || 0) - (Number(a.viewer_count) || 0))
    .slice(0, 5)
    .map((s) => ({
      title: s.title,
      viewer_count: Number(s.viewer_count) || 0,
      creator_wallet: s.creator_wallet,
      creator_name: profileMap.get(s.creator_wallet)?.display_name || 'Unknown',
    }));

  return {
    totalCreators,
    onboarded,
    verified,
    badgeTiers,
    revenueBySource,
    totalRevenue,
    totalStreamingDistributed,
    topCreators,
    liveStreams,
    totalViewers,
    categoryDist,
    topStreams,
    totalTransactions: txns.length,
    totalStreams: streams.length,
    computed_at: new Date().toISOString(),
  };
}

// ─── Public API ────────────────────────────────────────────────────────────

export const globalAnalytics = {
  async getOverview() {
    try {
      return await base44Api.globalOverview();
    } catch {
      return computeLocally();
    }
  },

  async getLeaderboard(type = 'earnings') {
    try {
      return await base44Api.globalLeaderboard(type);
    } catch {
      const overview = await computeLocally();
      return { type, entries: overview.topCreators };
    }
  },
};