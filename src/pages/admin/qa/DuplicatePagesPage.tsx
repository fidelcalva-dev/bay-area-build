import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface DuplicateEntry {
  duplicatePath: string;
  canonicalPath: string;
  recommendation: 'keep-both' | 'remove-duplicate' | 'already-redirecting' | 'alias-ok';
  reason: string;
}

const DUPLICATES: DuplicateEntry[] = [
  {
    duplicatePath: '/dumpster-rental-oakland-ca',
    canonicalPath: '/dumpster-rental/oakland',
    recommendation: 'keep-both',
    reason: 'Static domination page with deeper hand-crafted content. Add canonical to self.',
  },
  {
    duplicatePath: '/dumpster-rental-san-jose-ca',
    canonicalPath: '/dumpster-rental/san-jose',
    recommendation: 'keep-both',
    reason: 'Static domination page with deeper hand-crafted content. Add canonical to self.',
  },
  {
    duplicatePath: '/dumpster-rental-san-francisco-ca',
    canonicalPath: '/dumpster-rental/san-francisco',
    recommendation: 'keep-both',
    reason: 'Static domination page with deeper hand-crafted content. Add canonical to self.',
  },
  {
    duplicatePath: '/admin/ads/overview',
    canonicalPath: '/admin/ads',
    recommendation: 'remove-duplicate',
    reason: 'Both render AdsOverview. Remove /admin/ads/overview route.',
  },
  {
    duplicatePath: '/portal/order/:orderId',
    canonicalPath: '/portal/orders/:orderId',
    recommendation: 'keep-both',
    reason: 'Legacy SMS links may use either pattern. Both resolve to same component.',
  },
  {
    duplicatePath: '/sales/inbox',
    canonicalPath: '/sales/leads',
    recommendation: 'already-redirecting',
    reason: 'Already redirects via Navigate replace.',
  },
  {
    duplicatePath: '/sales/lead-hub',
    canonicalPath: '/sales/leads',
    recommendation: 'already-redirecting',
    reason: 'Already redirects via Navigate replace.',
  },
  {
    duplicatePath: '/admin/seo',
    canonicalPath: '/admin/seo/dashboard',
    recommendation: 'already-redirecting',
    reason: 'Already redirects via Navigate replace.',
  },
  {
    duplicatePath: '/ops/calculator',
    canonicalPath: '/internal/calculator',
    recommendation: 'alias-ok',
    reason: 'Role-based convenience alias. Same component, different context.',
  },
  {
    duplicatePath: '/sales/calculator',
    canonicalPath: '/internal/calculator',
    recommendation: 'alias-ok',
    reason: 'Role-based convenience alias.',
  },
  {
    duplicatePath: '/cs/calculator',
    canonicalPath: '/internal/calculator',
    recommendation: 'alias-ok',
    reason: 'Role-based convenience alias.',
  },
  {
    duplicatePath: '/dispatch/calculator',
    canonicalPath: '/internal/calculator',
    recommendation: 'alias-ok',
    reason: 'Role-based convenience alias.',
  },
];

const REC_COLORS = {
  'keep-both': 'bg-green-100 text-green-800',
  'remove-duplicate': 'bg-red-100 text-red-800',
  'already-redirecting': 'bg-blue-100 text-blue-800',
  'alias-ok': 'bg-muted text-muted-foreground',
};

export default function DuplicatePagesPage() {
  const byRec = {
    'remove-duplicate': DUPLICATES.filter(d => d.recommendation === 'remove-duplicate'),
    'keep-both': DUPLICATES.filter(d => d.recommendation === 'keep-both'),
    'already-redirecting': DUPLICATES.filter(d => d.recommendation === 'already-redirecting'),
    'alias-ok': DUPLICATES.filter(d => d.recommendation === 'alias-ok'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Duplicate Pages Audit</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {DUPLICATES.length} duplicate/alias routes identified across the platform.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{byRec['remove-duplicate'].length}</div>
            <div className="text-xs text-muted-foreground">Should Remove</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{byRec['keep-both'].length}</div>
            <div className="text-xs text-muted-foreground">Keep Both</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{byRec['already-redirecting'].length}</div>
            <div className="text-xs text-muted-foreground">Already Redirecting</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{byRec['alias-ok'].length}</div>
            <div className="text-xs text-muted-foreground">Aliases (OK)</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> All Duplicates</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DUPLICATES.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{d.duplicatePath}</code>
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{d.canonicalPath}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{d.reason}</p>
                </div>
                <Badge className={`${REC_COLORS[d.recommendation]} text-xs flex-shrink-0`}>
                  {d.recommendation.replace(/-/g, ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
