import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertTriangle, XCircle, Search, Globe, Shield } from 'lucide-react';

type RouteStatus = 'working' | 'duplicate' | 'redirect' | 'unrouted';
type RouteCategory = 'public' | 'seo' | 'blog' | 'crm-admin' | 'crm-sales' | 'crm-cs' | 'crm-dispatch' | 'crm-driver' | 'crm-finance' | 'portal' | 'internal' | 'preview' | 'legacy';

interface RouteEntry {
  path: string;
  component: string;
  category: RouteCategory;
  isPublic: boolean;
  indexable: boolean;
  status: RouteStatus;
  note?: string;
}

const ROUTE_INVENTORY: RouteEntry[] = [
  // Public website
  { path: '/', component: 'Index', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/pricing', component: 'Pricing', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/sizes', component: 'Sizes', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/visualizer', component: 'DumpsterVisualizer', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/areas', component: 'Areas', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/materials', component: 'Materials', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/capacity-guide', component: 'CapacityGuide', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/contractors', component: 'Contractors', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/about', component: 'About', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/contact', component: 'Contact', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/quote', component: 'Quote', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/locations', component: 'Locations', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/terms', component: 'Terms', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/privacy', component: 'Privacy', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/why-local-yards', component: 'WhyLocalYards', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/not-a-broker', component: 'NotABroker', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/how-it-works', component: 'HowItWorks', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/why-calsan', component: 'WhyCalsan', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/careers', component: 'Careers', category: 'public', isPublic: true, indexable: true, status: 'working' },
  { path: '/green-halo', component: 'GreenHalo', category: 'public', isPublic: true, indexable: true, status: 'working' },

  // SEO pages
  { path: '/dumpster-rental/:citySlug', component: 'SeoCityPage', category: 'seo', isPublic: true, indexable: true, status: 'working', note: '34 active cities' },
  { path: '/dumpster-rental/:citySlug/:size-yard', component: 'SeoCitySizePage', category: 'seo', isPublic: true, indexable: true, status: 'working', note: '~272 pages' },
  { path: '/dumpster-rental/:citySlug/:materialSlug', component: 'SeoCityMaterialPage', category: 'seo', isPublic: true, indexable: true, status: 'working', note: '170 pages' },
  { path: '/service-area/:zip/dumpster-rental', component: 'SeoZipPage', category: 'seo', isPublic: true, indexable: true, status: 'working', note: '300+ ZIP pages' },
  { path: '/county/:countySlug/dumpster-rental', component: 'SeoCountyPage', category: 'seo', isPublic: true, indexable: true, status: 'working', note: '16 counties' },
  { path: '/use-cases/:useCaseSlug', component: 'SeoUseCasePage', category: 'seo', isPublic: true, indexable: true, status: 'working', note: '6 use cases' },
  { path: '/california-dumpster-rental', component: 'SeoHubPage', category: 'seo', isPublic: true, indexable: true, status: 'working' },
  { path: '/bay-area-dumpster-rental', component: 'SeoHubPage', category: 'seo', isPublic: true, indexable: true, status: 'working' },
  { path: '/dumpster-rental-oakland-ca', component: 'DumpsterRentalOakland', category: 'seo', isPublic: true, indexable: true, status: 'working', note: 'Overlaps /dumpster-rental/oakland' },
  { path: '/dumpster-rental-san-jose-ca', component: 'DumpsterRentalSanJose', category: 'seo', isPublic: true, indexable: true, status: 'working', note: 'Overlaps /dumpster-rental/san-jose' },
  { path: '/dumpster-rental-san-francisco-ca', component: 'DumpsterRentalSanFrancisco', category: 'seo', isPublic: true, indexable: true, status: 'working', note: 'Overlaps /dumpster-rental/san-francisco' },

  // Blog
  { path: '/blog', component: 'Blog', category: 'blog', isPublic: true, indexable: true, status: 'working' },
  { path: '/blog/:articleSlug', component: 'BlogArticle', category: 'blog', isPublic: true, indexable: true, status: 'working', note: '24 articles' },

  // CRM Admin (sample)
  { path: '/admin', component: 'CalsanControlCenter', category: 'crm-admin', isPublic: false, indexable: false, status: 'working' },
  { path: '/admin/orders', component: 'OrdersManager', category: 'crm-admin', isPublic: false, indexable: false, status: 'working' },
  { path: '/admin/customers', component: 'CustomersManager', category: 'crm-admin', isPublic: false, indexable: false, status: 'working' },
  { path: '/admin/ads', component: 'AdsOverview', category: 'crm-admin', isPublic: false, indexable: false, status: 'working' },
  { path: '/admin/ads/overview', component: '→ /admin/ads', category: 'crm-admin', isPublic: false, indexable: false, status: 'redirect', note: 'Redirects to /admin/ads' },

  // Sales
  { path: '/sales', component: 'SalesDashboard', category: 'crm-sales', isPublic: false, indexable: false, status: 'working' },
  { path: '/sales/leads', component: 'SalesLeads', category: 'crm-sales', isPublic: false, indexable: false, status: 'working' },
  { path: '/sales/inbox', component: '→ /sales/leads', category: 'crm-sales', isPublic: false, indexable: false, status: 'redirect' },

  // Dispatch
  { path: '/dispatch', component: 'DispatchDashboard', category: 'crm-dispatch', isPublic: false, indexable: false, status: 'working' },
  { path: '/dispatch/requests', component: 'DispatchRequests', category: 'crm-dispatch', isPublic: false, indexable: false, status: 'working' },

  // Driver
  { path: '/driver', component: 'DriverHome', category: 'crm-driver', isPublic: false, indexable: false, status: 'working' },

  // Finance
  { path: '/finance', component: 'FinanceDashboard', category: 'crm-finance', isPublic: false, indexable: false, status: 'working' },

  // Portal
  { path: '/portal', component: 'CustomerLogin', category: 'portal', isPublic: false, indexable: false, status: 'working' },
  { path: '/portal/dashboard', component: 'CustomerDashboard', category: 'portal', isPublic: false, indexable: false, status: 'working' },

  // Internal
  { path: '/internal/calculator', component: 'InternalCalculator', category: 'internal', isPublic: false, indexable: false, status: 'working' },
  { path: '/ops/calculator', component: 'InternalCalculator', category: 'internal', isPublic: false, indexable: false, status: 'duplicate', note: 'Alias of /internal/calculator' },

  // Legacy
  { path: '/:citySlug/:sizeSlug-yard-dumpster', component: 'LegacySizeRedirect', category: 'legacy', isPublic: true, indexable: false, status: 'redirect' },
  { path: '/:citySlug/:subSlug', component: 'LegacySubpageRedirect', category: 'legacy', isPublic: true, indexable: false, status: 'redirect' },
];

