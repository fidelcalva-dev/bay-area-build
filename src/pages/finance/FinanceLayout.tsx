import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  DollarSign, FileText, LogOut, Home, Loader2, 
  CreditCard, Settings, RotateCcw, Search, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useMobileMode } from '@/hooks/useMobileMode';
import { cn } from '@/lib/utils';
import logoCalsan from "@/assets/logo-calsan.jpeg";
import { MobileLayout, MobileNavItem, MobileGlobalSearch } from '@/components/mobile';
import AiControlWidget from '@/components/ai/AiControlWidget';

const navItems = [
  { path: '/finance', label: 'Dashboard', icon: Home, end: true },
  { path: '/finance/invoices', label: 'Invoices', icon: FileText },
  { path: '/finance/ar-aging', label: 'AR Aging', icon: Clock },
  { path: '/finance/payments', label: 'Payments', icon: CreditCard },
  { path: '/finance/payment-actions', label: 'Refunds/Voids', icon: RotateCcw },
];

const mobileNavItems: MobileNavItem[] = [
  { path: '/finance/invoices', label: 'Invoices', icon: FileText },
  { path: '/finance/ar-aging', label: 'AR', icon: Clock },
  { path: '/finance/payments', label: 'Payments', icon: CreditCard },
  { path: '/finance/search', label: 'Search', icon: Search },
];

export default function FinanceLayout() {
  const { user, isLoading, signOut, isAdmin, isFinance } = useAdminAuth();
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

  if (!isAdmin && !isFinance) {
    return <Navigate to="/app" replace />;
  }

  // Mobile Layout
  if (mobileMode) {
    const isSearchPage = location.pathname === '/finance/search';
    
    return (
      <MobileLayout
        title="Finance"
        subtitle="Billing & Payments"
        navItems={mobileNavItems}
        basePath="/finance"
        onSignOut={signOut}
        userEmail={user.email || undefined}
      >
        {isSearchPage ? (
          <MobileGlobalSearch basePath="/finance" />
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
              <h1 className="font-bold text-foreground">Finance</h1>
              <p className="text-xs text-muted-foreground">Billing & Payments</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && item.path !== '/finance';

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
              <p className="text-xs text-muted-foreground">Finance</p>
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
