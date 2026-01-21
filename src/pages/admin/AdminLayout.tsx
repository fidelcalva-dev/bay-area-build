import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, MapPin, DollarSign, Users, Plus, LogOut, 
  Home, Loader2, Percent, Warehouse, Settings, 
  Package, FileText, Truck, Calendar, Receipt, 
  Boxes, UserCog, MapPinned, Banknote, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';

// Navigation items grouped by section - Full CRM Navigation
const navSections = [
  {
    title: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: Home, end: true },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/admin/orders', label: 'Orders', icon: Package },
      { path: '/admin/dispatch', label: 'Dispatch Calendar', icon: Calendar },
      { path: '/admin/inventory', label: 'Inventory', icon: Boxes },
      { path: '/admin/customers', label: 'Customers', icon: Users },
      { path: '/admin/drivers', label: 'Drivers', icon: Truck },
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
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/admin/users', label: 'User Management', icon: UserCog },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
    ],
  },
];

export default function AdminLayout() {
  const { user, isLoading, signOut, canAccessAdmin } = useAdminAuth();
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
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Contact the administrator to request access.
          </p>
          <div className="space-y-3">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
            <Button variant="ghost" onClick={signOut} className="w-full">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Operations & Config</p>
            </div>
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
    </div>
  );
}
