import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Play, Heart, Share2, Zap, MessageSquare, Bell, Eye, ThumbsUp,
  ChevronDown, ChevronUp, Send, Lock
} from "lucide-react";
import { Link } from "react-router-dom";

const MOCK_COMMENTS = [
  { user: "creator_fan", comment: "This is exactly what I needed! Incredibly detailed breakdown.", time: "1h ago", likes: 24 },
  { user: "tech_wizard99", comment: "What monitor are you using? The colour accuracy looks insane.", time: "3h ago", likes: 11 },
  { user: "beginner_dev", comment: "Super helpful — I've watched this 3 times already. Thanks!", time: "5h ago", likes: 8 },
  { user: "Mariana_Creates", comment: "The section about audio routing alone was worth it. 🔥", time: "8h ago", likes: 19 },
  { user: "StreamNerd", comment: "Bookmarking this for when I set up my studio.", time: "12h ago", likes: 5 },
];

const RECOMMENDED = [
  { id: 2, title: "Advanced Editing Tutorial — Pro Techniques", views: "3.4K", isPremium: true },
  { id: 3, title: "Behind the Scenes: Studio Tour", views: "8.9K", isPremium: false },
  { id: 5, title: "Collab with @topCreator", views: "15.6K", isPremium: false },
  { id: 6, title: "Monetize Your Content with $STREAMING", views: "5.2K", isPremium: true },
  { id: 7, title: "My Growth Strategy This Year", views: "21K", isPremium: false },
];

export default function VideoPlayer() {
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [comment, setComment] = useState("");
  const [showDesc, setShowDesc] = useState(false);
  const [isPremium] = useState(false); // flip to true to preview locked state

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Player + Details */}
          <div className="lg:col-span-2 space-y-5">

            {/* Video Player */}
            <div className="relative aspect-video bg-card border border-border rounded-2xl overflow-hidden flex items-center justify-center group">
              {isPremium ? (
                <div className="flex flex-col items-center gap-3 text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-display font-bold text-foreground text-lg">Premium Content</p>
                  <p className="text-sm text-muted-foreground">Unlock this video with 50 $STREAMING tokens</p>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 mt-2">
                    <Zap className="w-4 h-4" /> Unlock with 50 $STREAMING
                  </Button>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors cursor-pointer">
                    <Play className="w-10 h-10 text-primary ml-1" />
                  </div>
                  {/* Fake progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div className="h-full w-2/5 bg-primary rounded-full" />
                  </div>
                  <div className="absolute bottom-3 right-4 text-xs text-white/60 font-mono">12:44 / 28:30</div>
                </>
              )}
            </div>

            {/* Title + Meta */}
            <div>
              <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground leading-snug">How I Built My Creator Setup</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 12.3K views</span>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-sm text-muted-foreground">Mar 28, 2026</span>
                <Badge className="bg-secondary text-muted-foreground border-border text-xs">Tech</Badge>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setLiked(!liked)}
                className={`gap-2 rounded-xl border-border ${liked ? "text-primary border-primary/50 bg-primary/10" : ""}`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} />
                {liked ? "Liked" : "Like"} · 847
              </Button>
              <Button variant="outline" className="gap-2 rounded-xl border-border">
                <Share2 className="w-4 h-4" /> Share
              </Button>
              {!isPremium && (
                <Button className="gap-2 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Zap className="w-4 h-4" /> Tip with $STREAMING
                </Button>
              )}
            </div>

            {/* Creator Info */}
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center font-display font-bold text-primary text-lg">S</div>
                <div>
                  <p className="font-medium text-foreground">@SamsCreates</p>
                  <p className="text-xs text-muted-foreground">48.2K subscribers · 92 videos</p>
                </div>
              </div>
              <Button
                onClick={() => setSubscribed(!subscribed)}
                className={`rounded-xl gap-2 ${subscribed ? "bg-secondary text-foreground border border-border" : "bg-primary hover:bg-primary/90"}`}
              >
                <Bell className="w-4 h-4" />
                {subscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <button onClick={() => setShowDesc(!showDesc)} className="flex items-center justify-between w-full text-left">
                <p className="text-sm font-medium text-foreground">Description</p>
                {showDesc ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showDesc && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  In this video I walk you through my entire creator setup — from the desk and monitors to audio chain, lighting rig, and software stack.
                  Everything you need to level up your content game in 2026. Chapters below 👇<br /><br />
                  00:00 Intro<br />02:30 Desk & Monitors<br />07:14 Camera Setup<br />11:00 Audio Chain<br />18:20 Lighting & Background<br />24:00 Software & Workflow
                </p>
              )}
            </div>

            {/* Comments */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-display font-semibold text-foreground">Comments</h3>
                <span className="text-sm text-muted-foreground">({MOCK_COMMENTS.length})</span>
              </div>

              {/* Comment Input */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">Y</span>
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="bg-secondary border-border flex-1"
                    onKeyDown={(e) => e.key === "Enter" && setComment("")}
                  />
                  <Button size="icon" className="bg-primary hover:bg-primary/90 shrink-0" onClick={() => setComment("")}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Comment List */}
              <div className="space-y-4">
                {MOCK_COMMENTS.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-muted-foreground">{c.user[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">@{c.user}</span>
                        <span className="text-xs text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{c.comment}</p>
                      <button className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Heart className="w-3 h-3" /> {c.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Recommended */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Recommended Videos</h3>
            <div className="space-y-3">
              {RECOMMENDED.map((vid) => (
                <Link key={vid.id} to={`/videos/${vid.id}`}>
                  <div className="flex gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer group">
                    <div className="w-28 shrink-0 aspect-video bg-card border border-border rounded-lg flex items-center justify-center relative overflow-hidden">
                      <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      {vid.isPremium && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded bg-accent/20 flex items-center justify-center">
                          <Zap className="w-2.5 h-2.5 text-accent" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{vid.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Eye className="w-3 h-3" /> {vid.views} views</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}