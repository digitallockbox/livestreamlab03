# LiveStreamLab.live - Creator App Routing Map

## Overview
This document defines the complete routing structure for the **LiveStreamLab.live Creator App** - a creator-only application that sits on top of Trident OS.

**Important:** This app is **creator-only**. No admin, operator, or founder routes are included.

---

## Public Routes (No Authentication Required)

```javascript
/ → Landing page
/explore → Content discovery
/user/:username → Public creator profile
/stream/:id → Live stream viewer (public)
/videos/:id → Video player (public)
/podcasts/:id → Podcast episode page (public)
/store/product/:id → Product page (public)
/checkout → Checkout page
```

---

## Creator Routes (Require creator_session)

### Dashboard
```javascript
/dashboard → Creator dashboard (unified overview)
/analytics → Analytics overview
/analytics/creator → Creator performance analytics
/analytics/audience → Audience insights & demographics
/analytics/revenue → Revenue analytics & breakdown
```

### Streaming
```javascript
/go-live → Go Live page (start livestream)
/streaming/console → Streams Hub (manage all live sessions)
/stream-analytics → Stream Analytics (real-time performance)
/streaming/settings → Stream Settings (ingest key, bitrate, quality)
```

### Video
```javascript
/upload-video → Upload Video page (MP4/HLS upload)
/videos → Video Library (all uploaded videos)
/videos/manager → Video Manager (edit titles, thumbnails, metadata)
/video-analytics → Video Analytics (views, watch time, retention)
/videos/:id → Individual video player (creator view)
```

### Audio / Podcast
```javascript
/upload-audio → Upload Audio page (MP3/WAV upload)
/podcasts → Podcast Library (all episodes)
/podcasts/manager → Podcast Manager (edit metadata)
/podcast-analytics → Podcast Analytics (listeners, retention)
/podcasts/:id → Individual podcast episode page (creator view)
```

### Store
```javascript
/store → Store Dashboard (overview + Orders)
/store/add → Add Product (merch, digital goods)
/store/products → Products (manage inventory)
```

### Affiliates
```javascript
/affiliates → Affiliate Dashboard (earnings overview + Analytics)
/affiliates/add → Add Link (Amazon + custom links)
/affiliates/links → Link List (manage affiliate links)
/affiliates/manager → Affiliate Manager (edit, track)
```

### Vault (Creator Wallet)
```javascript
/vault → Creator Wallet (balance, payouts)
/vault/transactions → Transactions (ledger)
/vault/payouts → Payout History (past withdrawals)
/vault/team → Team Splits (revenue sharing)
```

### Settings
```javascript
/settings/profile → Profile (name, bio, links)
/settings/branding → Channel Branding (banner, avatar, theme)
/settings/security → Security (password, 2FA)
/settings/notifications → Notifications (system + fan alerts)
/settings/connected → Connected Accounts (Phantom, socials)
```

### Community
```javascript
/comments → Manage video/podcast comments
/messages → DM inbox
/followers → Audience list
```

**Note:** Community routes are currently mapped to `/dashboard` as placeholder. Create dedicated pages when needed.

---

## Removed Routes (Admin/Founder/Operator)

The following routes have been **removed** from the creator app:

```javascript
// Admin routes (REMOVED)
/admin → Admin Console
/trident/admin → TRIDENT-ADMIN
/founder → Founder Dashboard
/founder/dashboard → Founder Dashboard
/engine → Engine Control
/logs → Kernel Logs

// War Room routes (REMOVED)
/war-room → War Room
/war-room/overwatch → Overwatch Intelligence
/war-room/bridge-test → Bridge Stress Test
/war-room/syncing → Syncing
/war-room/claiming → Claiming
/war-room/vectors → Vector Output
/war-room/cycles → Cycle Visibility

// System routes (REMOVED)
/explorer → Block Explorer (admin view)
/email-os → Email OS
/domains → Domain Registry

// Other routes (REMOVED)
/wallet/streaming-token → $STREAMING Token (admin view)
/earnings → Earnings (legacy, replaced by /vault)
/autosplits → Auto-Splits (legacy, replaced by /vault/team)
/analytics/cycles → Cycle Analytics (admin view)
/api-docs → API Documentation (developer only)
```

---

## Navigation Structure (Sidebar)

