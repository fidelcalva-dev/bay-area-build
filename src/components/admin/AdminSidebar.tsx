import { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Shield, LogOut, Star, Clock, ChevronDown, ChevronRight,
  Search, X, Globe, Zap, Users, Truck, Bell,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertBadge } from '@/components/alerts';
import { Input } from '@/components/ui/input';
import {
  SIDEBAR_SECTIONS,
  getSidebarItems,
  getVisibleSections,
  searchSidebarItems,
  type SidebarSectionMeta,
  type RouteEntry,
  type VisibleRole,
} from '@/lib/routeCategories';
import { useAdminAuth, type AppRole } from '@/hooks/useAdminAuth';
import { useAlerts } from '@/hooks/useAlerts';
import { supabase } from '@/integrations/supabase/client';

// ─── ROLE MAPPING ────────────────────────────────────────────────
function mapRolesToVisibleRoles(roles: AppRole[]): VisibleRole[] {
  const map: Record<string, VisibleRole> = {
    admin: 'admin',
    sales: 'sales',
    cs: 'cs',
    cs_agent: 'cs',
    dispatcher: 'dispatcher',
    finance: 'finance',
    driver: 'driver',
    ops_admin: 'ops_admin',
    executive: 'executive',
    system_admin: 'admin',
    sales_admin: 'sales',
    finance_admin: 'finance',
    read_only_admin: 'admin',
    billing_specialist: 'finance',
  };
  const result = new Set<VisibleRole>();
  roles.forEach(r => {
    const mapped = map[r];
    if (mapped) result.add(mapped);
  });
  return Array.from(result);
}

// ─── QUICK STATUS TYPES ──────────────────────────────────────────
type StatusLevel = 'LIVE' | 'WARNING' | 'ERROR' | 'NO_DATA';

interface QuickStatusData {
  label: string;
  icon: LucideIcon;
  status: StatusLevel;
}

const statusColors: Record<StatusLevel, string> = {
  LIVE: 'text-emerald-500',
  WARNING: 'text-amber-500',
  ERROR: 'text-destructive',
  NO_DATA: 'text-muted-foreground',
};

const statusDots: Record<StatusLevel, string> = {
  LIVE: 'bg-emerald-500',
  WARNING: 'bg-amber-500',
  ERROR: 'bg-destructive',
  NO_DATA: 'bg-muted-foreground/40',
};

// ─── QUICK STATUS HOOK ──────────────────────────────────────────
function useQuickStatus(): QuickStatusData[] {
  const { criticalCount } = useAlerts({ resolved: false });
  const [leadStatus, setLeadStatus] = useState<StatusLevel>('NO_DATA');
  const [dispatchStatus, setDispatchStatus] = useState<StatusLevel>('NO_DATA');

  useEffect(() => {
    // Check lead health: pending fallback queue entries = WARNING, recent errors = ERROR
    const checkLeads = async () => {
      try {
        const { count: fallbackCount } = await supabase
          .from('lead_fallback_queue')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (fallbackCount && fallbackCount > 0) {
          setLeadStatus('WARNING');
        } else {
          setLeadStatus('LIVE');
        }
      } catch {
        setLeadStatus('NO_DATA');
      }
    };

    // Check dispatch: today's runs exist = LIVE
    const checkDispatch = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('runs')
          .select('*', { count: 'exact', head: true })
          .gte('scheduled_date', today)
          .lte('scheduled_date', today);
        
        setDispatchStatus(count !== null && count >= 0 ? 'LIVE' : 'NO_DATA');
      } catch {
        setDispatchStatus('NO_DATA');
      }
    };

    checkLeads();
    checkDispatch();
  }, []);

  const alertStatus: StatusLevel = criticalCount > 0 ? 'ERROR' : 'LIVE';

  return [
    { label: 'Website', icon: Globe, status: 'LIVE' },
    { label: 'CRM', icon: Zap, status: 'LIVE' },
    { label: 'Leads', icon: Users, status: leadStatus },
    { label: 'Dispatch', icon: Truck, status: dispatchStatus },
    { label: 'Alerts', icon: Bell, status: alertStatus },
  ];
}

