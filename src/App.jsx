import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';

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

// Auth
import TridentLogin from '@/pages/TridentLogin';

// Creator
import Earnings from '@/pages/Earnings';
import AutoSplits from '@/pages/AutoSplits';
import Explore from '@/pages/Explore';
import UserProfile from '@/pages/public/UserProfile';

// Wallet
import StreamingWalletPage from '@/pages/wallet/StreamingWalletPage';



// API Docs
import ApiDocs from '@/pages/ApiDocs';

// Block Explorer
import BlockExplorer from '@/pages/explorer/BlockExplorer';

// Email OS
import EmailOS from '@/pages/emailos/EmailOS';

// Domain Registry
import DomainRegistry from '@/pages/domains/DomainRegistry';

// Viewer
import ViewerProfilePage from '@/pages/viewer/ViewerProfile';

// Settings
import ProfileSettings from '@/pages/settings/ProfileSettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import ConnectedAccounts from '@/pages/settings/ConnectedAccounts';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/user/:username" element={<UserProfile />} />
      <Route path="/auth/login" element={<TridentLogin />} />
      <Route path="/auth/register" element={<TridentLogin />} />
      <Route path="/onboarding" element={<CreatorOnboarding />} />
      <Route path="/stream/:id" element={<StreamPage />} />
      <Route path="/store/product/:id" element={<ProductPage />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* Creator App (with layout) */}
      <Route element={<AppLayout />}>
        {/* Dashboard */}
        <Route path="/creator/dashboard" element={<Dashboard />} />

        {/* Streams */}
        <Route path="/creator/streams" element={<StreamerConsole />} />
        <Route path="/creator/streams/:id" element={<StreamPage />} />
        <Route path="/creator/streams/go-live" element={<GoLive />} />
        <Route path="/creator/streams/analytics" element={<StreamAnalytics />} />

        {/* Videos */}
        <Route path="/creator/videos" element={<VideoLibrary />} />
        <Route path="/creator/videos/upload" element={<UploadVideo />} />
        <Route path="/creator/videos/:id" element={<VideoPlayer />} />
        <Route path="/creator/videos/manager" element={<VideoManager />} />
        <Route path="/creator/videos/analytics" element={<VideoAnalytics />} />

        {/* Audio */}
        <Route path="/creator/audio" element={<PodcastLibrary />} />
        <Route path="/creator/audio/upload" element={<UploadAudio />} />
        <Route path="/creator/audio/:id" element={<PodcastEpisodePage />} />
        <Route path="/creator/audio/manager" element={<PodcastManager />} />
        <Route path="/creator/audio/analytics" element={<PodcastAnalytics />} />

        {/* Store */}
        <Route path="/creator/store" element={<StoreDashboard />} />
        <Route path="/creator/store/products" element={<ProductList />} />
        <Route path="/creator/store/add" element={<AddProduct />} />
        <Route path="/creator/store/orders" element={<StoreDashboard />} />

        {/* Affiliates */}
        <Route path="/creator/affiliates" element={<AffiliateDashboard />} />
        <Route path="/creator/affiliates/add" element={<AddAffiliateLink />} />
        <Route path="/creator/affiliates/links" element={<AffiliateLinkList />} />
        <Route path="/creator/affiliates/manager" element={<AffiliateManager />} />

        {/* Vault */}
        <Route path="/creator/vault" element={<VaultOverview />} />
        <Route path="/creator/vault/transactions" element={<VaultTransactions />} />
        <Route path="/creator/vault/payouts" element={<PayoutHistory />} />
        <Route path="/creator/vault/team" element={<TeamSplits />} />

        {/* Analytics */}
        <Route path="/creator/analytics" element={<AnalyticsOverview />} />

        {/* Settings */}
        <Route path="/creator/settings" element={<ProfileSettings />} />
        <Route path="/creator/settings/profile" element={<ProfileSettings />} />
        <Route path="/creator/settings/security" element={<SecuritySettings />} />
        <Route path="/creator/settings/branding" element={<BrandingSettings />} />
        <Route path="/creator/settings/notifications" element={<NotificationSettings />} />
        <Route path="/creator/settings/connected" element={<ConnectedAccounts />} />

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vault" element={<VaultOverview />} />
        <Route path="/vault/transactions" element={<VaultTransactions />} />
        <Route path="/vault/payouts" element={<PayoutHistory />} />
        <Route path="/vault/team" element={<TeamSplits />} />
        <Route path="/go-live" element={<GoLive />} />
        <Route path="/streaming/console" element={<StreamerConsole />} />
        <Route path="/stream-analytics" element={<StreamAnalytics />} />
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/videos" element={<VideoLibrary />} />
        <Route path="/videos/:id" element={<VideoPlayer />} />
        <Route path="/video-analytics" element={<VideoAnalytics />} />
        <Route path="/videos/manager" element={<VideoManager />} />
        <Route path="/upload-audio" element={<UploadAudio />} />
        <Route path="/podcasts" element={<PodcastLibrary />} />
        <Route path="/podcasts/:id" element={<PodcastEpisodePage />} />
        <Route path="/podcast-analytics" element={<PodcastAnalytics />} />
        <Route path="/podcasts/manager" element={<PodcastManager />} />
        <Route path="/store" element={<StoreDashboard />} />
        <Route path="/store/add" element={<AddProduct />} />
        <Route path="/store/products" element={<ProductList />} />
        <Route path="/affiliates" element={<AffiliateDashboard />} />
        <Route path="/affiliates/add" element={<AddAffiliateLink />} />
        <Route path="/affiliates/links" element={<AffiliateLinkList />} />
        <Route path="/affiliates/manager" element={<AffiliateManager />} />
        <Route path="/analytics" element={<AnalyticsOverview />} />
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
  )
}

export default App