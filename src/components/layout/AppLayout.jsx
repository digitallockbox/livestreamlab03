import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Radio, Video, Mic2, ShoppingBag, Link2,
  BarChart3, Shield, Settings, Wallet, ChevronLeft, ChevronRight,
  Zap, Bell, Menu, X, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

const NAV = [
  { section: 'Core', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  ]},
  { section: 'CreatorVault', items: [
    { label: 'Overview', icon: Wallet, path: '/vault' },
    { label: 'Transactions', icon: Zap, path: '/vault/transactions' },
    { label: 'Payout History', icon: BarChart3, path: '/vault/payouts' },
    { label: 'Team Splits', icon: Shield, path: '/vault/team' },
  ]},
  { section: 'Streaming', items: [
    { label: 'Go Live', icon: Radio, path: '/go-live' },
    { label: 'Stream Analytics', icon: BarChart3, path: '/stream-analytics' },
  ]},
  { section: 'Video', items: [
    { label: 'Upload Video', icon: Video, path: '/upload-video' },
    { label: 'Video Library', icon: Video, path: '/videos' },
    { label: 'Video Analytics', icon: BarChart3, path: '/video-analytics' },
  ]},
  { section: 'Audio / Podcast', items: [
    { label: 'Upload Audio', icon: Mic2, path: '/upload-audio' },
    { label: 'Podcast Library', icon: Mic2, path: '/podcasts' },
    { label: 'Podcast Analytics', icon: BarChart3, path: '/podcast-analytics' },
  ]},
  { section: 'Store', items: [
    { label: 'Store Dashboard', icon: ShoppingBag, path: '/store' },
    { label: 'Add Product', icon: ShoppingBag, path: '/store/add' },
    { label: 'Products', icon: ShoppingBag, path: '/store/products' },
  ]},
  { section: 'Affiliates', items: [
    { label: 'Affiliate Dashboard', icon: Link2, path: '/affiliates' },
    { label: 'Add Link', icon: Link2, path: '/affiliates/add' },
    { label: 'Link List', icon: Link2, path: '/affiliates/links' },
    { label: 'Affiliate Analytics', icon: BarChart3, path: '/affiliates/analytics' },
  ]},
  { section: 'Intelligence', items: [
    { label: 'Analytics Overview', icon: BarChart3, path: '/analytics' },
    { label: 'Cycle Analytics', icon: BarChart3, path: '/analytics/cycles' },
  ]},
  { section: 'War Room', items: [
    { label: 'War Room', icon: Shield, path: '/war-room' },
    { label: 'Syncing', icon: Shield, path: '/war-room/syncing' },
    { label: 'Claiming', icon: Shield, path: '/war-room/claiming' },
    { label: 'Vector Output', icon: Shield, path: '/war-room/vectors' },
    { label: 'Cycle Visibility', icon: Shield, path: '/war-room/cycles' },
  ]},
  { section: 'Settings', items: [
    { label: 'Profile', icon: Settings, path: '/settings/profile' },
    { label: 'Channel Branding', icon: Settings, path: '/settings/branding' },
    { label: 'Security', icon: Settings, path: '/settings/security' },
    { label: 'Notifications', icon: Settings, path: '/settings/notifications' },
    { label: 'Connected Accounts', icon: Settings, path: '/settings/connected' },
  ]},
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-sidebar border-r border-sidebar-border`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Radio className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <div className="font-display font-bold text-sm text-foreground">LiveStreamLab</div>
            <div className="text-xs text-muted-foreground">.live</div>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-muted-foreground hover:text-foreground">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV.map(({ section, items }) => (
          <div key={section} className="mb-2">
            {(!collapsed || mobile) && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{section}</p>
            )}
            {items.map(({ label, icon: Icon, path }) => {
              const active = location.pathname === path;
              return (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-primary/20 text-primary font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {(!collapsed || mobile) && <span>{label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom */}
      {(!collapsed || mobile) && (
        <div className="p-4 border-t border-sidebar-border">
          <button onClick={() => base44.auth.logout('/')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative flex">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <Badge className="bg-accent/20 text-accent border-accent/30 font-mono text-xs">
              <Zap className="w-3 h-3 mr-1" />
              $STREAMING
            </Badge>
            <Button size="icon" variant="ghost" className="text-muted-foreground">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}