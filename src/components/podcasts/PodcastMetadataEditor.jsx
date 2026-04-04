import React, { useState } from "react";
import { FileText, Users, Rss } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PodcastMetadataEditor({ episode = {} }) {
  const [metadata, setMetadata] = useState({
    title: episode?.title || "",
    episodeNumber: episode?.episodeNumber || "",
    description: episode?.description || "",
    showNotes: episode?.showNotes || "",
    guests: episode?.guests || [],
    categories: episode?.categories || [],
  });

  const [newGuest, setNewGuest] = useState("");

  const addGuest = () => {
    if (newGuest && !metadata.guests.includes(newGuest)) {
      setMetadata({
        ...metadata,
        guests: [...metadata.guests, newGuest],
      });
      setNewGuest("");
    }
  };

  const podcastCategories = [
    "education",
    "entertainment",
    "news",
    "business",
    "technology",
    "arts",
    "sports",
    "gaming",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Episode Metadata</h3>
      </div>

      {/* Episode Number */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">Season</label>
          <Input
            type="number"
            placeholder="1"
            className="bg-secondary border-border"
            defaultValue="1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">Episode Number</label>
          <Input
            type="number"
            value={metadata.episodeNumber}
            onChange={(e) => setMetadata({ ...metadata, episodeNumber: e.target.value })}
            placeholder="1"
            className="bg-secondary border-border"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Episode Title</label>
        <Input
          value={metadata.title}
          onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
          placeholder="Enter episode title"
          className="bg-secondary border-border"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Description</label>
        <textarea
          value={metadata.description}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          placeholder="Enter episode description"
          rows="3"
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Show Notes */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Show Notes</label>
        <textarea
          value={metadata.showNotes}
          onChange={(e) => setMetadata({ ...metadata, showNotes: e.target.value })}
          placeholder="Links, timestamps, and episode notes..."
          rows="4"
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
        />
      </div>

      {/* Guests */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2 flex items-center gap-1.5">
          <Users className="w-3 h-3" /> Guest Appearances
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newGuest}
            onChange={(e) => setNewGuest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGuest()}
            placeholder="Add guest name"
            className="bg-secondary border-border text-sm"
          />
          <Button size="sm" onClick={addGuest} className="bg-primary hover:bg-primary/90">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {metadata.guests.map(guest => (
            <div
              key={guest}
              className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-2"
            >
              {guest}
              <button
                onClick={() =>
                  setMetadata({
                    ...metadata,
                    guests: metadata.guests.filter(g => g !== guest),
                  })
                }
                className="text-primary/60 hover:text-primary"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2 flex items-center gap-1.5">
          <Rss className="w-3 h-3" /> Categories
        </label>
        <div className="grid grid-cols-2 gap-2">
          {podcastCategories.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={metadata.categories.includes(cat)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setMetadata({
                      ...metadata,
                      categories: [...metadata.categories, cat],
                    });
                  } else {
                    setMetadata({
                      ...metadata,
                      categories: metadata.categories.filter(c => c !== cat),
                    });
                  }
                }}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground capitalize">{cat}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}