### Dashboard Section
- Overview → `/dashboard`
- Analytics → `/analytics`
- Notifications → `/dashboard`

### Streaming Section
- Go Live → `/go-live`
- Streams Hub → `/streaming/console`
- Stream Analytics → `/stream-analytics`
- Past Streams → `/streaming/console`

### Video Section
- Upload Video → `/upload-video`
- Video Library → `/videos`
- Video Manager → `/videos/manager`
- Video Analytics → `/video-analytics`

### Audio / Podcast Section
- Upload Audio → `/upload-audio`
- Podcast Library → `/podcasts`
- Podcast Manager → `/podcasts/manager`
- Podcast Analytics → `/podcast-analytics`

### Store Section
- Store Dashboard → `/store`
- Add Product → `/store/add`
- Products → `/store/products`
- Orders → `/store`

### Affiliates Section
- Affiliate Dashboard → `/affiliates`
- Add Link → `/affiliates/add`
- Link List → `/affiliates/links`
- Affiliate Manager → `/affiliates/manager`
- Affiliate Analytics → `/affiliates`

### Vault Section
- Creator Wallet → `/vault`
- Transactions → `/vault/transactions`
- Payout History → `/vault/payouts`
- Team Splits → `/vault/team`

### Community Section
- Comments → `/dashboard`
- Messages → `/dashboard`
- Followers → `/dashboard`

### Settings Section
- Profile → `/settings/profile`
- Channel Branding → `/settings/branding`
- Security → `/settings/security`
- Notifications → `/settings/notifications`
- Connected Accounts → `/settings/connected`

---

## Authentication Flow

### Creator Login
```
1. Creator visits /login
2. Enters email + password
3. App → POST api.trident-system.live/auth/creator/login
4. Trident validates credentials
5. Trident → Returns creator_session JWT
6. App stores session in cookie (domain: livestreamlab.live)
7. Redirect to /dashboard
```

### Session Validation
```javascript
// Every creator route checks:
1. creator_session cookie exists
2. Token is not expired (7 days)
3. Token domain matches livestreamlab.live
4. Token role = 'creator'
5. If invalid → redirect to /login
```

---

## API Integration (Trident OS)

All creator routes call Trident OS APIs:

### Dashboard APIs
```javascript
GET /api/creator/analytics → Dashboard metrics
GET /api/creator/earnings → Revenue overview
GET /api/creator/streams → Recent streams
GET /api/creator/videos → Recent videos
GET /api/creator/products → Recent sales
```

### Streaming APIs
```javascript
POST /streams/start → Start livestream
POST /streams/end → End livestream
GET /streams/:id → Stream details
PUT /streams/:id → Update stream settings
GET /streams/:id/analytics → Stream analytics
```

### Video APIs
```javascript
POST /videos/upload → Upload video
GET /videos → List videos
GET /videos/:id → Video details
PUT /videos/:id → Update video
DELETE /videos/:id → Delete video
GET /videos/:id/analytics → Video analytics
```

### Podcast APIs
```javascript
POST /podcasts/upload → Upload audio
GET /podcasts → List episodes
GET /podcasts/:id → Episode details
PUT /podcasts/:id → Update episode
DELETE /podcasts/:id → Delete episode
GET /podcasts/:id/analytics → Episode analytics
```

### Store APIs
```javascript
GET /products → List products
POST /products → Create product
PUT /products/:id → Update product
DELETE /products/:id → Delete product
GET /orders → List orders
GET /orders/:id → Order details
```

### Affiliate APIs
```javascript
GET /affiliates/links → List affiliate links
POST /affiliates/links → Create affiliate link
PUT /affiliates/links/:id → Update link
DELETE /affiliates/links/:id → Delete link
GET /affiliates/analytics → Affiliate analytics
```

### Vault APIs
```javascript
GET /ledger/balance → Wallet balance
GET /ledger/transactions → Transaction history
GET /ledger/payouts → Payout history
POST /ledger/payouts → Request payout
GET /ledger/splits → Team splits
PUT /ledger/splits → Update splits
```

### Settings APIs
```javascript
GET /creator/profile → Profile data
PUT /creator/profile → Update profile
PUT /creator/branding → Update branding
PUT /creator/security → Update security settings
GET /creator/connections → Connected accounts
POST /creator/connections/:provider → Connect account
```

