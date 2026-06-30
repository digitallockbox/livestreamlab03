import { invoke } from "./client";

export const boosts = {
  send: (viewerWallet, creatorWallet, amount, message = "", stream_id = "") =>
    invoke("web3Boosts", { action: "send", viewerWallet, creatorWallet, amount, message, stream_id }),
  list: (wallet) => invoke("web3Boosts", { action: "list", wallet }),
};