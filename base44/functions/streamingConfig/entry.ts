import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public config endpoint: returns the real $STREAMING SPL mint + decimals + RPC.
// The mint address is public on-chain data, so no auth is required here.
Deno.serve(async (req) => {
  try {
    // Initialize the SDK (not strictly needed for env reads, but keeps the client warm).
    createClientFromRequest(req);

    const mint = Deno.env.get("STREAMING_MINT");
    const decimalsRaw = Deno.env.get("STREAMING_DECIMALS");
    const decimals = decimalsRaw ? parseInt(decimalsRaw, 10) : 9;

    if (!mint) {
      return Response.json(
        { error: "STREAMING_MINT not configured. Set it in Settings → Environment Variables." },
        { status: 503 }
      );
    }
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 12) {
      return Response.json(
        { error: "STREAMING_DECIMALS must be an integer between 0 and 12. Current value is invalid: " + String(decimalsRaw) },
        { status: 503 }
      );
    }

    return Response.json({
      mint,
      decimals,
      rpc: "https://api.mainnet-beta.solana.com",
      symbol: "STREAMING",
    });
  } catch (error) {
    console.error("streamingConfig error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});