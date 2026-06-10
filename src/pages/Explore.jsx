import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Radio, Video, Mic2, TrendingUp, Zap, Users, Eye, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { contentApi } from '@/lib/creatorApi';

const CATEGORIES = ['All', 'Live', 'Videos', 'Podcasts', 'Music', 'Gaming', 'Tech', 'Creative'];

export default function Explore() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await contentApi.listStreams();
        setStreams(data || []);
      } catch (err) {
        console.error('Explore load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = streams.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(search.toLowerCase()) || c.creator_name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory || (activeCategory === 'Live' && c.status === 'live');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Explore</h1>
          <p className="text-muted-foreground mt-1">Discover live streams, videos, and podcasts on the Trident network.</p>
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
              {loading ? '…' : filtered.filter(c => c.status === 'live').length} streams
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No live streams found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((stream, i) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-secondary relative overflow-hidden">
                    <img
                      src={stream.thumbnail_url || `https://images.unsplash.com/photo-1550745165-45c0df5c8a42?w=400&h=225&fit=crop`}
                      alt={stream.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {stream.status === 'live' && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {stream.viewer_count?.toLocaleString() || 0}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary font-bold">{stream.creator_name?.charAt(0).toUpperCase() || 'C'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{stream.title || 'Untitled Stream'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className="bg-secondary text-muted-foreground text-xs px-1.5 py-0">{stream.category || 'Other'}</Badge>
                        <span className="text-xs text-accent flex items-center gap-1">
                          <Zap className="w-3 h-3" />{stream.tips_earned ? `${stream.tips_earned} $S` : '0 $S'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}