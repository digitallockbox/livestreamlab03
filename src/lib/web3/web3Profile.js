import { invoke } from "./client";

export const web3Profile = {
  me: () => invoke("web3Profile", { action: "me" }),
  get: (wallet_address) => invoke("web3Profile", { action: "get", wallet_address }),
  update: (data) => invoke("web3Profile", { action: "update", ...data }),
};