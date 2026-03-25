import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';

const CRM_RULES = [
  { label: 'Multi-line quotes', value: 'Supported', done: true },
  { label: 'Multiple dumpsters per quote', value: 'Supported', done: true },
  { label: 'General + Heavy combined', value: 'Supported', done: true },
  { label: 'Extras per line or quote', value: 'Per quote', done: true },
  { label: 'Different rental days per line', value: 'Supported', done: true },
  { label: 'Swaps', value: 'Extra line item', done: true },
  { label: 'Negotiated pricing', value: 'range_min → range_max', done: true },
  { label: 'Customer-required dump site', value: 'Flag + adjustment', done: true },
  { label: 'Manager approval threshold', value: 'Below range_min or above range_max', done: true },
  { label: 'Override floors', value: 'Enforced — requires reason', done: true },
  { label: 'Option A/B/C proposals', value: 'Quote options model', done: true },
  { label: 'Addendum triggers', value: 'Material change, site change', done: true },
  { label: 'Placement review triggers', value: 'Special placement flag', done: false },
];

export default function CrmCalculatorRulesPanel() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          CRM Calculator Rules
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Internal calculator configuration — controls Sales behavior at /sales/quotes/new.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Calculator Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CRM_RULES.map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {rule.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="text-sm">{rule.label}</span>
                </div>
                <Badge variant={rule.done ? 'outline' : 'secondary'} className="text-xs shrink-0">
                  {rule.value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
