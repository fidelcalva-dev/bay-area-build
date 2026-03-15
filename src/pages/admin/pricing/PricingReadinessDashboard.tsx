/**
 * Pricing Readiness Dashboard — System-wide integrity summary
 * Shows health scores for ZIP, yard, pricing, extras, city display, and simulator.
 */
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertTriangle, XCircle, MapPin, Warehouse,
  DollarSign, ListChecks, Map, Activity
} from 'lucide-react';

interface CheckResult {
  label: string;
  passed: number;
  total: number;
  issues: string[];
  severity: 'ok' | 'warning' | 'critical';
  fixPath?: string;
}

function scoreColor(pct: number) {
  if (pct >= 95) return 'text-green-600';
  if (pct >= 80) return 'text-amber-600';
  return 'text-destructive';
}

function SeverityIcon({ s }: { s: 'ok' | 'warning' | 'critical' }) {
  if (s === 'ok') return <CheckCircle className="h-5 w-5 text-green-600" />;
  if (s === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-destructive" />;
}

export default function PricingReadinessDashboard() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function audit() {
      const results: CheckResult[] = [];

      // 1. ZIP Integrity
      const { data: zips } = await supabase.from('zone_zip_codes').select('zip_code, market_id, city_name');
      const allZips = zips || [];
      const noMarket = allZips.filter(z => !z.market_id);
      const noCity = allZips.filter(z => !z.city_name);
      const zipIssues: string[] = [];
      if (noMarket.length) zipIssues.push(`${noMarket.length} ZIPs missing market_id`);
      if (noCity.length) zipIssues.push(`${noCity.length} ZIPs missing city name`);
      results.push({
        label: 'ZIP Integrity',
        passed: allZips.length - noMarket.length,
        total: allZips.length,
        issues: zipIssues,
        severity: noMarket.length > 0 ? 'critical' : noCity.length > 0 ? 'warning' : 'ok',
        fixPath: '/admin/pricing/zip-health',
      });

      // 2. Yard Integrity
      const { data: yards } = await supabase.from('yards').select('*').eq('is_active', true);
      const allYards = yards || [];
      const yardIssues: string[] = [];
      const badYards = allYards.filter(y => !y.latitude || !y.longitude || !y.address);
      if (badYards.length) yardIssues.push(`${badYards.length} yards missing address/coords`);
      results.push({
        label: 'Yard Integrity',
        passed: allYards.length - badYards.length,
        total: allYards.length,
        issues: yardIssues,
        severity: badYards.length > 0 ? 'critical' : 'ok',
        fixPath: '/admin/pricing/yard-health',
      });

      // 3. Size Standards
      const { data: sizes } = await supabase.from('dumpster_sizes').select('size_value, is_active');
      const activeSizes = (sizes || []).filter(s => s.is_active);
      const validSizes = [5, 8, 10, 20, 30, 40, 50];
      const invalidSizes = activeSizes.filter(s => !validSizes.includes(s.size_value));
      const sizeIssues: string[] = [];
      if (invalidSizes.length) sizeIssues.push(`Invalid sizes: ${invalidSizes.map(s => s.size_value).join(', ')}`);
      results.push({
        label: 'Size Standards',
        passed: activeSizes.length - invalidSizes.length,
        total: activeSizes.length,
        issues: sizeIssues,
        severity: invalidSizes.length > 0 ? 'critical' : 'ok',
      });

      // 4. City Display Pricing
      const { data: cdp } = await supabase.from('city_display_pricing').select('city_slug, primary_zip, is_active');
      const activeCities = (cdp || []).filter(c => c.is_active);
      const noPrimary = activeCities.filter(c => !c.primary_zip);
      const cityIssues: string[] = [];
      if (noPrimary.length) cityIssues.push(`${noPrimary.length} active cities missing primary ZIP`);
      results.push({
        label: 'City Display Pricing',
        passed: activeCities.length - noPrimary.length,
        total: activeCities.length,
        issues: cityIssues,
        severity: noPrimary.length > 0 ? 'warning' : 'ok',
        fixPath: '/admin/pricing/city-display-zips',
      });

      // 5. Disposal Sites
      const { data: sites } = await supabase.from('disposal_sites').select('id, name, is_active');
      const activeSites = (sites || []).filter(s => s.is_active);
      const siteIssues: string[] = [];
      if (activeSites.length === 0) siteIssues.push('No active disposal sites configured');
      results.push({
        label: 'Disposal Sites',
        passed: activeSites.length,
        total: Math.max(activeSites.length, 1),
        issues: siteIssues,
        severity: activeSites.length === 0 ? 'warning' : 'ok',
        fixPath: '/admin/pricing/facility-costs',
      });

      // 6. Material Rules
      const { data: matRules } = await supabase.from('material_rules').select('material_class, is_active');
      const activeRules = (matRules || []).filter(r => r.is_active);
      const expectedClasses = ['GENERAL_DEBRIS', 'CLEAN_SOIL', 'CLEAN_CONCRETE'];
      const missingClasses = expectedClasses.filter(c => !activeRules.find(r => r.material_class === c));
      const matIssues: string[] = [];
      if (missingClasses.length) matIssues.push(`Missing material rules: ${missingClasses.join(', ')}`);
      results.push({
        label: 'Material Rules',
        passed: expectedClasses.length - missingClasses.length,
        total: expectedClasses.length,
        issues: matIssues,
        severity: missingClasses.length > 0 ? 'warning' : 'ok',
        fixPath: '/admin/pricing/material-rules',
      });

      // 7. Dumpster Pricing Table
      const { data: dp } = await supabase.from('dumpster_pricing').select('size_yd, market_code, is_active').eq('is_active', true);
      const dpRows = dp || [];
      const dpIssues: string[] = [];
      if (dpRows.length < 7) dpIssues.push(`Only ${dpRows.length} active pricing rows (expected ≥7 per market)`);
      results.push({
        label: 'Pricing Table',
        passed: Math.min(dpRows.length, 14),
        total: 14,
        issues: dpIssues,
        severity: dpRows.length < 7 ? 'warning' : 'ok',
      });

      setChecks(results);
      setLoading(false);
    }
    audit();
  }, []);

  const overallScore = useMemo(() => {
    if (!checks.length) return 0;
    const totalPassed = checks.reduce((s, c) => s + c.passed, 0);
    const totalItems = checks.reduce((s, c) => s + c.total, 0);
    return totalItems > 0 ? Math.round((totalPassed / totalItems) * 100) : 0;
  }, [checks]);

  if (loading) return <div className="p-6 text-muted-foreground">Running integrity audit...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pricing Readiness</h1>
        <p className="text-muted-foreground">System-wide pricing integrity and data quality audit</p>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="text-center min-w-[100px]">
            <div className={`text-4xl font-bold ${scoreColor(overallScore)}`}>{overallScore}%</div>
            <div className="text-xs text-muted-foreground mt-1">Overall</div>
          </div>
          <div className="flex-1">
            <Progress value={overallScore} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{checks.filter(c => c.severity === 'ok').length} passing</span>
              <span>{checks.filter(c => c.severity === 'warning').length} warnings</span>
              <span>{checks.filter(c => c.severity === 'critical').length} critical</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {checks.map((c, i) => {
          const pct = c.total > 0 ? Math.round((c.passed / c.total) * 100) : 0;
          return (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <SeverityIcon s={c.severity} />
                    {c.label}
                  </CardTitle>
                  <Badge variant={c.severity === 'ok' ? 'default' : c.severity === 'warning' ? 'secondary' : 'destructive'}>
                    {pct}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {c.passed} / {c.total} passing
                </div>
                {c.issues.length > 0 && (
                  <ul className="text-sm space-y-1 mb-3">
                    {c.issues.map((issue, j) => (
                      <li key={j} className="text-amber-700 flex items-start gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
                {c.fixPath && (
                  <Button size="sm" variant="outline" onClick={() => navigate(c.fixPath!)}>
                    View Details →
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
