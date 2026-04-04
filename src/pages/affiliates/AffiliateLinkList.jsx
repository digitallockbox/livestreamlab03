import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Link2, Copy, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { id: 1, title: "StreamDeck Affiliate", url: "https://go.example.com/streamdeck", category: "Gear", clicks: 1240, commission: 142.00, status: "active" },
  { id: 2, title: "Elgato Gear Link", url: "https://go.example.com/elgato", category: "Gear", clicks: 890, commission: 98.50, status: "active" },
  { id: 3, title: "Editing Software", url: "https://go.example.com/editor", category: "Software", clicks: 320, commission: 44.00, status: "paused" },
];

export default function AffiliateLinkList() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Affiliate Links</h1>
          <p className="text-muted-foreground mt-1">Manage all your affiliate links.</p>
        </div>
        <Link to="/affiliates/add">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Add Link</Button>
        </Link>
      </div>
      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-sm">{link.title}</p>
                  <Badge className={`text-xs border-0 ${link.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{link.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{link.category} · {link.clicks} clicks · ${link.commission.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost"><Copy className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}