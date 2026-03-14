/**
 * Material Rules Dashboard — Admin QA tool
 * Shows all material classifications, pricing modes, allowed sizes, and heavy-material policies
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, Scale, ShieldAlert } from 'lucide-react';
import {
  GENERAL_DEBRIS_SIZES,
  HEAVY_MATERIAL,
  HEAVY_ALLOWED_SIZES,
  POLICIES,
  formatPrice,
} from '@/config/pricingConfig';

interface MaterialRule {
  material_class: string;
  display_label: string;
  is_heavy: boolean;
  allowed_sizes: number[];
  pricing_mode: string;
  included_tons_json: Record<string, number>;
  flat_rate_json: Record<string, number>;
  overweight_fee_per_ton: number;
  requires_clean_load: boolean;
  green_halo_eligible: boolean;
  contamination_policy: string | null;
  reroute_policy: string | null;
  public_warning: string | null;
}

export default function MaterialRulesDashboard() {
  const [rules, setRules] = useState<MaterialRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('material_rules')
        .select('*')
        .eq('is_active', true)
        .order('material_class');
      setRules((data || []).map((r: any) => ({
        ...r,
        included_tons_json: (r.included_tons_json as Record<string, number>) || {},
        flat_rate_json: (r.flat_rate_json as Record<string, number>) || {},
        overweight_fee_per_ton: Number(r.overweight_fee_per_ton),
      })));
      setLoading(false);
    }
    load();
  }, []);

  // Verify DB vs pricingConfig consistency
  const checks: { label: string; ok: boolean; detail: string }[] = [];

  // Check general debris sizes match
  const generalRule = rules.find(r => r.material_class === 'GENERAL_DEBRIS');
  if (generalRule) {
    const configSizes = GENERAL_DEBRIS_SIZES.map(s => s.size);
    const dbSizes = generalRule.allowed_sizes;
    const sizesMatch = JSON.stringify(configSizes.sort()) === JSON.stringify([...dbSizes].sort());
    checks.push({
      label: 'General Debris sizes',
      ok: sizesMatch,
      detail: sizesMatch ? `Both: [${configSizes.join(', ')}]` : `Config: [${configSizes.join(', ')}] vs DB: [${dbSizes.join(', ')}]`,
    });

    // Check included tons
    for (const size of GENERAL_DEBRIS_SIZES) {
      const dbTons = generalRule.included_tons_json[String(size.size)];
      if (dbTons !== size.includedTons) {
        checks.push({
          label: `${size.size}yd included tons`,
          ok: false,
          detail: `Config: ${size.includedTons}T vs DB: ${dbTons ?? 'missing'}T`,
        });
      }
    }
  }

  // Check heavy material flat rates
  const soilRule = rules.find(r => r.material_class === 'CLEAN_SOIL');
  if (soilRule) {
    for (const size of HEAVY_ALLOWED_SIZES) {
      const dbRate = soilRule.flat_rate_json[String(size)];
      const configRate = HEAVY_MATERIAL.cleanSoil.prices[size];
      if (dbRate !== configRate) {
        checks.push({
          label: `Clean Soil ${size}yd flat rate`,
          ok: false,
          detail: `Config: ${formatPrice(configRate)} vs DB: ${dbRate ? formatPrice(dbRate) : 'missing'}`,
        });
      }
    }
  }

  // Check overage fee consistency
  for (const rule of rules) {
    if (rule.overweight_fee_per_ton !== POLICIES.overweightCostPerTon) {
      checks.push({
        label: `${rule.display_label} overage fee`,
        ok: false,
        detail: `DB: $${rule.overweight_fee_per_ton}/ton vs Config: $${POLICIES.overweightCostPerTon}/ton`,
      });
    }
  }

  if (checks.length === 0 && rules.length > 0) {
    checks.push({ label: 'All material rules', ok: true, detail: 'DB and pricingConfig.ts are in sync' });
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading material rules...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Material Rules Dashboard</h1>
        <p className="text-muted-foreground">Material classifications, pricing modes, and heavy-material policy audit</p>
      </div>

      {/* Sync Checks */}
      {checks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">DB vs pricingConfig Sync</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checks.map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  {c.ok ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  <span className="font-medium text-sm text-foreground">{c.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{c.detail}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Material Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" /> Material Rules (material_rules table)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material Class</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Heavy</TableHead>
                <TableHead>Pricing Mode</TableHead>
                <TableHead>Allowed Sizes</TableHead>
                <TableHead>Included Tons / Flat Rates</TableHead>
                <TableHead className="text-right">Overage</TableHead>
                <TableHead>Clean Load</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map(rule => (
                <TableRow key={rule.material_class}>
                  <TableCell className="font-mono text-sm">{rule.material_class}</TableCell>
                  <TableCell className="font-medium">{rule.display_label}</TableCell>
                  <TableCell>
                    <Badge variant={rule.is_heavy ? 'default' : 'secondary'}>
                      {rule.is_heavy ? 'Heavy' : 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      rule.pricing_mode === 'flat_rate' ? 'default' :
                      rule.pricing_mode === 'manual_review' ? 'destructive' : 'outline'
                    }>
                      {rule.pricing_mode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">[{rule.allowed_sizes.join(', ')}]</TableCell>
                  <TableCell className="text-xs">
                    {rule.pricing_mode === 'flat_rate' ? (
                      <div>{Object.entries(rule.flat_rate_json).map(([k, v]) => (
                        <span key={k} className="mr-2">{k}yd: {formatPrice(v)}</span>
                      ))}</div>
                    ) : rule.pricing_mode === 'included_tons' ? (
                      <div>{Object.entries(rule.included_tons_json).map(([k, v]) => (
                        <span key={k} className="mr-2">{k}yd: {v}T</span>
                      ))}</div>
                    ) : <span className="text-muted-foreground">Manual review</span>}
                  </TableCell>
                  <TableCell className="text-right font-mono">${rule.overweight_fee_per_ton}/ton</TableCell>
                  <TableCell>
                    {rule.requires_clean_load ? (
                      <Badge variant="default">Required</Badge>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Heavy Material Policy Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" /> Heavy Material Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-sm text-foreground mb-2">Canonical Public Prices</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground"><th className="text-left py-1">Size</th><th className="text-right py-1">General</th><th className="text-right py-1">Heavy</th><th className="text-right py-1">Tons</th></tr></thead>
                <tbody>
                  {GENERAL_DEBRIS_SIZES.map(s => (
                    <tr key={s.size} className="border-t border-border/50">
                      <td className="py-1 font-medium">{s.size} yd</td>
                      <td className="py-1 text-right font-mono">{formatPrice(s.price)}</td>
                      <td className="py-1 text-right font-mono">
                        {(HEAVY_ALLOWED_SIZES as readonly number[]).includes(s.size)
                          ? formatPrice(HEAVY_MATERIAL.cleanSoil.prices[s.size] || 0)
                          : '—'}
                      </td>
                      <td className="py-1 text-right">{s.includedTons}T</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 rounded-lg border border-border space-y-3">
              <h3 className="font-semibold text-sm text-foreground mb-2">Policy Rules</h3>
              <div className="text-xs space-y-2 text-muted-foreground">
                <p>{POLICIES.heavyMaterialRule}</p>
                <p>{POLICIES.contaminationRule}</p>
                <p>{POLICIES.misdeclaredRule}</p>
                <p>{POLICIES.generalDebrisOverageRule}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
