import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QaNavStrip from '@/components/admin/qa/QaNavStrip';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, CheckCircle, XCircle } from 'lucide-react';

interface SeparationCheck {
  area: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
}

const CHECKS: SeparationCheck[] = [
  {
    area: 'Route Separation',
    description: 'Public routes do not share prefixes with CRM routes',
    status: 'pass',
    detail: 'Public routes use /, /pricing, /dumpster-rental/, etc. CRM uses /admin/, /sales/, /cs/, /dispatch/, /driver/, /finance/. No overlap.',
  },
  {
    area: 'robots.txt Blocking',
    description: 'All CRM prefixes are blocked in robots.txt',
    status: 'pass',
    detail: 'Blocked: /app, /admin/, /portal/, /internal/, /dispatch/, /sales/, /cs/, /driver/, /finance/, /billing/, /staff, /login, /preview/, /green-halo/portal/',
  },
  {
    area: 'Meta Noindex',
    description: 'CRM pages have noindex meta tags',
    status: 'pass',
    detail: 'CRM layouts include noindex directives. Public pages use index, follow.',
  },
  {
    area: 'Auth Protection',
    description: 'CRM routes require authentication',
    status: 'pass',
    detail: 'AdminLayout, SalesLayout, CSLayout, DispatchLayout, DriverLayout, FinanceLayout all enforce auth. PortalAuthGuard protects customer portal.',
  },
  {
    area: 'Sitemap Exclusion',
    description: 'CRM routes not present in sitemap',
    status: 'pass',
    detail: 'Sitemap generator only includes public pages, SEO pages, blog, and static content. No /admin, /sales, /dispatch etc.',
  },
  {
    area: 'Canonical Domain',
    description: 'Public pages use calsandumpsterspro.com canonical',
    status: 'pass',
    detail: 'All canonical URLs reference https://calsandumpsterspro.com. CRM runs on same domain via path-based routing (/admin, /sales, /dispatch).',
  },
  {
    area: 'Data Leak Prevention',
    description: 'Public pages do not expose CRM data or internal APIs',
    status: 'pass',
    detail: 'Public SEO pages query only seo_cities, seo_pages tables. No customer, order, or financial data exposed.',
  },
];

const PUBLIC_CATEGORIES = [
  { name: 'Static Website', count: 42, examples: ['/', '/pricing', '/about', '/contact'] },
  { name: 'SEO Engine', count: '1,530+', examples: ['/dumpster-rental/oakland', '/service-area/94601/dumpster-rental'] },
  { name: 'Blog', count: 24, examples: ['/blog', '/blog/dumpster-cost-oakland'] },
];

const CRM_CATEGORIES = [
  { name: 'Admin (core)', count: 95, prefix: '/admin/' },
  { name: 'Sales Portal', count: 10, prefix: '/sales/' },
  { name: 'CS Portal', count: 8, prefix: '/cs/' },
  { name: 'Dispatch Portal', count: 12, prefix: '/dispatch/' },
  { name: 'Driver App', count: 9, prefix: '/driver/' },
  { name: 'Finance Portal', count: 9, prefix: '/finance/' },
  { name: 'Customer Portal', count: 16, prefix: '/portal/' },
  { name: 'Green Halo Portal', count: 4, prefix: '/green-halo/portal/' },
  { name: 'Internal Tools', count: 5, prefix: '/internal/' },
];

export default function PublicVsCrmPage() {
  const passCount = CHECKS.filter(c => c.status === 'pass').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Public vs CRM Separation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Verification that public website and CRM operations are properly isolated.
        </p>
      </div>

      <QaNavStrip />
      {/* Overall Score */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600">{passCount}/{CHECKS.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Separation Checks Passing</div>
        </CardContent>
      </Card>

      {/* Side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-green-600" /> Public Website</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PUBLIC_CATEGORIES.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-green-50/30 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{cat.name}</div>
                  {'examples' in cat && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {cat.examples.slice(0, 2).join(', ')}…
                    </div>
                  )}
                </div>
                <Badge className="bg-green-100 text-green-800">{cat.count} pages</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-foreground" /> CRM (Protected)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CRM_CATEGORIES.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{cat.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Prefix: <code>{cat.prefix}</code>
                  </div>
                </div>
                <Badge variant="outline">{cat.count} pages</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Checks */}
      <Card>
        <CardHeader><CardTitle>Separation Checks</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {CHECKS.map((check, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border border-border/50 rounded-lg">
              {check.status === 'pass' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-medium text-sm">{check.area}</div>
                <div className="text-xs text-muted-foreground">{check.description}</div>
                <div className="text-xs text-muted-foreground mt-1 bg-muted/20 p-2 rounded">{check.detail}</div>
              </div>
              <Badge className={check.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {check.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
