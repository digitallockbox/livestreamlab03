// Platform identity config for LiveStreamLab Creator OS.
// Single source of truth for TLD, platform wallets, STREAMING token metadata,
// and the token-gate threshold. Mirrors the on-chain identity resolver map.
//
// The backend (web3Login) reads STREAMING_MINT + SOLANA_RPC from secrets;
// this module is the frontend counterpart for display and reference.

export const PLATFORM_TLD = ".livestreamlab";
export const PLATFORM_DOMAIN = "livestreamlab.live";
export const PLATFORM_CHAIN = "solana";

// Platform-level wallets (Solana mainnet)
export const AUTHORITY_WALLET_SOL = "8jExKCc1Y4LEjVjBLRGZEeY7vWBVzr9iTPRKh8Jzmoon";
export const LIQUIDITY_WALLET_SOL = "3q8k2gsxbKiDRmUhb11crs2PyPGNmPVK2ivr1upJByXU";

// Seeded creator identity (first creator on the platform)
export const CREATOR_IDENTITY = "anthonysimmons.livestreamlab";
export const CREATOR_WALLET_EVM = "0x7981B5f7ef379250dCd023f0A2681F07E85c19F9";

// Token gate: minimum STREAMING balance for gated platform access
export const TOKEN_GATE_MIN_BALANCE = 1;

// Identity resolver map (for display / reference)
export const IDENTITY_RESOLVER_MAP = {
  tld: PLATFORM_TLD,
  platform: {
    domain: PLATFORM_DOMAIN,
    authorityWalletSol: AUTHORITY_WALLET_SOL,
    liquidityWalletSol: LIQUIDITY_WALLET_SOL,
  },
  creators: [
    {
      identity: CREATOR_IDENTITY,
      walletEvm: CREATOR_WALLET_EVM,
      role: "creator",
      status: "active",
    },
  ],
  tokens: [
    {
      name: "Livestream Lab",
      symbol: "STREAMING",
      chain: PLATFORM_CHAIN,
      mint: "8jExKCc1Y4LEjVjBLRGZEeY7vWBVzr9iTPRKh8Jzmoon",
      decimals: 6,
      liquidityWalletSol: LIQUIDITY_WALLET_SOL,
    },
  ],
};