import { invoke } from "./client";

export const web3Login = (wallet_address, ens_name) =>
  invoke("web3Login", { wallet_address, ens_name });