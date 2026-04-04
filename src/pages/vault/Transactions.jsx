import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Radio, Video, ShoppingBag, LinkIcon, Mic, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig = {
  stream_tip: { icon: Radio, label: "Stream Tip", color: "bg-primary/10 text-primary" },
  store_sale: { icon: ShoppingBag, label: "Store Sale", color: "bg-chart-4/10 text-chart-4" },
  affiliate: { icon: LinkIcon, label: "Affiliate", color: "bg-chart-5/10 text-chart-5" },
  video_unlock: { icon: Video, label: "Video Unlock", color: "bg-accent/10 text-accent" },
  audio_boost: { icon: Mic, label: "Audio Boost", color: "bg-chart-3/10 text-chart-3" },
  payout: { icon: Wallet, label: "Payout", color: "bg-primary/10 text-primary" },
};

const mockTransactions = [
  { id: 1, type: "stream_tip", description: "Tip from @viewer123", amount: 25.00, streaming_amount: 120, status: "completed", date: "2026-04-04" },
  { id: 2, type: "store_sale", description: "Preset Pack v2", amount: 24.99, streaming_amount: 0, status: "completed", date: "2026-04-03" },
  { id: 3, type: "video_unlock", description: "Premium Tutorial #5", amount: 9.99, streaming_amount: 50, status: "completed", date: "2026-04-03" },
  { id: 4, type: "affiliate", description: "Camera Gear Link", amount: 12.50, streaming_amount: 30, status: "completed", date: "2026-04-02" },
  { id: 5, type: "stream_tip", description: "Tip from @superfan", amount: 100.00, streaming_amount: 500, status: "completed", date: "2026-04-02" },
  { id: 6, type: "audio_boost", description: "Ep 14 Boost", amount: 5.00, streaming_amount: 25, status: "completed", date: "2026-04-01" },
  { id: 7, type: "payout", description: "Cycle 12 Payout", amount: -1847.00, streaming_amount: 0, status: "completed", date: "2026-03-31" },
];

export default function Transactions() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? mockTransactions : mockTransactions.filter((t) => t.type === filter);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">All CreatorVault transactions.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 bg-secondary border-border">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="stream_tip">Stream Tips</SelectItem>
            <SelectItem value="store_sale">Store Sales</SelectItem>
            <SelectItem value="video_unlock">Video Unlocks</SelectItem>
            <SelectItem value="affiliate">Affiliate</SelectItem>
            <SelectItem value="audio_boost">Audio Boosts</SelectItem>
            <SelectItem value="payout">Payouts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Description</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">$STREAMING</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((tx) => {
              const config = typeConfig[tx.type];
              const Icon = config.icon;
              return (
                <TableRow key={tx.id} className="border-border hover:bg-secondary/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", config.color)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{tx.description}</TableCell>
                  <TableCell className={cn("text-sm font-medium", tx.amount < 0 ? "text-destructive" : "text-foreground")}>
                    {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-accent">{tx.streaming_amount > 0 ? `+${tx.streaming_amount}` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-0 text-xs">
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}