/**
 * Extras Health Dashboard — Audit extras catalog and workflow configuration
 * Validates driver-selectable flags, dispatch review requirements, pricing consistency.
 */
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ListChecks, CheckCircle, AlertTriangle, Loader2, Eye, Truck, Shield } from 'lucide-react';

interface ExtraAudit {
  code: string;
  label: string;
  category: string;
  amount: number;
  pricing_mode: string;
  driver_selectable: boolean;
  requires_dispatch_review: boolean;
  requires_customer_notice: boolean;
  requires_photo: boolean;
  customer_visible: boolean;
  taxable: boolean;
  is_active: boolean;
  issues: string[];
}

const EXPECTED_EXTRAS = [
  'DRY_RUN', 'DRIVER_WAIT_TIME', 'CONTAMINATION_SURCHARGE', 'REROUTE_SURCHARGE',
  'OVERFILL_FEE', 'BLOCKED_ACCESS', 'SAME_DAY_FEE', 'AFTER_HOURS_FEE',
];

export default function ExtrasHealthDashboard() {
  const [audits, setAudits] = useState<ExtraAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAudit();
  }, []);

  async function runAudit() {
    setLoading(true);
    const { data } = await supabase
      .from('extra_items')
      .select('*')
      .order('display_order');

    const extras = (data as any[]) || [];
    const results: ExtraAudit[] = extras.map(e => {
      const issues: string[] = [];
      const amount = Number(e.default_amount);

      // Validation checks
      if (amount === 0 && e.pricing_mode === 'fixed') {
        issues.push('Fixed pricing mode but $0 amount');
      }
      if (e.driver_selectable && !e.requires_dispatch_review) {
        issues.push('Driver-selectable but no dispatch review required');
      }
      if (e.category === 'surcharge' && !e.customer_visible) {
        issues.push('Surcharge not customer-visible');
      }
      if ((e.code === 'CONTAMINATION_SURCHARGE' || e.code === 'REROUTE_SURCHARGE') && amount !== 150) {
        issues.push(`Expected $150, got $${amount}`);
      }
      if (e.code === 'DRY_RUN' && amount !== 250) {
        issues.push(`Expected $250, got $${amount}`);
      }
      if (!e.is_active) {
        issues.push('Item is inactive');
      }

      return {
        code: e.code,
        label: e.label,
        category: e.category,
        amount,
        pricing_mode: e.pricing_mode,
        driver_selectable: e.driver_selectable,
        requires_dispatch_review: e.requires_dispatch_review,
        requires_customer_notice: e.requires_customer_notice,
        requires_photo: e.requires_photo,
        customer_visible: e.customer_visible,
        taxable: e.taxable,
        is_active: e.is_active,
        issues,
      };
    });

    // Check for missing expected extras
    for (const expected of EXPECTED_EXTRAS) {
      if (!extras.find((e: any) => e.code === expected)) {
        results.push({
          code: expected,
          label: expected.replace(/_/g, ' '),
          category: 'missing',
          amount: 0,
          pricing_mode: 'unknown',
          driver_selectable: false,
          requires_dispatch_review: false,
          requires_customer_notice: false,
          requires_photo: false,
          customer_visible: false,
          taxable: false,
          is_active: false,
          issues: ['Expected extra item not found in catalog'],
        });
      }
    }

    setAudits(results);
    setLoading(false);
  }

  const totalIssues = audits.reduce((s, a) => s + a.issues.length, 0);
  const active = audits.filter(a => a.is_active).length;
  const driverItems = audits.filter(a => a.driver_selectable && a.is_active).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-primary" /> Extras & Exceptions Health
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Validates extras catalog completeness, workflow flags, and pricing consistency.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-foreground">{audits.length}</div>
          <div className="text-xs text-muted-foreground">Total Items</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-green-600">{active}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-blue-600">{driverItems}</div>
          <div className="text-xs text-muted-foreground">Driver-Selectable</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-amber-600">{totalIssues}</div>
          <div className="text-xs text-muted-foreground">Issues</div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-card rounded-xl border border-border overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Code</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Label</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">
                <Truck className="w-3 h-3 inline" title="Driver" />
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">
                <Shield className="w-3 h-3 inline" title="Dispatch Review" />
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">
                <Eye className="w-3 h-3 inline" title="Customer Visible" />
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Issues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {audits.map(a => (
              <tr key={a.code} className="hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{a.code}</td>
                <td className="px-3 py-2 text-sm font-medium text-foreground">{a.label}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                </td>
                <td className="px-3 py-2 text-right text-sm font-mono">${a.amount}</td>
                <td className="px-3 py-2 text-center">
                  {a.driver_selectable ? <CheckCircle className="w-3.5 h-3.5 text-green-600 inline" /> : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-3 py-2 text-center">
                  {a.requires_dispatch_review ? <CheckCircle className="w-3.5 h-3.5 text-blue-600 inline" /> : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-3 py-2 text-center">
                  {a.customer_visible ? <CheckCircle className="w-3.5 h-3.5 text-green-600 inline" /> : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-3 py-2 text-center">
                  {a.is_active ? (
                    <Badge className="text-[10px] bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                  )}
                </td>
                <td className="px-3 py-2">
                  {a.issues.length > 0 ? (
                    <ul className="space-y-0.5">
                      {a.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-amber-600 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-green-600">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Workflow Reference */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground text-sm mb-2">Extras Workflow</p>
        <p><strong>Driver Reports:</strong> Driver selects extras from the field → Dispatch reviews → Billing approves → Invoice generated.</p>
        <p><strong>Dispatch Adds:</strong> Dispatch adds extras based on operational needs → Customer notified if required → Billing invoices.</p>
        <p><strong>Visibility:</strong> Customer-visible extras appear in order detail, timeline, and Customer 360.</p>
      </div>
    </div>
  );
}
