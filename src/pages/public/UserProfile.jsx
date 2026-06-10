import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radio, Video, Mic2, ShoppingBag, Zap, Users, Eye,
  Twitter, Globe, ExternalLink, Play, Lock, CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/tridentApi';

// Mock data per username
const MOCK_PROFILES = {
  cryptosage: {
    username: 'CryptoSage',
    display_name: 'CryptoSage',
    bio: 'Web3 educator, DeFi analyst, and live streamer. Breaking down blockchain one stream at a time.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=300&fit=crop',
    followers: 48200,
    tokens_earned: '182K $STREAMING',
    verified: true,
    category: 'Tech',
    social: { twitter: '@CryptoSage', website: 'cryptosage.live' },
    is_live: true,
    live_title: 'Breaking down the $STREAMING token economy LIVE',
    live_viewers: 4821,
  },
  luna_stream: {
    username: 'luna_stream',
    display_name: 'Luna Stream',
    bio: 'Gamer, content creator, and full-time streamer. Come hang out!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=300&fit=crop',
    followers: 32100,
    tokens_earned: '89K $STREAMING',
    verified: true,
    category: 'Gaming',
    social: { twitter: '@luna_stream', website: 'lunastream.tv' },
    is_live: false,
    live_title: null,
    live_viewers: 0,
  },
};

const MOCK_VIDEOS = [
  { id: '1', title: 'Understanding $STREAMING Tokenomics', views: 12400, thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=225&fit=crop', is_premium: false, duration: '24:30' },
  { id: '2', title: 'DeFi Deep Dive: AutoSplits Explained', views: 8900, thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=225&fit=crop', is_premium: true, duration: '41:15' },
  { id: '3', title: 'Live Q&A: Trident OS Architecture', views: 5200, thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop', is_premium: false, duration: '1:02:44' },
  { id: '4', title: 'Solana Wallet Setup for Creators', views: 3100, thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop', is_premium: false, duration: '18:20' },
];

const STORE_ITEMS = [
  { id: '1', name: 'Creator OS Masterclass', price: '$49', tokens: '490 $STREAM' },
  { id: '2', name: 'DeFi Starter Kit', price: '$29', tokens: '290 $STREAM' },
  { id: '3', name: 'Stream Overlay Pack', price: '$19', tokens: '190 $STREAM' },
];

const TABS = ['Videos', 'Store', 'Podcasts'];

export default function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Videos');
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      // Try mock data first; real API call below
      const mock = MOCK_PROFILES[username?.toLowerCase()];
      if (mock) {
        setProfile(mock);
      } else {
        // Fallback: generic profile for unknown usernames
        setProfile({
          username: username,
          display_name: username,
          bio: 'Creator on LiveStreamLab.',
          avatar: `https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop`,
          banner: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&h=300&fit=crop',
          followers: 0,
          tokens_earned: '0 $STREAMING',
          verified: false,
          category: 'Other',
          social: {},
          is_live: false,
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={profile.banner} alt="banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-6 flex items-end gap-5 flex-wrap">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.display_name}
              className="w-24 h-24 rounded-2xl border-4 border-background object-cover"
            />
            {profile.is_live && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-foreground">{profile.display_name}</h1>
              {profile.verified && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
              <Badge className="bg-secondary text-muted-foreground text-xs">{profile.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">@{profile.username?.toLowerCase()}</p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setFollowing(!following)}
              className={following ? 'bg-secondary text-foreground border border-border' : 'bg-primary hover:bg-primary/90'}
              size="sm"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {following ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" /> Tip
            </Button>
          </div>
        </div>

        {/* Bio + Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {profile.social?.twitter && (
                <span className="flex items-center gap-1"><Twitter className="w-3.5 h-3.5" />{profile.social.twitter}</span>
              )}
              {profile.social?.website && (
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{profile.social.website}</span>
              )}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            {[
              { label: 'Followers', value: profile.followers?.toLocaleString() ?? '0', icon: Users },
              { label: '$STREAMING Earned', value: profile.tokens_earned, icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Banner */}
        {profile.is_live && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{profile.live_title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Eye className="w-3 h-3" /> {profile.live_viewers?.toLocaleString()} watching now
              </p>
            </div>
            <Button size="sm" className="bg-red-500 hover:bg-red-600 gap-2 text-white">
              <Play className="w-3.5 h-3.5" /> Watch Live
            </Button>
          </motion.div>
        )}

        {/* Content Tabs */}
        <div className="flex gap-1 border-b border-border mb-5">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Videos Tab */}
        {activeTab === 'Videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_VIDEOS.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="relative aspect-video bg-secondary overflow-hidden">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {v.is_premium && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Premium
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">{v.duration}</div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {v.views.toLocaleString()} views
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'Store' && (
          <div className="space-y-3">
            {STORE_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-accent">{item.tokens}</p>
                  </div>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs gap-1.5">
                  {item.price}
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Podcasts Tab */}
        {activeTab === 'Podcasts' && (
          <div className="text-center py-12 text-muted-foreground">
            <Mic2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No podcast episodes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}