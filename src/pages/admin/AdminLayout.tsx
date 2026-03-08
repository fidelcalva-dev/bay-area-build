import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, MapPin, DollarSign, Users, Plus, LogOut, 
  Home, Loader2, Percent, Warehouse, Settings, 
  Package, FileText, Truck, Calendar, Receipt, 
  Boxes, UserCog, MapPinned, Banknote, Bell,
  BarChart3, TrendingUp, PieChart, Search, Link2, Phone, MessageSquare, Send, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useMobileMode } from '@/hooks/useMobileMode';
import { cn } from '@/lib/utils';
import { AlertBadge } from '@/components/alerts';
import { MobileLayout, MobileNavItem, MobileGlobalSearch } from '@/components/mobile';
import AiControlWidget from '@/components/ai/AiControlWidget';

// Navigation items grouped by section - Full CRM Navigation
const navSections = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', label: 'Control Center', icon: Home, end: true },
      { path: '/admin/executive', label: 'Executive View', icon: BarChart3 },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { path: '/admin/dashboards/overview', label: 'Overview', icon: BarChart3 },
      { path: '/admin/dashboards/leads', label: 'Lead Performance', icon: Users },
      { path: '/admin/dashboards/kpis', label: 'KPI Optimization', icon: TrendingUp },
      { path: '/admin/dashboards/sales', label: 'Sales Funnel', icon: TrendingUp },
      { path: '/admin/dashboards/operations', label: 'Operations', icon: Truck },
      { path: '/admin/dashboards/finance', label: 'Finance', icon: DollarSign },
      { path: '/admin/dashboards/customers', label: 'Customers', icon: PieChart },
    ],
  },
  {
    title: 'Google Ads',
    items: [
      { path: '/admin/ads', label: 'Ads Overview', icon: TrendingUp, end: true },
      { path: '/admin/ads/campaigns', label: 'Campaigns', icon: BarChart3 },
      { path: '/admin/ads/rules', label: 'Automation Rules', icon: Settings },
      { path: '/admin/ads/markets', label: 'Markets Config', icon: MapPin },
      { path: '/admin/ads/logs', label: 'Sync Logs', icon: FileText },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/admin/orders', label: 'Orders', icon: Package },
      { path: '/admin/dispatch', label: 'Dispatch Calendar', icon: Calendar },
      { path: '/admin/assets', label: 'Asset Control Tower', icon: Boxes },
      { path: '/admin/overdue', label: 'Overdue Billing', icon: Receipt },
      { path: '/admin/inventory', label: 'Inventory (Legacy)', icon: Warehouse },
      { path: '/admin/movements', label: 'Movement Log', icon: FileText },
      { path: '/admin/customers', label: 'Customers', icon: Users },
      { path: '/admin/activation', label: 'Activation', icon: Send },
      { path: '/admin/drivers', label: 'Drivers', icon: Truck },
      { path: '/admin/quick-links', label: 'Quick Links', icon: Link2 },
    ],
  },
  {
    title: 'Finance',
    items: [
      { path: '/admin/tickets', label: 'Tickets & Receipts', icon: Receipt },
      { path: '/admin/city-rates', label: 'City Rates', icon: Banknote },
      { path: '/admin/toll-surcharges', label: 'Toll Surcharges', icon: MapPinned },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { path: '/admin/configuration', label: 'Config Center', icon: Settings },
      { path: '/admin/yards', label: 'Yard Manager', icon: Warehouse },
      { path: '/admin/zones', label: 'ZIP-to-Zone', icon: MapPin },
      { path: '/admin/pricing', label: 'Pricing Tables', icon: DollarSign },
      { path: '/admin/vendors', label: 'Vendors', icon: Truck },
      { path: '/admin/extras', label: 'Extras Catalog', icon: Plus },
      { path: '/admin/config', label: 'Business Rules', icon: Settings },
    ],
  },
  {
    title: 'Programs',
    items: [
      { path: '/admin/volume-commitments', label: 'Volume Discounts', icon: Percent },
      { path: '/admin/approval-queue', label: 'Approval Queue', icon: FileText },
      { path: '/admin/compensation', label: 'Compensation', icon: DollarSign },
    ],
  },
  {
    title: 'Telephony',
    items: [
      { path: '/admin/telephony/calls', label: 'Call Logs', icon: Phone },
      { path: '/admin/telephony/numbers', label: 'Phone Numbers', icon: Phone },
      { path: '/admin/telephony/analytics', label: 'Call Analytics', icon: BarChart3 },
      { path: '/admin/telephony/migration', label: 'GHL Migration', icon: Phone },
      { path: '/admin/telephony/test', label: 'Test Call', icon: Phone },
      { path: '/admin/telephony/import', label: 'Import History', icon: FileText },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { path: '/admin/google', label: 'Google Workspace', icon: Link2 },
    ],
  },
  {
    title: 'Resources',
    items: [
      { path: '/admin/docs', label: 'Internal Docs', icon: FileText },
    ],
  },
  {
    title: 'AI',
    items: [
      { path: '/admin/ai/performance', label: 'AI Performance', icon: Brain },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/admin/qa/control-center', label: 'QA Control Center', icon: Shield },
      { path: '/admin/alerts', label: 'Alerts', icon: Bell },
      { path: '/admin/security', label: 'Security Health', icon: Shield },
      { path: '/admin/setup/functions', label: 'Functions Map', icon: Settings },
      { path: '/admin/setup/what-missing', label: "What's Missing", icon: Shield },
      { path: '/admin/risk', label: 'Risk Review', icon: Shield },
      { path: '/admin/fraud-flags', label: 'Fraud Flags', icon: Shield },
      { path: '/admin/users', label: 'User Management', icon: UserCog },
      { path: '/admin/access-requests', label: 'Access Requests', icon: UserCog },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
    ],
  },
];

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
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Operations & Config</p>
              </div>
            </div>
            <AlertBadge />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.end
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path) && item.path !== '/admin';

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
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <AiControlWidget />
    </div>
    </>
  );
}
