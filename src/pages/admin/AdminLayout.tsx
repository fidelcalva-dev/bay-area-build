import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Bell, UserCog, Search, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useMobileMode } from '@/hooks/useMobileMode';
import { MobileLayout, MobileNavItem, MobileGlobalSearch } from '@/components/mobile';
import AiControlWidget from '@/components/ai/AiControlWidget';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { NotificationBell } from '@/components/notifications';

// Mobile navigation - limited admin view
const mobileNavItems: MobileNavItem[] = [
  { path: '/admin', label: 'Overview', icon: Home, end: true },
  { path: '/admin/alerts', label: 'Alerts', icon: Bell },
  { path: '/admin/users', label: 'Users', icon: UserCog },
  { path: '/admin/search', label: 'Search', icon: Search },
];

export default function AdminLayout() {
  const { user, isLoading, signOut, canAccessAdmin } = useAdminAuth();
  const { mobileMode } = useMobileMode();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!canAccessAdmin()) {
    return <Navigate to="/app" replace />;
  }

  // Mobile Layout
  if (mobileMode) {
    const isSearchPage = location.pathname === '/admin/search';
    
    return (
      <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <MobileLayout
        title="Admin"
        subtitle="Operations & Config"
        navItems={mobileNavItems}
        basePath="/admin"
        onSignOut={signOut}
        userEmail={user.email || undefined}
      >
        {isSearchPage ? (
          <MobileGlobalSearch basePath="/admin" />
        ) : (
          <Outlet />
        )}
      </MobileLayout>
      </>
    );
  }

  // Desktop Layout
  return (
    <>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <div className="min-h-screen bg-muted/30 flex">
      <AdminSidebar
        userEmail={user.email || undefined}
        onSignOut={signOut}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <AiControlWidget />
    </div>
    </>
  );
}