// ─── FAVORITES / RECENTS PERSISTENCE ─────────────────────────────
const FAVORITES_KEY = 'calsan-admin-favorites';
const RECENTS_KEY = 'calsan-admin-recents';
const MAX_RECENTS = 5;

function loadFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
  catch { return []; }
}

function saveFavorites(favs: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function loadRecents(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); }
  catch { return []; }
}

function pushRecent(path: string) {
  const recents = loadRecents().filter(r => r !== path);
  recents.unshift(path);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
}

// ─── FIND SIDEBAR ITEM BY PATH ──────────────────────────────────
function findSidebarRoute(path: string): RouteEntry | undefined {
  // Search all sidebar items in all sections
  for (const section of SIDEBAR_SECTIONS) {
    const items = getSidebarItems(section.id);
    const item = items.find(i => i.path === path);
    if (item) return item;
  }
  return undefined;
}

// ─── IS ACTIVE CHECK ─────────────────────────────────────────────
function isItemActive(item: RouteEntry, currentPath: string): boolean {
  if (item.sidebarEnd) return currentPath === item.path;
  return currentPath.startsWith(item.path) && item.path !== '/admin';
}

// ─── COLLAPSIBLE SECTION ─────────────────────────────────────────
function CollapsibleSection({
  section,
  items,
  isOpen,
  onToggle,
  currentPath,
  favorites,
  onToggleFavorite,
}: {
  section: SidebarSectionMeta;
  items: RouteEntry[];
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  favorites: string[];
  onToggleFavorite: (path: string) => void;
}) {
  const SectionIcon = section.icon;
  const hasActiveChild = items.some(item => isItemActive(item, currentPath));

  if (items.length === 0) return null;

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
        <span className="text-[10px] font-normal text-muted-foreground/60 tabular-nums mr-1">{items.length}</span>
        {isOpen ? (
          <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
        ) : (
          <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
        )}
      </button>

      {isOpen && (
        <div className="mt-0.5 ml-2 pl-3 border-l border-border/40 space-y-0.5">
          {items.map(item => {
            const Icon = item.sidebarIcon!;
            const active = isItemActive(item, currentPath);
            const isFav = favorites.includes(item.path);

            return (
              <div key={item.path} className="group flex items-center">
                <NavLink
                  to={item.path}
                  end={item.sidebarEnd}
                  className={cn(
                    'flex-1 flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.sidebarLabel || item.name}</span>
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

// ─── MAIN SIDEBAR COMPONENT ─────────────────────────────────────
interface AdminSidebarProps {
  userEmail?: string;
  onSignOut: () => void;
}

export default function AdminSidebar({ userEmail, onSignOut }: AdminSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { roles } = useAdminAuth();
  const quickStatus = useQuickStatus();

  const visibleRoles = useMemo(() => mapRolesToVisibleRoles(roles), [roles]);

  // Visible sections for this user
  const visibleSections = useMemo(() => getVisibleSections(visibleRoles), [visibleRoles]);

  // Items per section
  const sectionItems = useMemo(() => {
    const map: Record<string, RouteEntry[]> = {};
    visibleSections.forEach(s => {
      map[s.id] = getSidebarItems(s.id, visibleRoles);
    });
    return map;
  }, [visibleSections, visibleRoles]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useMemo(
    () => searchSidebarItems(searchQuery, visibleRoles),
    [searchQuery, visibleRoles]
  );

  // Collapsed sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SIDEBAR_SECTIONS.forEach(s => { initial[s.id] = s.defaultOpen || false; });
    return initial;
  });

  // Favorites & Recents
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [recents, setRecents] = useState<string[]>(loadRecents);

  // Auto-open section containing active route
  useEffect(() => {
    for (const section of visibleSections) {
      const items = sectionItems[section.id] || [];
      const hasActive = items.some(item => isItemActive(item, currentPath));
      if (hasActive) {
        setOpenSections(prev => ({ ...prev, [section.id]: true }));
        break;
      }
    }
    pushRecent(currentPath);
    setRecents(loadRecents());
  }, [currentPath, visibleSections, sectionItems]);

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

  // Resolve favorites and recents to route entries
  const favoriteItems = useMemo(() =>
    favorites.map(findSidebarRoute).filter(Boolean) as RouteEntry[], [favorites]
  );

  const recentItems = useMemo(() =>
    recents
      .filter(r => !favorites.includes(r))
      .map(findSidebarRoute)
      .filter(Boolean) as RouteEntry[],
    [recents, favorites]
  );

  const isSearching = searchQuery.trim().length > 0;

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
          {quickStatus.map(item => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 px-1.5 py-1 rounded-md hover:bg-muted/60 transition-colors cursor-default">
                    <div className="relative">
                      <Icon className={cn('w-3.5 h-3.5', statusColors[item.status])} />
                      <span className={cn(
                        'absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full',
                        statusDots[item.status]
                      )} />
                    </div>
                    <span className="text-[9px] font-medium text-muted-foreground leading-none">{item.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {item.label}: {item.status}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages..."
            className="h-8 pl-8 pr-8 text-xs bg-muted/40 border-border/60"
          />
          {isSearching && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Nav Area */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* ─── SEARCH RESULTS ─── */}
          {isSearching ? (
            <div>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.length === 0 ? (
                <p className="px-3 text-xs text-muted-foreground py-4 text-center">
                  No pages match "{searchQuery}"
                </p>
              ) : (
                <div className="space-y-0.5">
                  {searchResults.map(item => {
                    const Icon = item.sidebarIcon!;
                    const active = isItemActive(item, currentPath);
                    const section = SIDEBAR_SECTIONS.find(s => s.id === item.sidebarSection);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.sidebarEnd}
                        onClick={() => setSearchQuery('')}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all',
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="truncate block">{item.sidebarLabel || item.name}</span>
                          <span className="text-[10px] opacity-60 truncate block">{section?.title}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ─── FAVORITES ─── */}
              {favoriteItems.length > 0 && (
                <div className="mb-1">
                  <p className="flex items-center gap-1.5 px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
                    <Star className="w-3 h-3 fill-amber-500/60" />
                    Favorites
                  </p>
                  <div className="space-y-0.5">
                    {favoriteItems.map(item => {
                      const Icon = item.sidebarIcon!;
                      const active = isItemActive(item, currentPath);
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.sidebarEnd}
                          className={cn(
                            'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all',
                            active
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.sidebarLabel || item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── RECENTS ─── */}
              {recentItems.length > 0 && (
                <div className="mb-1">
                  <p className="flex items-center gap-1.5 px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    <Clock className="w-3 h-3" />
                    Recent
                  </p>
                  <div className="space-y-0.5">
                    {recentItems.slice(0, 3).map(item => {
                      const Icon = item.sidebarIcon!;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.sidebarEnd}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.sidebarLabel || item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── EMPTY STATE ─── */}
              {favoriteItems.length === 0 && recentItems.length === 0 && (
                <div className="px-3 py-2 text-[11px] text-muted-foreground/50 text-center italic">
                  Star items to pin them here
                </div>
              )}

              {/* Separator */}
              {(favoriteItems.length > 0 || recentItems.length > 0) && (
                <div className="border-t border-border/40 my-2" />
              )}

              {/* ─── CATEGORY SECTIONS ─── */}
              {visibleSections.map(section => (
                <CollapsibleSection
                  key={section.id}
                  section={section}
                  items={sectionItems[section.id] || []}
                  isOpen={!!openSections[section.id]}
                  onToggle={() => toggleSection(section.id)}
                  currentPath={currentPath}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </>
          )}
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
            <p className="text-[11px] text-muted-foreground">
              {roles.length > 0 ? roles[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Staff'}
            </p>
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