---

## File Structure

```
pages/
├── Landing.jsx → /
├── Explore.jsx → /explore
├── Dashboard.jsx → /dashboard, /analytics
├── onboarding/
│   └── CreatorOnboarding.jsx → /onboarding
├── streaming/
│   ├── GoLive.jsx → /go-live
│   ├── StreamerConsole.jsx → /streaming/console
│   ├── StreamAnalytics.jsx → /stream-analytics
│   └── StreamPage.jsx → /stream/:id
├── videos/
│   ├── UploadVideo.jsx → /upload-video
│   ├── VideoLibrary.jsx → /videos
│   ├── VideoManager.jsx → /videos/manager
│   ├── VideoAnalytics.jsx → /video-analytics
│   └── VideoPlayer.jsx → /videos/:id
├── podcasts/
│   ├── UploadAudio.jsx → /upload-audio
│   ├── PodcastLibrary.jsx → /podcasts
│   ├── PodcastManager.jsx → /podcasts/manager
│   ├── PodcastAnalytics.jsx → /podcast-analytics
│   └── PodcastEpisodePage.jsx → /podcasts/:id
├── store/
│   ├── StoreDashboard.jsx → /store
│   ├── AddProduct.jsx → /store/add
│   ├── ProductList.jsx → /store/products
│   ├── ProductPage.jsx → /store/product/:id
│   └── Checkout.jsx → /checkout
├── affiliates/
│   ├── AffiliateDashboard.jsx → /affiliates
│   ├── AddAffiliateLink.jsx → /affiliates/add
│   ├── AffiliateLinkList.jsx → /affiliates/links
│   └── AffiliateManager.jsx → /affiliates/manager
├── vault/
│   ├── VaultOverview.jsx → /vault
│   ├── VaultTransactions.jsx → /vault/transactions
│   ├── PayoutHistory.jsx → /vault/payouts
│   └── TeamSplits.jsx → /vault/team
├── settings/
│   ├── ProfileSettings.jsx → /settings/profile
│   ├── BrandingSettings.jsx → /settings/branding
│   ├── SecuritySettings.jsx → /settings/security
│   ├── NotificationSettings.jsx → /settings/notifications
│   └── ConnectedAccounts.jsx → /settings/connected
└── public/
    └── UserProfile.jsx → /user/:username
```

---

## Component Structure

```
components/
├── layout/
│   └── AppLayout.jsx → Main creator layout with sidebar
├── dashboard/
│   ├── StatCard.jsx → Stats display
│   ├── QuickActions.jsx → Quick action buttons
│   └── RecentActivity.jsx → Activity feed
├── streaming/
│   ├── StreamManager.jsx → Stream controls
│   ├── StreamChat.jsx → Live chat
│   ├── StreamHealthMonitor.jsx → Stream health
│   └── TipModal.jsx → Tip collection
├── videos/
│   ├── VideoUploadPipeline.jsx → Upload progress
│   ├── VideoMetadataEditor.jsx → Metadata form
│   ├── VideoMonetization.jsx → Monetization settings
│   └── VideoChapters.jsx → Chapter editor
├── podcasts/
│   ├── AudioUploadPipeline.jsx → Audio upload
│   ├── PodcastMetadataEditor.jsx → Episode metadata
│   ├── PodcastMonetization.jsx → Monetization
│   └── PodcastDistribution.jsx → Distribution settings
├── store/
│   ├── ProductCard.jsx → Product display
│   ├── ProductForm.jsx → Add/edit product
│   └── OrderList.jsx → Order management
├── affiliates/
│   ├── AffiliateTracker.jsx → Link tracking
│   ├── CommissionStructure.jsx → Commission display
│   └── PartnershipCampaigns.jsx → Campaign management
└── viewer/
    ├── PurchaseHistoryTab.jsx → Purchase history
    ├── SubscriptionsTab.jsx → Active subscriptions
    └── WatchlistTab.jsx → Watchlist
```

---

## Summary

**Total Creator Routes:** 45+  
**Total Public Routes:** 7  
**Removed Admin Routes:** 20+  

**LiveStreamLab.live is now a clean, creator-only application** that calls Trident OS for all data and operations.

All routes are properly configured in `App.jsx` and the sidebar navigation in `AppLayout.jsx` reflects the creator-only structure.