import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, Heart, Send, Share2, Gift, MessageSquare,
  Play, Eye, Calendar, Zap, Volume2, VolumeX,
  Maximize, Settings, PlayCircle, Clock, TrendingUp
} from 'lucide-react';
import { publicApi } from '@/lib/tridentApi';
import StreamChat from '@/components/streaming/StreamChat';
import CreatorCard from '@/components/streaming/CreatorCard';
import RecommendedStreams from '@/components/streaming/RecommendedStreams';
import TipModal from '@/components/streaming/TipModal';

export default function StreamPage() {
  const { id } = useParams();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [liveViewerCount, setLiveViewerCount] = useState(null);
  const videoRef = useRef(null);

  // Load stream data
  useEffect(() => {
    const loadStream = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await publicApi.getStream({ id });
        setStream(data);
      } catch (err) {
        setError(err.message || 'Failed to load stream');
        console.error('Stream load error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadStream();
  }, [id]);

  // Update viewer count periodically
  useEffect(() => {
    if (!stream) return;
    const interval = setInterval(async () => {
      try {
        const updated = await publicApi.getStream({ id });
        setStream(prev => ({ ...prev, viewer_count: updated.viewer_count }));
      } catch (err) {
        console.error('Viewer count update failed:', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, stream]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setFullscreen(false);
      } else {
        videoRef.current.requestFullscreen().catch(err => console.error('Fullscreen failed:', err));
        setFullscreen(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Stream not found'}</p>
          <a href="/" className="text-primary hover:underline">← Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 lg:py-6">
        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 lg:mb-8"
        >
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:h-[500px] group">
            {/* Live indicator */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Viewer count */}
            <div className="absolute top-4 right-4 z-20">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold">
                <Eye className="w-3.5 h-3.5" />
                {(liveViewerCount ?? stream.viewer_count)?.toLocaleString() || 0}
              </div>
            </div>

            {/* Video player */}
            <video
              ref={videoRef}
              src={stream.playback_url}
              className="w-full h-full object-cover"
              controls
              autoPlay
              playsInline
              onFullscreenChange={() => setFullscreen(!!document.fullscreenElement)}
            />

            {/* Overlay controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                    <Maximize className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stream info */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <h1 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-2">
                      {stream.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border-primary/30 capitalize">
                        {stream.category}
                      </Badge>
                      {stream.status === 'live' && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <PlayCircle className="w-3 h-3 mr-1" /> Live
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setShowTipModal(true)}
                      className="bg-primary hover:bg-primary/90 gap-1.5"
                    >
                      <Gift className="w-4 h-4" />
                      Tip <span className="hidden sm:inline">Creator</span>
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {stream.description && (
                  <p className="text-foreground/80 leading-relaxed">
                    {stream.description}
                  </p>
                )}
              </div>

              {/* Stream stats */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-chart-2" />
                  <span className="text-sm">{stream.peak_viewers?.toLocaleString() || 0} peak viewers</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-chart-4" />
                  <span className="text-sm">Streaming {stream.duration_minutes || 0} mins</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-4 h-4 text-chart-1" />
                  <span className="text-sm">${stream.tips_earned?.toLocaleString() || 0} earned</span>
                </div>
              </div>
            </motion.div>

            {/* Creator info */}
            <CreatorCard creator={stream.creator} />

            {/* Description & tabs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="border-t border-border pt-6"
            >
              <h2 className="font-display font-bold text-lg mb-4">About This Stream</h2>
              <p className="text-foreground/70 whitespace-pre-wrap">
                {stream.description || 'No description available'}
              </p>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Chat */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[500px]"
            >
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Live Chat</h3>
              </div>
              <StreamChat streamId={id} onViewerCount={setLiveViewerCount} />
            </motion.div>

            {/* Recommended streams */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <RecommendedStreams />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <TipModal
          creator={stream.creator}
          onClose={() => setShowTipModal(false)}
          onSuccess={() => {
            setShowTipModal(false);
            // Optionally refresh stream data to show updated earnings
          }}
        />
      )}
    </div>
  );
}