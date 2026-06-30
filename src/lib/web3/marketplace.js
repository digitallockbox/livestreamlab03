import { invoke } from "./client";

export const marketplace = {
  add: (creatorWallet, data) =>
    invoke("web3Marketplace", { action: "add", creatorWallet, ...data }),
  list: (creatorWallet) => invoke("web3Marketplace", { action: "list", creatorWallet }),
  sales: (creatorWallet) => invoke("web3Marketplace", { action: "sales", creatorWallet }),
  buy: (buyerWallet, productId) => invoke("web3Marketplace", { action: "buy", buyerWallet, productId }),
};