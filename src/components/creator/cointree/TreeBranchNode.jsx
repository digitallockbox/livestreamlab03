import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

const fmtCoins = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtUsd = (n) => `$${Number(n || 0).toFixed(2)}`;
const pct = (r) => `${Math.round((r || 0) * 100)}%`;

export default function TreeBranchNode({ branch, expanded, onToggle }) {
  const visibleLeaves = (branch.leaves || []).slice(0, 10);
  const overflow = (branch.leaves?.length || 0) - visibleLeaves.length;

  return (
    <div className="rounded-xl border border-border bg-secondary/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className="font-display font-semibold text-sm capitalize flex-1 text-left truncate">
          {branch.label || branch.type}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">
          {pct(branch.ratio)}
        </span>
        <span className="text-accent font-display font-bold text-sm shrink-0">
          {fmtCoins(branch.coins)} ◎
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">
          {fmtUsd(branch.branchValue)}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-1">
          {visibleLeaves.length === 0 ? (
            <p className="text-xs text-muted-foreground pl-6 py-1">No leaves in this branch.</p>
          ) : (
            visibleLeaves.map((leaf, i) => (
              <Link
                key={`${leaf.leafId}-${i}`}
                to={leaf.streamId ? `/cointree/${leaf.streamId}` : "/streams"}
                className="flex items-center justify-between text-sm pl-6 pr-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <div className="truncate min-w-0">
                  <span className="font-mono text-xs">
                    {leaf.accountId ? `${leaf.accountId.slice(0, 14)}${leaf.accountId.length > 14 ? "…" : ""}` : "—"}
                  </span>
                  {leaf.participationScore != null && (
                    <span className="text-xs text-muted-foreground ml-1.5">
                      p={leaf.participationScore.toFixed(2)}
                    </span>
                  )}
                  {leaf.streamTitle && (
                    <span className="text-xs text-muted-foreground ml-1.5 truncate hidden sm:inline">
                      · {leaf.streamTitle}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {fmtUsd(leaf.usdValue)}
                  </span>
                  <span className="text-accent font-medium text-sm">
                    {fmtCoins(leaf.coins || leaf.coinsAllocated)} ◎
                  </span>
                </div>
              </Link>
            ))
          )}
          {overflow > 0 && (
            <p className="text-xs text-muted-foreground text-center pt-1">+{overflow} more</p>
          )}
        </div>
      )}
    </div>
  );
}