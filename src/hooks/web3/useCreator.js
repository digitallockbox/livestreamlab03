import { useIdentity } from "@/lib/web3/identity";

// useCreator — the creator's Web3Profile is already loaded into the identity
// session by the wallet handshake (web3Login verify). Wallet-only creators have
// no Base44 session, so we read from the session instead of web3Profile.me().
export function useCreator() {
  const { session, refreshProfile } = useIdentity();
  return {
    profile: session,
    loading: !session,
    error: null,
    refresh: refreshProfile,
  };
}