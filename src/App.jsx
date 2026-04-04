import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import CreatorOnboarding from '@/pages/onboarding/CreatorOnboarding';

// Vault
import VaultOverview from '@/pages/vault/VaultOverview';
import VaultTransactions from '@/pages/vault/VaultTransactions';
import PayoutHistory from '@/pages/vault/PayoutHistory';
import TeamSplits from '@/pages/vault/TeamSplits';

// Streaming
import GoLive from '@/pages/streaming/GoLive';
import StreamerConsole from '@/pages/streaming/StreamerConsole';
import StreamAnalytics from '@/pages/streaming/StreamAnalytics';
import StreamPage from '@/pages/streaming/StreamPage';

// Videos
import UploadVideo from '@/pages/videos/UploadVideo';
import VideoLibrary from '@/pages/videos/VideoLibrary';
import VideoPlayer from '@/pages/videos/VideoPlayer';
import VideoAnalytics from '@/pages/videos/VideoAnalytics';
import VideoManager from '@/pages/videos/VideoManager';

// Podcasts
import UploadAudio from '@/pages/podcasts/UploadAudio';
import PodcastLibrary from '@/pages/podcasts/PodcastLibrary';
import PodcastEpisodePage from '@/pages/podcasts/PodcastEpisodePage';
import PodcastAnalytics from '@/pages/podcasts/PodcastAnalytics';
import PodcastManager from '@/pages/podcasts/PodcastManager';

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
import AffiliateManager from '@/pages/affiliates/AffiliateManager';

// Analytics
import AnalyticsOverview from '@/pages/analytics/AnalyticsOverview';

// War Room
import WarRoom from '@/pages/warroom/WarRoom';
import OverwatchDashboard from '@/pages/warroom/OverwatchDashboard';

// Token
import StreamingToken from '@/pages/streaming/StreamingToken';

// API Docs
import ApiDocs from '@/pages/ApiDocs';

// Viewer
import ViewerProfilePage from '@/pages/viewer/ViewerProfile';

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
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<CreatorOnboarding />} />
      <Route path="/stream/:id" element={<StreamPage />} />
      <Route path="/store/product/:id" element={<ProductPage />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* App (with layout) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Vault */}
        <Route path="/vault" element={<VaultOverview />} />
        <Route path="/vault/transactions" element={<VaultTransactions />} />
        <Route path="/vault/payouts" element={<PayoutHistory />} />
        <Route path="/vault/team" element={<TeamSplits />} />

        {/* Streaming */}
        <Route path="/go-live" element={<GoLive />} />
        <Route path="/streaming/go-live" element={<GoLive />} />
        <Route path="/streaming/console" element={<StreamerConsole />} />
        <Route path="/stream-analytics" element={<StreamAnalytics />} />
        <Route path="/streaming/analytics" element={<StreamAnalytics />} />

        {/* Videos */}
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/videos" element={<VideoLibrary />} />
        <Route path="/videos/:id" element={<VideoPlayer />} />
        <Route path="/video-analytics" element={<VideoAnalytics />} />
        <Route path="/videos/manager" element={<VideoManager />} />

        {/* Podcasts */}
        <Route path="/upload-audio" element={<UploadAudio />} />
        <Route path="/podcasts" element={<PodcastLibrary />} />
        <Route path="/podcasts/:id" element={<PodcastEpisodePage />} />
        <Route path="/podcast-analytics" element={<PodcastAnalytics />} />
        <Route path="/podcasts/manager" element={<PodcastManager />} />

        {/* Store */}
        <Route path="/store" element={<StoreDashboard />} />
        <Route path="/store/add" element={<AddProduct />} />
        <Route path="/store/products" element={<ProductList />} />

        {/* Affiliates */}
        <Route path="/affiliates" element={<AffiliateDashboard />} />
        <Route path="/affiliates/add" element={<AddAffiliateLink />} />
        <Route path="/affiliates/links" element={<AffiliateLinkList />} />
        <Route path="/affiliates/manager" element={<AffiliateManager />} />

        {/* Analytics */}
        <Route path="/analytics" element={<AnalyticsOverview />} />

        {/* War Room */}
        <Route path="/war-room" element={<WarRoom />} />
        <Route path="/war-room/overwatch" element={<OverwatchDashboard />} />
        <Route path="/streaming/token" element={<StreamingToken />} />

        {/* Settings */}
        <Route path="/viewer/profile" element={<ViewerProfilePage />} />

        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/branding" element={<BrandingSettings />} />
        <Route path="/settings/security" element={<SecuritySettings />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/settings/connected" element={<ConnectedAccounts />} />
        <Route path="/api-docs" element={<ApiDocs />} />
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
  )
}

export default App