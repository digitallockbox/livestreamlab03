import { invoke } from "./client";

export const badges = {
  upgrade: (tier) => invoke("web3Badges", { tier }),
  next: () => invoke("web3Badges", {}),
};