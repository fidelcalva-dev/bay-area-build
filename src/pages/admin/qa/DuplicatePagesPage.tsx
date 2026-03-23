import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import QaNavStrip from '@/components/admin/qa/QaNavStrip';

type FinalDecision = 'REMOVE_DUPLICATE' | 'REDIRECT_TO_CANONICAL' | 'KEEP_BOTH_WITH_UNIQUE_CANONICAL' | 'KEEP_ALIAS';

interface DuplicateEntry {
  duplicatePath: string;
  canonicalPath: string;
  category: 'crm' | 'public-seo' | 'legacy-redirect' | 'alias';
  decision: FinalDecision;
  reason: string;
}

const DUPLICATES: DuplicateEntry[] = [
  // ── CRM DUPLICATE ──
  {
    duplicatePath: '/admin/ads/overview',
    canonicalPath: '/admin/ads',
    category: 'crm',
    decision: 'REDIRECT_TO_CANONICAL',
    reason: 'Same component (AdsOverview). Route now redirects via Navigate replace.',
  },
  // ── PUBLIC SEO — DOMINATION PAGES ──
  {
    duplicatePath: '/dumpster-rental/oakland',
    canonicalPath: '/dumpster-rental-oakland-ca',
    category: 'public-seo',
    decision: 'REDIRECT_TO_CANONICAL',
    reason: 'Programmatic page redirects to hand-crafted domination page. 301 redirect active.',
  },
  {
    duplicatePath: '/dumpster-rental/san-jose',
    canonicalPath: '/dumpster-rental-san-jose-ca',
    category: 'public-seo',
    decision: 'REDIRECT_TO_CANONICAL',
    reason: 'Programmatic page redirects to hand-crafted domination page. 301 redirect active.',
  },
  {
    duplicatePath: '/dumpster-rental/san-francisco',
    canonicalPath: '/dumpster-rental-san-francisco-ca',
    category: 'public-seo',
    decision: 'REDIRECT_TO_CANONICAL',
    reason: 'Programmatic page redirects to hand-crafted domination page. 301 redirect active.',
  },
  // ── LEGACY REDIRECTS (already active) ──
  {
    duplicatePath: '/sales/inbox',
    canonicalPath: '/sales/leads',
    category: 'legacy-redirect',
    decision: 'REDIRECT_TO_CANONICAL',
    reason: 'Navigate replace already in place. No standalone component.',
  },
  {
    duplicatePath: '/sales/lead-hub',
    canonicalPath: '/sales/leads',
    category: 'legacy-redirect',
    decision: 'REDIRECT_TO_CANONICAL',
    reason: 'Navigate replace already in place. No standalone component.',
  },
  {
    duplicatePath: '/admin/seo',
    canonicalPath: '/admin/seo/dashboard',
    category: 'legacy-redirect',
    decision: 'REDIRECT_TO_CANONICAL',
    reason: 'Navigate replace already in place. Index route redirects to dashboard.',
  },
  // ── KEPT ALIASES ──
  {
    duplicatePath: '/portal/order/:orderId',
    canonicalPath: '/portal/orders/:orderId',
    category: 'alias',
    decision: 'KEEP_ALIAS',
    reason: 'Legacy SMS links use singular "/order/". Both noindex + auth-protected. No SEO impact.',
  },
  {
    duplicatePath: '/ops/calculator',
    canonicalPath: '/internal/calculator',
    category: 'alias',
    decision: 'KEEP_ALIAS',
    reason: 'Role-based nav convenience. Protected, noindex. No SEO impact.',
  },
  {
    duplicatePath: '/sales/calculator',
    canonicalPath: '/internal/calculator',
    category: 'alias',
    decision: 'KEEP_ALIAS',
    reason: 'Role-based nav convenience. Protected, noindex.',
  },
  {
    duplicatePath: '/cs/calculator',
    canonicalPath: '/internal/calculator',
    category: 'alias',
    decision: 'KEEP_ALIAS',
    reason: 'Role-based nav convenience. Protected, noindex.',
  },
  {
    duplicatePath: '/dispatch/calculator',
    canonicalPath: '/internal/calculator',
    category: 'alias',
    decision: 'KEEP_ALIAS',
    reason: 'Role-based nav convenience. Protected, noindex.',
  },
];

const DECISION_COLORS: Record<FinalDecision, string> = {
  'REMOVE_DUPLICATE': 'bg-red-100 text-red-800',
  'REDIRECT_TO_CANONICAL': 'bg-blue-100 text-blue-800',
  'KEEP_BOTH_WITH_UNIQUE_CANONICAL': 'bg-green-100 text-green-800',
  'KEEP_ALIAS': 'bg-muted text-muted-foreground',
};

const DECISION_LABELS: Record<FinalDecision, string> = {
  'REMOVE_DUPLICATE': 'Removed',
  'REDIRECT_TO_CANONICAL': 'Redirected',
  'KEEP_BOTH_WITH_UNIQUE_CANONICAL': 'Keep Both (Unique Canonical)',
  'KEEP_ALIAS': 'Alias (OK)',
};

export default function DuplicatePagesPage() {
  const counts = {
    total: DUPLICATES.length,
    removed: DUPLICATES.filter(d => d.decision === 'REMOVE_DUPLICATE').length,
    redirected: DUPLICATES.filter(d => d.decision === 'REDIRECT_TO_CANONICAL').length,
    keepBoth: DUPLICATES.filter(d => d.decision === 'KEEP_BOTH_WITH_UNIQUE_CANONICAL').length,
    alias: DUPLICATES.filter(d => d.decision === 'KEEP_ALIAS').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Duplicate Pages — Final Decisions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {counts.total} duplicate/alias routes audited. All resolved.
        </p>
      </div>

      <QaNavStrip />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{counts.total}</div>
          <div className="text-xs text-muted-foreground">Total Audited</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{counts.removed}</div>
          <div className="text-xs text-muted-foreground">Removed</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{counts.redirected}</div>
          <div className="text-xs text-muted-foreground">Redirected</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{counts.keepBoth}</div>
          <div className="text-xs text-muted-foreground">Keep Both</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-muted-foreground">{counts.alias}</div>
          <div className="text-xs text-muted-foreground">Aliases</div>
        </CardContent></Card>
      </div>

      {/* Decision Table */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Decision Table</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DUPLICATES.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{d.duplicatePath}</code>
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{d.canonicalPath}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{d.reason}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{d.category}</Badge>
                </div>
                <Badge className={`${DECISION_COLORS[d.decision]} text-xs flex-shrink-0 whitespace-nowrap`}>
                  {DECISION_LABELS[d.decision]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
