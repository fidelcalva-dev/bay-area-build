import { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, BarChart3, Users, Package, Truck, Calendar, DollarSign,
  Globe, Shield, Settings, Bell, Phone, Brain, MessageSquare,
  FileText, Link2, TrendingUp, Warehouse, MapPin, Plus,
  Boxes, Receipt, Percent, Banknote, MapPinned, UserCog,
  Send, Layout, PieChart, LogOut, Star, Clock, ChevronDown,
  ChevronRight, Zap, AlertCircle, Activity,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertBadge } from '@/components/alerts';

// ─── NAV ITEM TYPE ────────────────────────────────────────────
export interface SidebarNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface SidebarSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: SidebarNavItem[];
  defaultOpen?: boolean;
}

// ─── SECTIONS — SOURCE OF TRUTH ──────────────────────────────
export const CRM_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'control-center',
    title: 'Control Center',
    icon: Home,
    defaultOpen: true,
    items: [
      { path: '/admin', label: 'Command Center', icon: Home, end: true },
      { path: '/admin/executive', label: 'Executive View', icon: BarChart3 },
      { path: '/admin/modules', label: 'Module Registry', icon: Settings },
      { path: '/admin/activity', label: 'Activity Feed', icon: Activity },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
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
    id: 'sales',
    title: 'Sales',
    icon: TrendingUp,
    items: [
      { path: '/admin/leads', label: 'Lead Hub', icon: Users },
      { path: '/admin/leads-health', label: 'Lead Health', icon: TrendingUp },
      { path: '/admin/leads/settings', label: 'Lead Engine', icon: Settings },
      { path: '/admin/sales-performance', label: 'Sales Performance', icon: BarChart3 },
    ],
  },
  {
    id: 'customers',
    title: 'Customer Service',
    icon: Users,
    items: [
      { path: '/admin/customers', label: 'Customer List', icon: Users },
      { path: '/admin/customer-health', label: 'Customer Health', icon: TrendingUp },
      { path: '/admin/activation', label: 'Activation', icon: Send },
      { path: '/admin/customer-type-rules', label: 'Customer Rules', icon: Settings },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    icon: Package,
    items: [
      { path: '/admin/orders', label: 'Orders', icon: Package },
      { path: '/admin/dispatch', label: 'Dispatch Calendar', icon: Calendar },
      { path: '/admin/assets', label: 'Asset Control Tower', icon: Boxes },
      { path: '/admin/movements', label: 'Movement Log', icon: FileText },
      { path: '/admin/markets', label: 'Markets', icon: MapPin },
      { path: '/admin/quick-links', label: 'Quick Links', icon: Link2 },
    ],
  },
  {
    id: 'driver',
    title: 'Driver App',
    icon: Truck,
    items: [
      { path: '/admin/drivers', label: 'Driver Management', icon: Truck },
    ],
  },
  {
    id: 'fleet',
    title: 'Fleet & Maintenance',
    icon: Boxes,
    items: [
      { path: '/admin/inventory', label: 'Inventory', icon: Warehouse },
      { path: '/admin/fleet/cameras', label: 'Fleet Cameras', icon: Boxes },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: DollarSign,
    items: [
      { path: '/admin/tickets', label: 'Tickets & Receipts', icon: Receipt },
      { path: '/admin/overdue', label: 'Overdue Billing', icon: Receipt },
      { path: '/admin/approval-queue', label: 'Approval Queue', icon: FileText },
      { path: '/admin/compensation', label: 'Compensation', icon: DollarSign },
      { path: '/admin/profitability', label: 'Profitability', icon: BarChart3 },
      { path: '/admin/heavy-risk', label: 'Heavy Risk', icon: Shield },
    ],
  },
  {
    id: 'seo-marketing',
    title: 'SEO & Marketing',
    icon: Globe,
    items: [
      { path: '/admin/seo/dashboard', label: 'SEO Dashboard', icon: Globe },
      { path: '/admin/seo/cities', label: 'SEO Cities', icon: MapPin },
      { path: '/admin/seo/pages', label: 'SEO Pages', icon: FileText },
      { path: '/admin/seo/health', label: 'SEO Health', icon: TrendingUp },
      { path: '/admin/seo/metrics', label: 'SEO Metrics', icon: BarChart3 },
      { path: '/admin/seo/generate', label: 'Generate Pages', icon: Plus },
      { path: '/admin/ads', label: 'Google Ads', icon: TrendingUp, end: true },
      { path: '/admin/ads/campaigns', label: 'Ad Campaigns', icon: BarChart3 },
      { path: '/admin/marketing/dashboard', label: 'Marketing', icon: BarChart3 },
      { path: '/admin/marketing/visitors', label: 'Visitors', icon: Users },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Link2,
    items: [
      { path: '/admin/google', label: 'Google Workspace', icon: Link2 },
      { path: '/admin/messaging', label: 'Messaging', icon: MessageSquare },
      { path: '/admin/telephony/calls', label: 'Call Logs', icon: Phone },
      { path: '/admin/telephony/numbers', label: 'Phone Numbers', icon: Phone },
      { path: '/admin/telephony/analytics', label: 'Call Analytics', icon: BarChart3 },
      { path: '/admin/setup/functions', label: 'Functions Map', icon: Settings },
    ],
  },
  {
    id: 'configuration',
    title: 'Configuration',
    icon: Settings,
    items: [
      { path: '/admin/configuration', label: 'Config Center', icon: Settings },
      { path: '/admin/yards', label: 'Yard Manager', icon: Warehouse },
      { path: '/admin/zones', label: 'ZIP-to-Zone', icon: MapPin },
      { path: '/admin/pricing', label: 'Pricing Tables', icon: DollarSign },
      { path: '/admin/city-rates', label: 'City Rates', icon: Banknote },
      { path: '/admin/toll-surcharges', label: 'Toll Surcharges', icon: MapPinned },
      { path: '/admin/vendors', label: 'Vendors', icon: Truck },
      { path: '/admin/extras', label: 'Extras Catalog', icon: Plus },
      { path: '/admin/config', label: 'Business Rules', icon: Settings },
      { path: '/admin/volume-commitments', label: 'Volume Discounts', icon: Percent },
      { path: '/admin/email-config', label: 'Email Config', icon: MessageSquare },
    ],
  },
  {
    id: 'ai',
    title: 'AI',
    icon: Brain,
    items: [
      { path: '/admin/ai/performance', label: 'AI Performance', icon: Brain },
      { path: '/admin/ai/chat', label: 'AI Chat', icon: MessageSquare },
    ],
  },
  {
    id: 'admin-qa',
    title: 'Admin & QA',
    icon: Shield,
    items: [
      { path: '/admin/qa/control-center', label: 'QA Control Center', icon: Shield },
      { path: '/admin/qa/page-organization', label: 'Page Organization', icon: Layout },
      { path: '/admin/qa/route-health', label: 'Route Health', icon: TrendingUp },
      { path: '/admin/alerts', label: 'Alerts', icon: Bell },
      { path: '/admin/security', label: 'Security Health', icon: Shield },
      { path: '/admin/users', label: 'User Management', icon: UserCog },
      { path: '/admin/access-requests', label: 'Access Requests', icon: UserCog },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
      { path: '/admin/fraud-flags', label: 'Fraud Flags', icon: Shield },
      { path: '/admin/risk', label: 'Risk Review', icon: Shield },
      { path: '/admin/docs', label: 'Internal Docs', icon: FileText },
    ],
  },
];

// ─── QUICK STATUS ITEMS ──────────────────────────────────────
interface QuickStatusItem {
  label: string;
  icon: LucideIcon;
  color: string;
}

const QUICK_STATUS_ITEMS: QuickStatusItem[] = [
  { label: 'Website', icon: Globe, color: 'text-emerald-500' },
  { label: 'CRM', icon: Zap, color: 'text-blue-500' },
  { label: 'Leads', icon: Users, color: 'text-amber-500' },
  { label: 'Dispatch', icon: Truck, color: 'text-violet-500' },
  { label: 'Alerts', icon: AlertCircle, color: 'text-rose-500' },
];

// ─── FAVORITES / RECENTS PERSISTENCE ─────────────────────────
const FAVORITES_KEY = 'calsan-admin-favorites';
const RECENTS_KEY = 'calsan-admin-recents';
const MAX_RECENTS = 5;

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch { return []; }
}

function saveFavorites(favs: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function loadRecents(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
  } catch { return []; }
}

function pushRecent(path: string) {
  const recents = loadRecents().filter(r => r !== path);
  recents.unshift(path);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
}

// ─── FIND NAV ITEM BY PATH ──────────────────────────────────
function findNavItem(path: string): SidebarNavItem | undefined {
  for (const sec of CRM_SIDEBAR_SECTIONS) {
    const item = sec.items.find(i => i.path === path);
    if (item) return item;
  }
  return undefined;
}

// ─── COLLAPSIBLE SECTION ─────────────────────────────────────
function CollapsibleSection({
  section,
  isOpen,
  onToggle,
  currentPath,
  favorites,
  onToggleFavorite,
}: {
  section: SidebarSection;
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  favorites: string[];
  onToggleFavorite: (path: string) => void;
}) {
  const SectionIcon = section.icon;
  const hasActiveChild = section.items.some(item =>
    item.end ? currentPath === item.path : currentPath.startsWith(item.path) && item.path !== '/admin'
  );

  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors',
          hasActiveChild
            ? 'text-primary bg-primary/5'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        )}
      >
        <SectionIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left">{section.title}</span>
        {isOpen ? (
          <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
        ) : (
          <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
        )}
      </button>

      {isOpen && (
        <div className="mt-0.5 ml-2 pl-3 border-l border-border/40 space-y-0.5">
          {section.items.map(item => {
            const Icon = item.icon;
            const isActive = item.end
              ? currentPath === item.path
              : currentPath.startsWith(item.path) && item.path !== '/admin';
            const isFav = favorites.includes(item.path);

            return (
              <div key={item.path} className="group flex items-center">
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={cn(
                    'flex-1 flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.path); }}
                  className={cn(
                    'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                    isFav ? 'opacity-100 text-amber-500' : 'text-muted-foreground hover:text-amber-500'
                  )}
                >
                  <Star className={cn('w-3 h-3', isFav && 'fill-current')} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN SIDEBAR COMPONENT ─────────────────────────────────
interface AdminSidebarProps {
  userEmail?: string;
  onSignOut: () => void;
}

export default function AdminSidebar({ userEmail, onSignOut }: AdminSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Collapsed sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CRM_SIDEBAR_SECTIONS.forEach(s => {
      initial[s.id] = s.defaultOpen || false;
    });
    return initial;
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  // Recents
  const [recents, setRecents] = useState<string[]>(loadRecents);

  // Auto-open section containing active route
  useEffect(() => {
    for (const section of CRM_SIDEBAR_SECTIONS) {
      const hasActive = section.items.some(item =>
        item.end ? currentPath === item.path : currentPath.startsWith(item.path) && item.path !== '/admin'
      );
      if (hasActive) {
        setOpenSections(prev => ({ ...prev, [section.id]: true }));
        break;
      }
    }
    pushRecent(currentPath);
    setRecents(loadRecents());
  }, [currentPath]);

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleFavorite = useCallback((path: string) => {
    setFavorites(prev => {
      const next = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
      saveFavorites(next);
      return next;
    });
  }, []);

  // Resolve favorites and recents to nav items
  const favoriteItems = useMemo(() =>
    favorites.map(findNavItem).filter(Boolean) as SidebarNavItem[], [favorites]
  );

  const recentItems = useMemo(() =>
    recents
      .filter(r => !favorites.includes(r))
      .map(findNavItem)
      .filter(Boolean) as SidebarNavItem[],
    [recents, favorites]
  );

  return (
    <aside className="w-[272px] bg-card border-r border-border flex flex-col shrink-0">
      {/* Logo Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Shield className="w-[18px] h-[18px] text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-foreground leading-tight">Calsan CRM</h1>
              <p className="text-[11px] text-muted-foreground">Operations Platform</p>
            </div>
          </div>
          <AlertBadge />
        </div>
      </div>

      {/* Quick Status Strip */}
      <div className="px-3 py-2.5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between gap-1">
          {QUICK_STATUS_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-md hover:bg-muted/60 transition-colors cursor-default">
                    <Icon className={cn('w-3.5 h-3.5', item.color)} />
                    <span className="text-[9px] font-medium text-muted-foreground leading-none">{item.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {item.label} Status
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Scrollable Nav Area */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Favorites */}
          {favoriteItems.length > 0 && (
            <div className="mb-1">
              <p className="flex items-center gap-1.5 px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
                <Star className="w-3 h-3 fill-amber-500/60" />
                Favorites
              </p>
              <div className="space-y-0.5">
                {favoriteItems.map(item => {
                  const Icon = item.icon;
                  const isActive = item.end ? currentPath === item.path : currentPath.startsWith(item.path) && item.path !== '/admin';
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recents */}
          {recentItems.length > 0 && (
            <div className="mb-1">
              <p className="flex items-center gap-1.5 px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                <Clock className="w-3 h-3" />
                Recent
              </p>
              <div className="space-y-0.5">
                {recentItems.slice(0, 3).map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 transition-all"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          {/* Separator if favorites/recents exist */}
          {(favoriteItems.length > 0 || recentItems.length > 0) && (
            <div className="border-t border-border/40 my-2" />
          )}

          {/* Category Sections */}
          {CRM_SIDEBAR_SECTIONS.map(section => (
            <CollapsibleSection
              key={section.id}
              section={section}
              isOpen={!!openSections[section.id]}
              onToggle={() => toggleSection(section.id)}
              currentPath={currentPath}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </ScrollArea>

      {/* User Footer */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <span className="text-xs font-semibold text-primary">
              {userEmail?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{userEmail || 'Admin'}</p>
            <p className="text-[11px] text-muted-foreground">Administrator</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground text-xs h-8"
          onClick={onSignOut}
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
