/**
 * Rush Health Dashboard — Audit rush delivery configuration across yards
 * Validates cutoffs, capacity, fee consistency, and active yard coverage.
 */
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Zap, CheckCircle, AlertTriangle, XCircle, Loader2, Warehouse } from 'lucide-react';

interface RushAudit {
  yard_id: string;
  yard_name: string;
  yard_active: boolean;
  has_rush_config: boolean;
  config_active: boolean;
  allow_same_day: boolean;
  same_day_cutoff: number;
  next_day_cutoff: number;
  daily_capacity: number;
  fee_same_day_sm: number;
  fee_same_day_lg: number;
  fee_next_day: number;
  fee_priority_next_day: number;
  fee_after_hours: number;
  issues: string[];
}

export default function RushHealthDashboard() {
  const [audits, setAudits] = useState<RushAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAudit();
  }, []);

  async function runAudit() {
    setLoading(true);
    const [yardsRes, rushRes] = await Promise.all([
      supabase.from('yards').select('id, name, is_active').order('name'),
      supabase.from('rush_delivery_config').select('*'),
    ]);

    const yards = yardsRes.data || [];
    const rushConfigs = rushRes.data || [];

    const results: RushAudit[] = yards.map(yard => {
      const config = rushConfigs.find(r => r.yard_id === yard.id);
      const issues: string[] = [];

      if (!config) {
        issues.push('No rush config found');
        return {
          yard_id: yard.id,
          yard_name: yard.name,
          yard_active: yard.is_active,
          has_rush_config: false,
          config_active: false,
          allow_same_day: false,
          same_day_cutoff: 0,
          next_day_cutoff: 0,
          daily_capacity: 0,
          fee_same_day_sm: 0,
          fee_same_day_lg: 0,
          fee_next_day: 0,
          fee_priority_next_day: 0,
          fee_after_hours: 0,
          issues,
        };
      }

      const feeSm = Number((config as any).rush_fee_same_day_small_medium ?? config.rush_fee_same_day ?? 0);
      const feeLg = Number((config as any).rush_fee_same_day_large ?? config.rush_fee_same_day ?? 0);
      const feeNextDay = Number(config.rush_fee_next_day ?? 0);
      const feePriorityND = Number((config as any).rush_fee_priority_next_day ?? 0);
      const feeAfterHrs = Number(config.rush_fee_after_hours ?? 0);

      // Validate expected fees
      if (yard.is_active && !config.is_active) issues.push('Yard active but rush config inactive');
      if (feeSm !== 95) issues.push(`Same-day SM fee is $${feeSm}, expected $95`);
      if (feeLg !== 145) issues.push(`Same-day LG fee is $${feeLg}, expected $145`);
      if (feePriorityND !== 45) issues.push(`Priority next-day fee is $${feePriorityND}, expected $45`);
      if (feeAfterHrs !== 195) issues.push(`After-hours fee is $${feeAfterHrs}, expected $195`);
      if (config.daily_capacity < 1) issues.push('Daily capacity is 0');
      if (config.same_day_cutoff_hour < 6 || config.same_day_cutoff_hour > 14) issues.push(`Unusual cutoff: ${config.same_day_cutoff_hour}h`);

      return {
        yard_id: yard.id,
        yard_name: yard.name,
        yard_active: yard.is_active,
        has_rush_config: true,
        config_active: config.is_active,
        allow_same_day: config.allow_same_day,
        same_day_cutoff: config.same_day_cutoff_hour,
        next_day_cutoff: config.next_day_cutoff_hour,
        daily_capacity: config.daily_capacity,
        fee_same_day_sm: feeSm,
        fee_same_day_lg: feeLg,
        fee_next_day: feeNextDay,
        fee_priority_next_day: feePriorityND,
        fee_after_hours: feeAfterHrs,
        issues,
      };
    });

    setAudits(results);
    setLoading(false);
  }

  const totalIssues = audits.reduce((s, a) => s + a.issues.length, 0);
  const healthy = audits.filter(a => a.issues.length === 0 && a.has_rush_config).length;

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
          <Zap className="w-6 h-6 text-primary" /> Rush Delivery Health
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Validates rush delivery configuration consistency across all yards.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-foreground">{audits.length}</div>
          <div className="text-xs text-muted-foreground">Yards Audited</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-green-600">{healthy}</div>
          <div className="text-xs text-muted-foreground">Healthy</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card text-center">
          <div className="text-3xl font-bold text-amber-600">{totalIssues}</div>
          <div className="text-xs text-muted-foreground">Issues Found</div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Yard</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Same-Day</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">SM Fee</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">LG Fee</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Priority ND</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">After-Hrs</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Capacity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Issues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {audits.map(a => (
              <tr key={a.yard_id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{a.yard_name}</span>
                    {!a.yard_active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {!a.has_rush_config ? (
                    <XCircle className="w-4 h-4 text-destructive inline" />
                  ) : a.issues.length === 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 inline" />
                  )}
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {a.allow_same_day ? (
                    <Badge variant="default" className="text-[10px]">Enabled</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Off</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm font-mono">${a.fee_same_day_sm}</td>
                <td className="px-4 py-3 text-right text-sm font-mono">${a.fee_same_day_lg}</td>
                <td className="px-4 py-3 text-right text-sm font-mono">${a.fee_priority_next_day}</td>
                <td className="px-4 py-3 text-right text-sm font-mono">${a.fee_after_hours}</td>
                <td className="px-4 py-3 text-right text-sm">{a.daily_capacity}</td>
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

      {/* Expected values reference */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground text-sm mb-2">Expected Rush Fee Schedule</p>
        <p>Standard: $0 · Next Day: $0 · Priority Next Day: $45</p>
        <p>Same-Day Small/Medium (5–20yd): $95 · Same-Day Large (30–50yd): $145</p>
        <p>After Hours / Holiday: $195</p>
      </div>
    </div>
  );
}
