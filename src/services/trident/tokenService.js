import { usdToCoins, coinsToUsd, DEFAULT_CONFIG } from "@/lib/coinTree";

export const tokenService = {
  async getRate() {
    return { coinValue: DEFAULT_CONFIG.coinValue, fiatRate: DEFAULT_CONFIG.coinValue, tokenRate: 1 };
  },
  async convert({ coins, to = "usd" }) {
    if (to === "usd") return { coins, value: coinsToUsd(coins) };
    return { coins, value: coins };
  },
  async fromUsd({ usd }) {
    return { usd, coins: usdToCoins(usd) };
  },
};