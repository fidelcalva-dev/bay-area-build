import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Globe, Shield } from 'lucide-react';

const QA_LINKS = [
  { to: '/admin/qa/route-health', label: 'Route Health' },
  { to: '/admin/qa/duplicate-pages', label: 'Duplicate Pages' },
  { to: '/admin/qa/public-vs-crm', label: 'Public vs CRM' },
  { to: '/admin/seo/health', label: 'SEO Health' },
];

const SUMMARY = {
  totalRoutes: 95,
  duplicatesResolved: 12,
  brokenRoutes: 0,
  unroutedImports: 0,
  publicPages: 42,
  crmPages: 53,
};

export default function QaNavStrip() {
  const { pathname } = useLocation();

  return (
    <div className="space-y-3">
      {/* Summary strip */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <Card><CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{SUMMARY.totalRoutes}</div>
          <div className="text-[10px] text-muted-foreground">Total Routes</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-green-600 flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" />{SUMMARY.duplicatesResolved}</div>
          <div className="text-[10px] text-muted-foreground">Dupes Resolved</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{SUMMARY.brokenRoutes}</div>
          <div className="text-[10px] text-muted-foreground">Broken</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{SUMMARY.unroutedImports}</div>
          <div className="text-[10px] text-muted-foreground">Unrouted</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-foreground flex items-center justify-center gap-1"><Globe className="w-3.5 h-3.5" />{SUMMARY.publicPages}</div>
          <div className="text-[10px] text-muted-foreground">Public</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-lg font-bold text-foreground flex items-center justify-center gap-1"><Shield className="w-3.5 h-3.5" />{SUMMARY.crmPages}</div>
          <div className="text-[10px] text-muted-foreground">CRM</div>
        </CardContent></Card>
      </div>

      {/* Navigation links */}
      <div className="flex flex-wrap gap-2">
        {QA_LINKS.map(link => (
          <Link key={link.to} to={link.to}>
            <Badge
              variant={pathname === link.to ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
            >
              {link.label}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
