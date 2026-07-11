/**
 * IdentityGate — guards OS routes.
 *
 * Renders children only if a wallet is connected AND a verified session exists.
 * Otherwise redirects to the appropriate pre-auth screen:
 *   - No wallet → /enter (wallet connection screen)
 *   - Wallet but no session → /verify (nonce-signing screen)
 *
 * Usage as a layout route:
 *   <Route element={<IdentityGate />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     ...
 *   </Route>
 */
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useIdentity } from "@/lib/web3/identity";

export default function IdentityGate() {
  const { walletAddress, session } = useIdentity();

  if (!walletAddress) return <Navigate to="/enter" replace />;
  if (!session) return <Navigate to="/verify" replace />;

  return <Outlet />;
}