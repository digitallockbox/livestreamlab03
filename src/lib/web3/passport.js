import { invoke } from "./client";

export const passport = {
  me: () => invoke("web3Passport", {}),
  get: (wallet_address) => invoke("web3Passport", { wallet_address }),
};