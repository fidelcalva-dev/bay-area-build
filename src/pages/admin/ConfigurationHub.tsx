import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Warehouse, MapPin, DollarSign, Layers, AlertTriangle, Plus, 
  ChevronRight, Settings, Banknote, Scale, Shield, History,
  FileText, Bell, Users, Clock, Loader2, Activity, BarChart3,
  MessageSquare, Globe, Zap, Truck, HardHat, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PermissionGate, PendingChangesPanel } from '@/components/admin/config';
import { useAdminPermissions, type AdminModule } from '@/hooks/useAdminPermissions';

interface ModuleInfo {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  module: AdminModule;
  color: string;
  bgColor: string;
  isCritical?: boolean;
}

const configModules: ModuleInfo[] = [
  {
    title: 'Yards & Locations',
    description: 'Manage operational yards, coordinates, and hours',
    icon: Warehouse,
    path: '/admin/yards',
    module: 'yards',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'ZIP / Zones / Markets',
    description: 'Map ZIP codes to pricing zones and markets',
    icon: MapPin,
    path: '/admin/zones',
    module: 'zones',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'City Rates',
    description: 'Per-city overage and prepay rates',
    icon: Banknote,
    path: '/admin/pricing?tab=cities',
    module: 'city_rates',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    isCritical: true,
  },
  {
    title: 'Toll Surcharges',
    description: 'Bridge and route surcharges',
    icon: DollarSign,
    path: '/admin/pricing?tab=zones',
    module: 'toll_surcharges',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    isCritical: true,
  },
  {
    title: 'Heavy Pricing',
    description: 'Material increments and size factors',
    icon: Scale,
    path: '/admin/pricing?tab=heavy',
    module: 'heavy_pricing',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    isCritical: true,
  },
  {
    title: 'Mixed/Debris Rules',
    description: 'Overage rates and included tonnage',
    icon: Layers,
    path: '/admin/pricing?tab=materials',
    module: 'mixed_rules',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Extras Catalog',
    description: 'Add-ons and optional services',
    icon: Plus,
    path: '/admin/pricing?tab=extras',
    module: 'extras',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    title: 'Warnings & Caps',
    description: 'Distance limits and ZIP warnings',
    icon: AlertTriangle,
    path: '/admin/pricing?tab=readiness',
    module: 'warnings_caps',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    title: 'Business Rules',
    description: 'Office hours and system settings',
    icon: Settings,
    path: '/admin/config',
    module: 'config',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  {
    title: 'Contracts & Signatures',
    description: 'MSA templates and signature rules',
    icon: FileText,
    path: '/admin/contracts-config',
    module: 'contracts',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    title: 'Notifications',
    description: 'SMS/Email templates and triggers',
    icon: Bell,
    path: '/admin/notifications-config',
    module: 'notifications',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    title: 'Programs & Discounts',
    description: 'Volume commitments and approval rules',
    icon: Users,
    path: '/admin/pricing?tab=volume',
    module: 'programs',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    isCritical: true,
  },
  {
    title: 'Fraud & Risk Controls',
    description: 'Risk thresholds and deposit rules',
    icon: Shield,
    path: '/admin/fraud-controls',
    module: 'fraud',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
];

const salesModules: ModuleInfo[] = [
  {
    title: 'Lead Hub',
    description: 'Unified lead pipeline for both brands',
    icon: Zap,
    path: '/sales/leads',
    module: 'leads' as AdminModule,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    title: 'Internal Calculator',
    description: 'Master quote tool for staff',
    icon: DollarSign,
    path: '/sales/quotes/new',
    module: 'config' as AdminModule,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
  },
  {
    title: 'Lead Engine Settings',
    description: 'Scoring, routing, and automation rules',
    icon: Settings,
    path: '/admin/leads/settings',
    module: 'config' as AdminModule,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
  },
];

const operationsModules: ModuleInfo[] = [
  {
    title: 'Dispatch',
    description: 'Daily dispatch operations',
    icon: Truck,
    path: '/dispatch',
    module: 'config' as AdminModule,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Control Tower',
    description: 'Real-time fleet and asset tracking',
    icon: Activity,
    path: '/dispatch/control-tower',
    module: 'config' as AdminModule,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    title: 'Inventory',
    description: 'Dumpster fleet and asset management',
    icon: Warehouse,
    path: '/admin/inventory',
    module: 'config' as AdminModule,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
];

const integrationModules: ModuleInfo[] = [
  {
    title: 'GHL Integration',
    description: 'GoHighLevel communication sync',
    icon: MessageSquare,
    path: '/admin/ghl',
    module: 'config' as AdminModule,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Notifications',
    description: 'SMS/Email routing and templates',
    icon: Bell,
    path: '/admin/notifications-config',
    module: 'notifications' as AdminModule,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    title: 'SEO Dashboard',
    description: 'Organic search performance',
    icon: Globe,
    path: '/admin/seo/dashboard',
    module: 'config' as AdminModule,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

const systemModules: ModuleInfo[] = [
  {
    title: 'User Management',
    description: 'Manage admin roles and permissions',
    icon: Users,
    path: '/admin/users',
    module: 'users',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
  {
    title: 'Audit Logs',
    description: 'View all configuration changes',
    icon: History,
    path: '/admin/audit-logs',
    module: 'audit',
    color: 'text-stone-600',
    bgColor: 'bg-stone-100',
  },
  {
    title: 'QA Control Center',
    description: 'Route, build, and config health',
    icon: CheckCircle2,
    path: '/admin/qa/control-center',
    module: 'config' as AdminModule,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    title: 'Security Health',
    description: 'Security posture and vulnerabilities',
    icon: Shield,
    path: '/admin/security',
    module: 'config' as AdminModule,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
];

interface LastUpdate {
  module: string;
  updatedAt: string;
  updatedBy: string;
}

export default function ConfigurationHub() {
  const navigate = useNavigate();
  const { hasPermission, isSystemAdmin, isLoading: permissionsLoading } = useAdminPermissions();
  const [lastUpdates, setLastUpdates] = useState<Record<string, LastUpdate>>({});
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);

  useEffect(() => {
    async function fetchLastUpdates() {
      // Get most recent version for each module
      const { data } = await supabase
        .from('config_versions')
        .select('module, created_at, proposed_by_email')
        .order('created_at', { ascending: false });

      if (data) {
        const updates: Record<string, LastUpdate> = {};
        data.forEach((v) => {
          if (!updates[v.module]) {
            updates[v.module] = {
              module: v.module,
              updatedAt: v.created_at,
              updatedBy: v.proposed_by_email || 'Unknown',
            };
          }
        });
        setLastUpdates(updates);
      }
      setIsLoadingUpdates(false);
    }

    fetchLastUpdates();
  }, []);

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PermissionGate module="config" action="read">
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuration Center</h1>
          <p className="text-muted-foreground mt-1">
            Navigate to pricing, zones, yards, and operational modules. For raw key-value business rules, use{' '}
            <a href="/admin/config" className="text-primary underline underline-offset-2 hover:text-primary/80">Business Config</a>.
          </p>
        </div>

        {/* Pending Changes Alert */}
        <PendingChangesPanel onChangeApplied={() => window.location.reload()} />

        {/* Role Badge */}
        <div className="flex items-center gap-2">
          <Badge variant={isSystemAdmin() ? 'default' : 'secondary'}>
            {isSystemAdmin() ? 'System Admin' : 'Limited Access'}
          </Badge>
          {!isSystemAdmin() && (
            <span className="text-sm text-muted-foreground">
              Some changes may require approval
            </span>
          )}
        </div>

        {/* Configuration Modules */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Configuration Modules</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configModules.map((mod) => renderModuleCard(mod))}
          </div>
        </div>

        {/* Sales & Leads */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Sales & Leads</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesModules.map((mod) => renderModuleCard(mod))}
          </div>
        </div>

        {/* Operations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Operations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operationsModules.map((mod) => renderModuleCard(mod))}
          </div>
        </div>

        {/* Integrations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Integrations & SEO</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationModules.map((mod) => renderModuleCard(mod))}
          </div>

              return (
                <Card
                  key={mod.path}
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    !canWrite ? 'opacity-75' : ''
                  }`}
                  onClick={() => navigate(mod.path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${mod.bgColor}`}>
                        <Icon className={`w-5 h-5 ${mod.color}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        {mod.isCritical && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                        {!canWrite && (
                          <Badge variant="secondary" className="text-xs">
                            Read-only
                          </Badge>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{mod.title}</CardTitle>
                    <CardDescription>{mod.description}</CardDescription>
                  </CardHeader>
                  {lastUpdate && !isLoadingUpdates && (
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          Updated {format(new Date(lastUpdate.updatedAt), 'MMM d')} by{' '}
                          {lastUpdate.updatedBy.split('@')[0]}
                        </span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Modules (Admin Only) */}
        {isSystemAdmin() && (
          <div>
            <h2 className="text-lg font-semibold mb-4">System Administration</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemModules.map((mod) => {
                const Icon = mod.icon;

                return (
                  <Card
                    key={mod.path}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => navigate(mod.path)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${mod.bgColor}`}>
                          <Icon className={`w-5 h-5 ${mod.color}`} />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{mod.title}</CardTitle>
                      <CardDescription>{mod.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuration Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {Object.keys(lastUpdates).length}
                </p>
                <p className="text-xs text-muted-foreground">Modules Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-muted-foreground">Pending Approvals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">0</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">
                  {isLoadingUpdates ? '...' : 'Healthy'}
                </p>
                <p className="text-xs text-muted-foreground">System Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
