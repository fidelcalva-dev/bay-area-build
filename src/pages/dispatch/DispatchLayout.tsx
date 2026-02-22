import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Truck, Calendar, LogOut, Home, Loader2, 
  AlertTriangle, Settings, Search, ClipboardList, Phone, Calculator, MapPin, History, Building2, Warehouse, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useMobileMode } from '@/hooks/useMobileMode';
import { cn } from '@/lib/utils';
import logoCalsan from "@/assets/logo-calsan.jpeg";
import { MobileLayout, MobileNavItem, MobileGlobalSearch } from '@/components/mobile';
import { AgentStatusWidget } from '@/components/telephony';
import AiControlWidget from '@/components/ai/AiControlWidget';

const navItems = [
  { path: '/dispatch', label: 'Dashboard', icon: Home, end: true },
  { path: '/dispatch/today', label: 'Today', icon: Truck },
  { path: '/dispatch/calendar', label: 'Calendar', icon: Calendar },
  { path: '/dispatch/control-tower', label: 'Control Tower', icon: MapPin },
  { path: '/dispatch/history', label: 'Route History', icon: History },
  { path: '/dispatch/facilities', label: 'Facilities', icon: Building2 },
  { path: '/dispatch/yard-hold', label: 'Yard Hold', icon: Warehouse },
  { path: '/dispatch/requests', label: 'Requests', icon: ClipboardList },
  { path: '/dispatch/flags', label: 'Flags', icon: AlertTriangle },
  { path: '/internal/calculator', label: 'Calculator', icon: Calculator },
];

const mobileNavItems: MobileNavItem[] = [
  { path: '/dispatch/today', label: 'Today', icon: Truck },
  { path: '/dispatch/calendar', label: 'Calendar', icon: Calendar },
  { path: '/dispatch/requests', label: 'Requests', icon: ClipboardList },
  { path: '/dispatch/flags', label: 'Flags', icon: AlertTriangle },
  { path: '/dispatch/search', label: 'Search', icon: Search },
];

export default function DispatchLayout() {
  const { user, isLoading, signOut, isAdmin, isDispatcher } = useAdminAuth();
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

  if (!isAdmin && !isDispatcher) {
    return <Navigate to="/app" replace />;
  }

  // Mobile Layout
  if (mobileMode) {
    const isSearchPage = location.pathname === '/dispatch/search';
    
    return (
      <MobileLayout
        title="Dispatch"
        subtitle="Driver Assignments"
        navItems={mobileNavItems}
        basePath="/dispatch"
        onSignOut={signOut}
        userEmail={user.email || undefined}
      >
        {isSearchPage ? (
          <MobileGlobalSearch basePath="/dispatch" />
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
            <img src={logoCalsan} alt="Calsan" className="h-10 rounded-lg" />
            <div>
              <h1 className="font-bold text-foreground">Dispatch</h1>
              <p className="text-xs text-muted-foreground">Driver Assignments</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && item.path !== '/dispatch';

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

        <div className="p-4 border-t border-border space-y-2">
          {isAdmin && (
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <NavLink to="/admin">
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </NavLink>
            </Button>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Dispatcher</p>
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

      <AiControlWidget />
    </div>
  );
}
