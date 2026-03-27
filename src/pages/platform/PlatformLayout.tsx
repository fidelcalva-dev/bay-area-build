import { Outlet, Link, useLocation } from 'react-router-dom';
import { Building2, Users, CreditCard, Route, BarChart3, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/platform', icon: BarChart3 },
  { label: 'Tenants', href: '/platform/tenants', icon: Building2 },
  { label: 'Providers', href: '/platform/providers', icon: Users },
  { label: 'Subscriptions', href: '/platform/subscriptions', icon: CreditCard },
  { label: 'Lead Router', href: '/platform/lead-router', icon: Route },
  { label: 'Routing Rules', href: '/platform/routing-rules', icon: Settings },
  { label: 'Billing', href: '/platform/billing', icon: CreditCard },
  { label: 'QA', href: '/platform/qa', icon: Shield },
  { label: 'Audit Log', href: '/platform/audit', icon: BarChart3 },
];

export default function PlatformLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r bg-card hidden lg:block">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg text-foreground">Platform Admin</h2>
          <p className="text-xs text-muted-foreground">Multi-Tenant Control Plane</p>
        </div>
        <nav className="p-2 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