const STATUS_CONFIG = {
  working: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 text-green-800' },
  duplicate: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 text-amber-800' },
  redirect: { icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-100 text-blue-800' },
  unrouted: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 text-red-800' },
};

const CATEGORY_LABELS: Record<RouteCategory, string> = {
  'public': 'Public Website',
  'seo': 'SEO Engine',
  'blog': 'Blog',
  'crm-admin': 'CRM Admin',
  'crm-sales': 'CRM Sales',
  'crm-cs': 'CRM CS',
  'crm-dispatch': 'CRM Dispatch',
  'crm-driver': 'CRM Driver',
  'crm-finance': 'CRM Finance',
  'portal': 'Customer Portal',
  'internal': 'Internal Tools',
  'preview': 'Preview',
  'legacy': 'Legacy Redirect',
};

export default function RouteHealthPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return ROUTE_INVENTORY.filter(r => {
      if (search && !r.path.toLowerCase().includes(search.toLowerCase()) && !r.component.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter]);

  const counts = useMemo(() => ({
    total: ROUTE_INVENTORY.length,
    working: ROUTE_INVENTORY.filter(r => r.status === 'working').length,
    duplicate: ROUTE_INVENTORY.filter(r => r.status === 'duplicate').length,
    redirect: ROUTE_INVENTORY.filter(r => r.status === 'redirect').length,
    public: ROUTE_INVENTORY.filter(r => r.isPublic).length,
    protected: ROUTE_INVENTORY.filter(r => !r.isPublic).length,
    indexable: ROUTE_INVENTORY.filter(r => r.indexable).length,
  }), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Route Health Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete inventory of all routes in the platform. See docs/ROUTE-INVENTORY-REPORT.md for full details.
        </p>
      </div>

      <QaNavStrip />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{counts.total}</div>
            <div className="text-xs text-muted-foreground">Total Routes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{counts.working}</div>
            <div className="text-xs text-muted-foreground">Working</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{counts.duplicate}</div>
            <div className="text-xs text-muted-foreground">Duplicates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{counts.redirect}</div>
            <div className="text-xs text-muted-foreground">Redirects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1"><Globe className="w-4 h-4" /> {counts.public}</div>
            <div className="text-xs text-muted-foreground">Public</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1"><Shield className="w-4 h-4" /> {counts.protected}</div>
            <div className="text-xs text-muted-foreground">Protected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{counts.indexable}</div>
            <div className="text-xs text-muted-foreground">Indexable</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search routes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="working">Working</SelectItem>
            <SelectItem value="duplicate">Duplicate</SelectItem>
            <SelectItem value="redirect">Redirect</SelectItem>
            <SelectItem value="unrouted">Unrouted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Route Table */}
      <Card>
        <CardHeader><CardTitle>Routes ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 px-3">Route</th>
                  <th className="py-2 px-3">Component</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Access</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const cfg = STATUS_CONFIG[r.status];
                  const Icon = cfg.icon;
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-mono text-xs">{r.path}</td>
                      <td className="py-2 px-3 text-xs">{r.component}</td>
                      <td className="py-2 px-3"><Badge variant="outline" className="text-xs">{CATEGORY_LABELS[r.category]}</Badge></td>
                      <td className="py-2 px-3">
                        {r.isPublic ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">Public</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground text-xs">Protected</Badge>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 text-xs ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {r.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{r.note || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
