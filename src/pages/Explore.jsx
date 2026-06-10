import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Radio, Video, Mic2, TrendingUp, Zap, Users, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['All', 'Live', 'Videos', 'Podcasts', 'Music', 'Gaming', 'Tech', 'Creative'];

const MOCK_CREATORS = [
  { id: '1', name: 'CryptoSage', category: 'Tech', viewers: 4821, status: 'live', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop', tokens: '12.4K $STREAMING' },
  { id: '2', name: 'luna_stream', category: 'Gaming', viewers: 2340, status: 'live', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', tokens: '8.9K $STREAMING' },
  { id: '3', name: 'pixel_queen', category: 'Creative', viewers: 1890, status: 'live', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop', tokens: '5.2K $STREAMING' },
  { id: '4', name: 'DarkByte_', category: 'Tech', viewers: 980, status: 'offline', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', tokens: '3.1K $STREAMING' },
  { id: '5', name: 'neon_wolf', category: 'Music', viewers: 3200, status: 'live', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', tokens: '21.7K $STREAMING' },
  { id: '6', name: 'cyber_rex', category: 'Gaming', viewers: 760, status: 'offline', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', tokens: '1.8K $STREAMING' },
];

export default function Explore() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = MOCK_CREATORS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory || (activeCategory === 'Live' && c.status === 'live');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Explore</h1>
          <p className="text-muted-foreground mt-1">Discover live creators, videos, and podcasts on the Trident network.</p>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search creators, content..."
            className="pl-10 bg-card border-border h-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <h2 className="font-display font-semibold text-foreground">Live Now</h2>
            <Badge className="bg-red-400/10 text-red-400 border-red-400/20 text-xs">
              {filtered.filter(c => c.status === 'live').length} streams
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((creator, i) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-secondary relative overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${1550745165 + i * 1000}-45c0df5c8a42?w=400&h=225&fit=crop`}
                    alt={creator.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {creator.status === 'live' && (
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {creator.viewers.toLocaleString()}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex items-center gap-3">
                  <img src={creator.avatar} alt={creator.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{creator.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className="bg-secondary text-muted-foreground text-xs px-1.5 py-0">{creator.category}</Badge>
                      <span className="text-xs text-accent flex items-center gap-1">
                        <Zap className="w-3 h-3" />{creator.tokens}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Trending Creators</h2>
          </div>
          <div className="bg-card border border-border rounded-xl divide-y divide-border/50 overflow-hidden">
            {MOCK_CREATORS.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/20 transition-colors cursor-pointer">
                <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.category}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-accent">
                  <Zap className="w-3 h-3" /> {c.tokens}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}