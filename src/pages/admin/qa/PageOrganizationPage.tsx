import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, Shield, Users, AlertTriangle, CheckCircle2, XCircle,
  BarChart3, Link2, Eye
} from 'lucide-react';
import {
  ALL_ROUTES,
  getRoutesByGroup,
  getGroupSummary,
  getSubcategorySummary,
  getOrphanedRoutes,
  getAliasRoutes,
  type RouteEntry,
  type RouteGroup,
} from '@/lib/routeCategories';

const groupIcons: Record<RouteGroup, typeof Globe> = {
  PUBLIC_WEBSITE: Globe,
  CRM_INTERNAL: Shield,
  CUSTOMER_PORTAL: Users,
};

const groupColors: Record<RouteGroup, string> = {
  PUBLIC_WEBSITE: 'text-emerald-600',
  CRM_INTERNAL: 'text-blue-600',
  CUSTOMER_PORTAL: 'text-violet-600',
};

function RouteRow({ route }: { route: RouteEntry }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-foreground truncate">{route.path}</code>
          {route.isDynamic && <Badge variant="outline" className="text-[10px] px-1.5 py-0">dynamic</Badge>}
          {route.canonicalAlias && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">alias</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{route.name}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Badge variant="outline" className="text-[10px]">{route.subcategory}</Badge>
        {route.mounted ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-destructive" />
        )}
        {route.indexable ? (
          <Eye className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Eye className="w-3.5 h-3.5 text-muted-foreground/30" />
        )}
      </div>
    </div>
  );
}

export default function PageOrganizationPage() {
  const groupSummary = useMemo(() => getGroupSummary(), []);
  const subcategorySummary = useMemo(() => getSubcategorySummary(), []);
  const orphaned = useMemo(() => getOrphanedRoutes(), []);
  const aliases = useMemo(() => getAliasRoutes(), []);
  const publicRoutes = useMemo(() => getRoutesByGroup('PUBLIC_WEBSITE'), []);
  const crmRoutes = useMemo(() => getRoutesByGroup('CRM_INTERNAL'), []);
  const portalRoutes = useMemo(() => getRoutesByGroup('CUSTOMER_PORTAL'), []);

  const totalRoutes = ALL_ROUTES.length;
  const mountedRoutes = ALL_ROUTES.filter(r => r.mounted).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Page Organization</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete route inventory across Public Website, CRM, and Customer Portal
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalRoutes}</p>
            <p className="text-xs text-muted-foreground">Total Routes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{mountedRoutes}</p>
            <p className="text-xs text-muted-foreground">Mounted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{orphaned.length}</p>
            <p className="text-xs text-muted-foreground">Orphaned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{aliases.length}</p>
            <p className="text-xs text-muted-foreground">Aliases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{groupSummary.PUBLIC_WEBSITE}</p>
            <p className="text-xs text-muted-foreground">Public</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{groupSummary.CRM_INTERNAL}</p>
            <p className="text-xs text-muted-foreground">CRM</p>
          </CardContent>
        </Card>
      </div>

      {/* Orphaned Warning */}
      {orphaned.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Orphaned Routes ({orphaned.length})
            </CardTitle>
            <CardDescription className="text-xs">
              These pages are imported but have no mounted route in App.tsx
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {orphaned.map(r => (
                <div key={r.path} className="flex items-center gap-2 text-xs">
                  <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                  <code className="font-mono">{r.path}</code>
                  <span className="text-muted-foreground">— {r.name}</span>
                  <Badge variant="outline" className="text-[10px]">{r.subcategory}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subcategory Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Subcategory Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(subcategorySummary)
              .sort((a, b) => b[1] - a[1])
              .map(([sub, count]) => (
                <div key={sub} className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg">
                  <span className="text-xs font-medium">{sub}</span>
                  <Badge variant="secondary" className="text-xs">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Tables */}
      <Tabs defaultValue="public" className="space-y-4">
        <TabsList>
          <TabsTrigger value="public" className="gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Public ({publicRoutes.length})
          </TabsTrigger>
          <TabsTrigger value="crm" className="gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            CRM ({crmRoutes.length})
          </TabsTrigger>
          <TabsTrigger value="portal" className="gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Portal ({portalRoutes.length})
          </TabsTrigger>
          <TabsTrigger value="aliases" className="gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            Aliases ({aliases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                {publicRoutes.map(r => <RouteRow key={r.path} route={r} />)}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                {crmRoutes.map(r => <RouteRow key={r.path} route={r} />)}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                {portalRoutes.map(r => <RouteRow key={r.path} route={r} />)}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aliases">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                {aliases.map(r => (
                  <div key={r.path} className="flex items-center justify-between py-2 px-3 border-b border-border/50">
                    <div>
                      <code className="text-xs font-mono">{r.path}</code>
                      <p className="text-xs text-muted-foreground">→ {r.canonicalAlias}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{r.subcategory}</Badge>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
