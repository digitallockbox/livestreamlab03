import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Public
import Landing from '@/pages/Landing';

// Onboarding
import CreatorOnboarding from '@/pages/onboarding/CreatorOnboarding';

// Dashboard
import Dashboard from '@/pages/Dashboard';

// Vault
import VaultOverview from '@/pages/vault/VaultOverview';
import VaultTransactions from '@/pages/vault/VaultTransactions';
import PayoutHistory from '@/pages/vault/PayoutHistory';
import TeamSplits from '@/pages/vault/TeamSplits';

// Streaming
import GoLive from '@/pages/streaming/GoLive';
import StreamerConsole from '@/pages/streaming/StreamerConsole';
import StreamAnalytics from '@/pages/streaming/StreamAnalytics';

// Video
import UploadVideo from '@/pages/videos/UploadVideo';
import VideoLibrary from '@/pages/videos/VideoLibrary';
import VideoPlayer from '@/pages/videos/VideoPlayer';
import VideoAnalytics from '@/pages/videos/VideoAnalytics';

// Podcast
import UploadAudio from '@/pages/podcasts/UploadAudio';
import PodcastLibrary from '@/pages/podcasts/PodcastLibrary';
import PodcastEpisodePage from '@/pages/podcasts/PodcastEpisodePage';
import PodcastAnalytics from '@/pages/podcasts/PodcastAnalytics';

// Store
import StoreDashboard from '@/pages/store/StoreDashboard';
import AddProduct from '@/pages/store/AddProduct';
import ProductList from '@/pages/store/ProductList';
import ProductPage from '@/pages/store/ProductPage';
import Checkout from '@/pages/store/Checkout';

// Affiliates
import AffiliateDashboard from '@/pages/affiliates/AffiliateDashboard';
import AddAffiliateLink from '@/pages/affiliates/AddAffiliateLink';
import AffiliateLinkList from '@/pages/affiliates/AffiliateLinkList';
import AffiliateAnalytics from '@/pages/affiliates/AffiliateAnalytics';

// Analytics
import AnalyticsOverview from '@/pages/analytics/AnalyticsOverview';
import CycleAnalytics from '@/pages/analytics/CycleAnalytics';

// War Room
import WarRoomHome from '@/pages/warroom/WarRoomHome';
import SyncCenter from '@/pages/warroom/SyncCenter';
import ClaimCenter from '@/pages/warroom/ClaimCenter';
import VectorOutput from '@/pages/warroom/VectorOutput';
import CycleVisibility from '@/pages/warroom/CycleVisibility';

// Settings
import ProfileSettings from '@/pages/settings/ProfileSettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import ConnectedAccounts from '@/pages/settings/ConnectedAccounts';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading LiveStreamLab...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<CreatorOnboarding />} />

      {/* App shell */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Vault */}
        <Route path="/vault" element={<VaultOverview />} />
        <Route path="/vault/transactions" element={<VaultTransactions />} />
        <Route path="/vault/payouts" element={<PayoutHistory />} />
        <Route path="/vault/team" element={<TeamSplits />} />

        {/* Streaming */}
        <Route path="/go-live" element={<GoLive />} />
        <Route path="/stream-console" element={<StreamerConsole />} />
        <Route path="/stream-analytics" element={<StreamAnalytics />} />

        {/* Video */}
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/videos" element={<VideoLibrary />} />
        <Route path="/videos/:id" element={<VideoPlayer />} />
        <Route path="/video-analytics" element={<VideoAnalytics />} />

        {/* Podcast */}
        <Route path="/upload-audio" element={<UploadAudio />} />
        <Route path="/podcasts" element={<PodcastLibrary />} />
        <Route path="/podcasts/:id" element={<PodcastEpisodePage />} />
        <Route path="/podcast-analytics" element={<PodcastAnalytics />} />

        {/* Store */}
        <Route path="/store" element={<StoreDashboard />} />
        <Route path="/store/add" element={<AddProduct />} />
        <Route path="/store/add-product" element={<AddProduct />} />
        <Route path="/store/products" element={<ProductList />} />
        <Route path="/store/products/:id" element={<ProductPage />} />
        <Route path="/store/checkout" element={<Checkout />} />

        {/* Affiliates */}
        <Route path="/affiliates" element={<AffiliateDashboard />} />
        <Route path="/affiliates/add" element={<AddAffiliateLink />} />
        <Route path="/affiliates/links" element={<AffiliateLinkList />} />
        <Route path="/affiliates/analytics" element={<AffiliateAnalytics />} />

        {/* Analytics */}
        <Route path="/analytics" element={<AnalyticsOverview />} />
        <Route path="/analytics/cycles" element={<CycleAnalytics />} />

        {/* War Room */}
        <Route path="/war-room" element={<WarRoomHome />} />
        <Route path="/war-room/syncing" element={<SyncCenter />} />
        <Route path="/war-room/claiming" element={<ClaimCenter />} />
        <Route path="/war-room/vectors" element={<VectorOutput />} />
        <Route path="/war-room/cycles" element={<CycleVisibility />} />

        {/* Settings */}
        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/branding" element={<BrandingSettings />} />
        <Route path="/settings/security" element={<SecuritySettings />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/settings/connected" element={<ConnectedAccounts />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;