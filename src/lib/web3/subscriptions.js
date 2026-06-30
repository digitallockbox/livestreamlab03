import { invoke } from "./client";

export const subscriptions = {
  subscribe: (subscriberWallet, creatorWallet, tier) =>
    invoke("web3Subscriptions", { action: "subscribe", subscriberWallet, creatorWallet, tier }),
  list: (wallet) => invoke("web3Subscriptions", { action: "list", wallet }),
};