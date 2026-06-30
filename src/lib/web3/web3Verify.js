import { invoke } from "./client";

export const web3Verify = (level = "basic") => invoke("web3Verify", { level });