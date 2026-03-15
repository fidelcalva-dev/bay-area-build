/**
 * Contractor Rules Health — Audit contractor pricing tiers
 * Validates discount %, margin protection, non-discountable items, and tier coverage.
 */
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, CheckCircle, AlertTriangle, XCircle, Loader2, ShieldAlert } from 'lucide-react';

const EXPECTED_TIERS = [
  { tier: 'RETAIL', discount: 0, label: 'Retail' },
  { tier: 'CONTRACTOR_TIER_1', discount: 5, label: 'Contractor T1' },
  { tier: 'CONTRACTOR_TIER_2', discount: 8, label: 'Contractor T2' },
  { tier: 'COMMERCIAL_ACCOUNT', discount: 10, label: 'Commercial' },
  { tier: 'MANUAL_RATE_CARD', discount: null, label: 'Manual' },
];

const NON_DISCOUNTABLE_ITEMS = [
  'Contamination Surcharge',
  'Reroute Surcharge',
  'Green Halo',
  'Permits',
  'Overweight / Overfill',
  'Special Disposal',
  'After-Hours Fee',
];

interface TierAudit {
  tier_name: string;
  label: string;
  expected_discount: number | null;
  rules_count: number;
  general_rule: any | null;
  issues: string[];
}

export default function ContractorRulesHealth() {
  const [audits, setAudits] = useState<TierAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAudit();
  }, []);

  async function runAudit() {
    setLoading(true);
    const { data: rules } = await supabase
      .from('contractor_pricing_rules')
      .select('*')
      .eq('is_active', true);

    const allRules = rules || [];

    const results: TierAudit[] = EXPECTED_TIERS.map(expected => {
      const tierRules = allRules.filter(r => r.tier_name === expected.tier);
      const generalRule = tierRules.find(r => !r.size_yd && !r.material_class) || null;
      const issues: string[] = [];

      if (expected.tier === 'RETAIL') {
        // Retail should have no rules or 0% discount
        if (tierRules.length > 0 && generalRule) {
          const disc = Number(generalRule.discount_percent);
          if (disc !== 0) issues.push(`Retail has ${disc}% discount, expected 0%`);
        }
      } else if (expected.tier !== 'MANUAL_RATE_CARD') {
        if (tierRules.length === 0) {
          issues.push('No rules configured');
        } else if (generalRule) {
          const disc = Number(generalRule.discount_percent);
          if (expected.discount !== null && disc !== expected.discount) {
            issues.push(`Discount is ${disc}%, expected ${expected.discount}%`);
          }
          const minMargin = Number(generalRule.minimum_margin_pct);
          if (minMargin < 10) issues.push(`Minimum margin ${minMargin}% is dangerously low`);
          if (minMargin > 25) issues.push(`Minimum margin ${minMargin}% seems high`);
        } else {
          issues.push('No general (catch-all) rule — only size/material-specific rules exist');
        }
      }

      return {
        tier_name: expected.tier,
        label: expected.label,
        expected_discount: expected.discount,
        rules_count: tierRules.length,
        general_rule: generalRule,
        issues,
      };
    });

    setAudits(results);
    setLoading(false);
  }

  const totalIssues = audits.reduce((s, a) => s + a.issues.length, 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Contractor Pricing Health
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Validates contractor tier discounts, margin protection, and rule coverage.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-foreground">{EXPECTED_TIERS.length}</div>
          <div className="text-xs text-muted-foreground">Expected Tiers</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-green-600">{audits.filter(a => a.issues.length === 0).length}</div>
          <div className="text-xs text-muted-foreground">Healthy</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-amber-600">{totalIssues}</div>
          <div className="text-xs text-muted-foreground">Issues</div>
        </div>
      </div>

      {/* Tier Details */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tier</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Expected %</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actual %</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Rules</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Min Margin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Zone Behavior</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Issues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {audits.map(a => (
              <tr key={a.tier_name} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{a.label}</span>
                  <span className="text-xs text-muted-foreground ml-2 font-mono">{a.tier_name}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {a.issues.length === 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 inline" />
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm font-mono">
                  {a.expected_discount !== null ? `${a.expected_discount}%` : 'Manual'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-mono">
                  {a.general_rule ? `${Number(a.general_rule.discount_percent)}%` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-sm">{a.rules_count}</td>
                <td className="px-4 py-3 text-right text-sm font-mono">
                  {a.general_rule ? `${Number(a.general_rule.minimum_margin_pct)}%` : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {a.general_rule?.zone_surcharge_behavior || '—'}
                </td>
                <td className="px-4 py-3">
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

      {/* Non-discountable reference */}
      <div className="p-4 rounded-xl border border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          <p className="font-semibold text-foreground text-sm">Non-Discountable Items</p>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          These items must NEVER receive contractor discounts regardless of tier:
        </p>
        <div className="flex flex-wrap gap-2">
          {NON_DISCOUNTABLE_ITEMS.map(item => (
            <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
