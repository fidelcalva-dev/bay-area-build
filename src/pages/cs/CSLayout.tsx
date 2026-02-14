import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Headphones, Package, MessageSquare, FileText, LogOut, 
  Home, Loader2, ClipboardList, Search, Phone, Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useMobileMode } from '@/hooks/useMobileMode';
import { cn } from '@/lib/utils';
import { OfficeStatusIndicator } from '@/components/shared/OfficeStatusIndicator';
import { MobileLayout, MobileNavItem, MobileGlobalSearch } from '@/components/mobile';
import { AgentStatusWidget } from '@/components/telephony';

const navItems = [
  { path: '/cs', label: 'Dashboard', icon: Home, end: true },
  { path: '/cs/orders', label: 'Orders', icon: Package },
  { path: '/cs/requests', label: 'Requests Queue', icon: ClipboardList },
  { path: '/cs/calls', label: 'Calls', icon: Phone },
  { path: '/cs/messages', label: 'Messages', icon: MessageSquare },
  { path: '/cs/templates', label: 'SMS Templates', icon: FileText },
  { path: '/internal/calculator', label: 'Calculator', icon: Calculator },
];

const mobileNavItems: MobileNavItem[] = [
  { path: '/cs/orders', label: 'Orders', icon: Package },
  { path: '/cs/requests', label: 'Requests', icon: ClipboardList },
  { path: '/cs/calls', label: 'Calls', icon: Phone },
  { path: '/cs/messages', label: 'Messages', icon: MessageSquare },
  { path: '/cs/search', label: 'Search', icon: Search },
];

export default function CSLayout() {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="max-w-md w-full mx-4 bg-card rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Headphones className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have customer service privileges.
          </p>
          <Button variant="ghost" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (mobileMode) {
    const isSearchPage = location.pathname === '/cs/search';
    
    return (
      <MobileLayout
        title="CS Panel"
        subtitle="Customer Service"
        navItems={mobileNavItems}
        basePath="/cs"
        onSignOut={signOut}
        userEmail={user.email || undefined}
      >
        {isSearchPage ? (
          <MobileGlobalSearch basePath="/cs" />
        ) : (
          <Outlet />
        )}
      </MobileLayout>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">CS Panel</h1>
              <p className="text-xs text-muted-foreground">Customer Service</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <OfficeStatusIndicator />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && item.path !== '/cs';

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Agent Status */}
        <div className="p-4 border-t border-border">
          <AgentStatusWidget />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Customer Service</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
