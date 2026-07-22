import React, { useEffect, useState } from "react";
import { ImageIcon, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/creator/os";
import { useIdentity } from "@/lib/web3/identity";
import { useViewerWallet } from "@/components/creator/os";

// NftMintPanel — shows the just-minted cover NFT metadata (image, title, mint
// address, on-chain status) and the per-stream mint history, pulled from the
// signed web3Nft "list" action filtered to the active stream.
export default function NftMintPanel({ stream, coverImage, mintedNft, nftStatus }) {
  const viewerWallet = useViewerWallet();
  const { signedInvoke } = useIdentity();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!viewerWallet || !stream?.id) return;
    setLoading(true);
    try {
      const res = await signedInvoke("web3Nft", { action: "list", creatorWallet: viewerWallet });
      setHistory((res?.nfts || []).filter((n) => n.stream_id === stream.id));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream?.id, mintedNft?.id]);

  const current = mintedNft || history[0];

  return (
    <Card className="space-y-3">
      <h2 className="font-display font-semibold text-sm flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-primary" /> Photo NFT
      </h2>

      {/* Minted NFT preview + metadata */}
      {current ? (
        <div className="flex gap-3">
          {coverImage ? (
            <img src={coverImage.url} alt="NFT" className="h-20 w-20 rounded-lg object-cover border border-border" />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
          )}
          <div className="min-w-0 text-xs space-y-1">
            <p className="font-medium truncate">{current.title || stream?.title || "Untitled"}</p>
            <p className="text-muted-foreground break-all">Mint: <span className="font-mono">{current.mint_address || "—"}</span></p>
            <p className="flex items-center gap-1 text-accent"><CheckCircle2 className="w-3 h-3" /> {current.mint_status || "minted"}</p>
            <p className="text-[10px] text-muted-foreground">Off-chain ledger · on-chain SPL settlement pending</p>
          </div>
        </div>
      ) : nftStatus === "error" ? (
        <p className="text-xs text-destructive inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Mint failed. You can retry from the upload panel.</p>
      ) : coverImage ? (
        <p className="text-xs text-amber-500">Cover queued. NFT mints when you go live.</p>
      ) : (
        <p className="text-xs text-muted-foreground">Upload a cover photo to mint an NFT for this stream.</p>
      )}

      {/* Per-stream mint history */}
      {history.length > 0 && (
        <div className="border-t border-border pt-2">
          <p className="text-[11px] text-muted-foreground mb-1">Mint history for this stream ({history.length})</p>
          <div className="space-y-1.5">
            {history.map((n) => (
              <div key={n.id} className="flex items-center gap-2 text-xs">
                <img src={n.image_url} alt="" className="h-7 w-7 rounded object-cover" />
                <span className="font-mono text-[10px] text-muted-foreground truncate flex-1">{n.mint_address}</span>
                <span className="text-[10px] text-accent capitalize">{n.mint_status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}