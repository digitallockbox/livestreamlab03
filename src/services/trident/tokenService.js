import { base44 } from "@/api/base44Client";
import { usdToCoins, coinsToUsd, DEFAULT_CONFIG } from "@/lib/coinTree";
import { fetchJSON } from "./http";

export const tokenService = {
  // GET /token/rate → { coinValue, fiatRate, tokenRate }
  async getRate() {
    const http = await fetchJSON("/token/rate", { method: "GET" });
    if (!http.error && http.coinValue) return http;
    return { coinValue: DEFAULT_CONFIG.coinValue, fiatRate: DEFAULT_CONFIG.coinValue, tokenRate: 1 };
  },

  // GET /token/usage → { wallet, tenant, tokensUsed, tokensRemaining }
  async getUsage(wallet) {
    const http = await fetchJSON("/token/usage", { method: "GET" });
    if (!http.error && http.tokensUsed !== undefined) return http;
    if (!wallet) return { wallet: "", tenant: "livestreamlab", tokensUsed: 0, tokensRemaining: 0 };
    const accounts = await base44.entities.CoinAccount.filter({ account_id: wallet }).catch(() => []);
    const acct = accounts[0];
    const balance = acct?.balance_coins || 0;
    const total = acct?.total_earned_coins || 0;
    return { wallet, tenant: "livestreamlab", tokensUsed: total - balance, tokensRemaining: balance };
  },

  // POST /token/issue → { issued, newBalance }
  async issue(wallet, amount) {
    const http = await fetchJSON("/token/issue", { method: "POST", body: JSON.stringify({ wallet, amount }) });
    if (!http.error && http.issued !== undefined) return http;
    const accounts = await base44.entities.CoinAccount.filter({ account_id: wallet }).catch(() => []);
    if (accounts.length > 0) {
      const acct = accounts[0];
      const newBalance = (acct.balance_coins || 0) + amount;
      await base44.entities.CoinAccount.update(acct.id, { balance_coins: newBalance, total_earned_coins: (acct.total_earned_coins || 0) + amount });
      return { issued: amount, newBalance };
    }
    await base44.entities.CoinAccount.create({ account_id: wallet, balance_coins: amount, total_earned_coins: amount, streams_participated: 0 });
    return { issued: amount, newBalance: amount };
  },

  async convert({ coins, to = "usd" }) {
    if (to === "usd") return { coins, value: coinsToUsd(coins) };
    return { coins, value: coins };
  },

  async fromUsd({ usd }) {
    return { usd, coins: usdToCoins(usd) };
  },
};