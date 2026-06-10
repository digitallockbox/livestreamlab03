import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Zap } from 'lucide-react';
import { publicApi } from '@/lib/tridentApi';

export default function RecommendedStreams() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommended = async () => {
      try {
        const data = await publicApi.getRecommendedStreams({});
        setStreams(data?.streams || []);
      } catch (err) {
        console.error('Failed to load recommended streams:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecommended();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="font-display font-bold text-sm mb-4">Recommended</h3>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-display font-bold text-sm">Recommended</h3>
      </div>

      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {streams.slice(0, 5).map((stream, i) => (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/stream/${stream.id}`}
              className="flex gap-3 p-3 hover:bg-muted/50 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={stream.thumbnail_url}
                  alt={stream.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {stream.status === 'live' && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                    LIVE
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {stream.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  {stream.creator?.display_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {stream.viewer_count?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center gap-0.5 text-chart-1">
                    <Zap className="w-3 h-3" />
                    ${stream.tips_earned || 0}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}