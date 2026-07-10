/**
 * React hook that ties together the full Base44 identity system:
 *   base44Packet     → Phantom signing + packet building
 *   creatorIdentity  (Module C) → creator IDs, routes, URLs
 *   autosplitIdentity(Module D) → autosplit IDs, routes, configs
 *   tokenIdentity    (Module E) → $STREAMING token namespace
 *   creatorStorage   (Module F) → storage tree + integrity checks
 *   autosplitEngine  (Module G) → payout calculation, preview, execute
 *
 * Uses the existing useIdentity() context for the connected wallet address
 * so the Base44 packet can be built from an already-connected Phantom session.
 */
import { useState, useEffect, useCallback } from "react";
import { useIdentity } from "@/lib/web3/identity";
import { base44Api } from "@/lib/tridentApi";
import { prepareBase44Login, buildBase44Packet, signNonceWithPhantom, generateNonce } from "@/lib/web3/base44Packet";
import { getCreatorIdentity } from "@/lib/web3/creatorIdentity";
import { getAutoSplitIdentity, getDefaultAutoSplitConfig, validateAutoSplitConfig } from "@/lib/web3/autosplitIdentity";
import { getTokenIdentity } from "@/lib/web3/tokenIdentity";
import { getCreatorStorageTree as getStorageTree, checkStorageIntegrity as checkStorage } from "@/lib/web3/creatorStorage";
import { previewPayout, executePayout, validateRules } from "@/lib/web3/autosplitEngine";

export function useBase44Identity() {
  const { walletAddress, chain } = useIdentity();
  const [creator, setCreator] = useState(null);
  const [autosplit, setAutosplit] = useState(null);
  const [token, setToken] = useState(null);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Derive creator, autosplit, and token identities whenever the wallet connects.
  useEffect(() => {
    if (!walletAddress) {
      setCreator(null);
      setAutosplit(null);
      setToken(null);
      setStorage(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const [ci, ai, ti] = await Promise.all([
          getCreatorIdentity(walletAddress),
          getAutoSplitIdentity(walletAddress),
          getTokenIdentity(walletAddress),
        ]);
        if (!active) return;
        setCreator(ci);
        setAutosplit(ai);
        setToken(ti);
        setStorage(getStorageTree(ci.creator_id));
      } catch (e) {
        console.warn("Base44 identity derivation failed:", e?.message || e);
      }
    })();
    return () => { active = false; };
  }, [walletAddress]);

  /**
   * Full Base44 login flow:
   *   1. Connect Phantom (if not already connected)
   *   2. Sign a nonce
   *   3. Build the Base44 packet
   *   4. Send to backend via base44Api.login()
   *   5. Derive creator + autosplit identities from the response
   */
  const base44Login = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let packet, wallet;
      if (walletAddress) {
        // Already connected — sign with the existing Phantom session.
        const nonce = generateNonce();
        const { signature } = await signNonceWithPhantom(nonce);
        wallet = walletAddress;
        packet = buildBase44Packet(wallet, signature, nonce);
      } else {
        // Fresh connection.
        const result = await prepareBase44Login();
        packet = result.packet;
        wallet = result.wallet;
      }

      const res = await base44Api.login(packet);

      // Derive identities from the resolved wallet.
      const [ci, ai, ti] = await Promise.all([
        getCreatorIdentity(wallet),
        getAutoSplitIdentity(wallet),
        getTokenIdentity(wallet),
      ]);
      setCreator(ci);
      setAutosplit(ai);
      setToken(ti);
      setStorage(getStorageTree(ci.creator_id));

      return { res, wallet, packet, creator: ci, autosplit: ai, token: ti };
    } catch (e) {
      const msg = e?.message || "Base44 login failed";
      setError(msg);
      console.warn("Base44 login failed:", msg, e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  /**
   * Update the autosplit config (validates percentages before sending).
   */
  const updateAutoSplit = useCallback(async (config) => {
    if (!autosplit) return null;
    const validation = validateAutoSplitConfig(config);
    if (!validation.valid) {
      setError(validation.error);
      return null;
    }
    setError("");
    try {
      const res = await base44Api.updateAutosplit({
        autosplit_id: autosplit.autosplit_id,
        config,
      });
      return res;
    } catch (e) {
      setError(e?.message || "Failed to update autosplit config");
      return null;
    }
  }, [autosplit]);

  /**
   * Preview an autosplit payout locally (pure) + via backend.
   */
  const previewAutoSplit = useCallback((config, amount) => {
    const local = previewPayout(config, amount);
    return base44Api.autosplitPreview({ amount }).catch(() => local);
  }, []);

  /**
   * Execute an autosplit payout — calculates locally, stores on backend.
   */
  const executeAutoSplit = useCallback(async (config, amount) => {
    if (!autosplit) return null;
    setError("");
    try {
      const localResult = executePayout(config, amount);
      const res = await base44Api.autosplitExecute({ amount });
      return res || localResult;
    } catch (e) {
      setError(e?.message || "Failed to execute autosplit payout");
      return null;
    }
  }, [autosplit]);

  /**
   * Check storage integrity against expected paths.
   */
  const checkStorageIntegrity = useCallback(() => {
    if (!storage) return { ok: false, missing: ["storage"] };
    return checkStorage(storage);
  }, [storage]);

  return {
    wallet: walletAddress,
    chain,
    creator,
    autosplit,
    token,
    storage,
    loading,
    error,
    base44Login,
    updateAutoSplit,
    previewAutoSplit,
    executeAutoSplit,
    checkStorageIntegrity,
    defaultAutoSplitConfig: walletAddress ? getDefaultAutoSplitConfig(walletAddress) : null,
  };
}