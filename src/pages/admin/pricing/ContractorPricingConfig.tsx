import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Save, Loader2, RefreshCw, Building2, Shield } from 'lucide-react';

const TIER_LABELS: Record<string, string> = {
  RETAIL: 'Retail (Default)',
  CONTRACTOR_TIER_1: 'Contractor Tier 1',
  CONTRACTOR_TIER_2: 'Contractor Tier 2',
  COMMERCIAL_ACCOUNT: 'Commercial Account',
  MANUAL_RATE_CARD: 'Manual Rate Card',
};

interface PricingRule {
  id: string;
  tier_name: string;
  size_yd: number | null;
  material_class: string | null;
  discount_percent: number;
  base_override: number | null;
  included_tons_override: number | null;
  zone_surcharge_behavior: string;
  rush_fee_behavior: string;
  minimum_margin_pct: number;
  is_active: boolean;
}

interface ContractorAccount {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  pricing_tier: string;
  monthly_volume_estimate: number | null;
  is_approved: boolean;
  is_active: boolean;
}

export default function ContractorPricingConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [accounts, setAccounts] = useState<ContractorAccount[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [rulesRes, accountsRes] = await Promise.all([
      supabase.from('contractor_pricing_rules').select('*').order('tier_name, size_yd'),
      supabase.from('contractor_accounts').select('*').order('company_name'),
    ]);
    setRules((rulesRes.data || []).map(r => ({
      ...r,
      discount_percent: Number(r.discount_percent),
      base_override: r.base_override ? Number(r.base_override) : null,
      included_tons_override: r.included_tons_override ? Number(r.included_tons_override) : null,
      minimum_margin_pct: Number(r.minimum_margin_pct),
    })));
    setAccounts(accountsRes.data || []);
    setLoading(false);
  }

  function updateRule(id: string, field: string, value: any) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  async function saveRule(rule: PricingRule) {
    setSaving(rule.id);
    const { error } = await supabase
      .from('contractor_pricing_rules')
      .update({
        discount_percent: rule.discount_percent,
        base_override: rule.base_override,
        included_tons_override: rule.included_tons_override,
        zone_surcharge_behavior: rule.zone_surcharge_behavior,
        rush_fee_behavior: rule.rush_fee_behavior,
        minimum_margin_pct: rule.minimum_margin_pct,
        is_active: rule.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rule.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `${TIER_LABELS[rule.tier_name] || rule.tier_name} updated.` });
    }
    setSaving(null);
  }

  async function updateAccountTier(accountId: string, tier: string) {
    const { error } = await supabase
      .from('contractor_accounts')
      .update({ pricing_tier: tier as any, updated_at: new Date().toISOString() })
      .eq('id', accountId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated' });
      loadData();
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contractor Pricing</h1>
          <p className="text-sm text-muted-foreground mt-1">Tier-based discounts, margin controls, and active accounts</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules"><Shield className="w-3 h-3 mr-1" /> Pricing Rules</TabsTrigger>
          <TabsTrigger value="accounts"><Building2 className="w-3 h-3 mr-1" /> Accounts ({accounts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-3 mt-4">
          {rules.map(rule => (
            <Card key={rule.id} className={!rule.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">{TIER_LABELS[rule.tier_name] || rule.tier_name}</span>
                    {rule.size_yd && <Badge variant="outline" className="text-[10px]">{rule.size_yd}yd</Badge>}
                    {rule.material_class && <Badge variant="outline" className="text-[10px]">{rule.material_class}</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.is_active} onCheckedChange={(v) => updateRule(rule.id, 'is_active', v)} />
                    <Button size="sm" onClick={() => saveRule(rule)} disabled={saving === rule.id}>
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Discount %</label>
                    <Input type="number" value={rule.discount_percent} onChange={(e) => updateRule(rule.id, 'discount_percent', Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Min Margin %</label>
                    <Input type="number" value={rule.minimum_margin_pct} onChange={(e) => updateRule(rule.id, 'minimum_margin_pct', Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Base Override</label>
                    <Input type="number" value={rule.base_override ?? ''} placeholder="—" onChange={(e) => updateRule(rule.id, 'base_override', e.target.value ? Number(e.target.value) : null)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Zone Surcharge</label>
                    <Select value={rule.zone_surcharge_behavior} onValueChange={(v) => updateRule(rule.id, 'zone_surcharge_behavior', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apply">Apply</SelectItem>
                        <SelectItem value="half">Half</SelectItem>
                        <SelectItem value="waive">Waive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Rush Fee</label>
                    <Select value={rule.rush_fee_behavior} onValueChange={(v) => updateRule(rule.id, 'rush_fee_behavior', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apply">Apply</SelectItem>
                        <SelectItem value="half">Half</SelectItem>
                        <SelectItem value="waive">Waive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-3 mt-4">
          {accounts.map(acct => (
            <Card key={acct.id} className={!acct.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{acct.company_name}</p>
                    <p className="text-xs text-muted-foreground">{acct.contact_name} • {acct.contact_email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase block">Tier</label>
                      <Select value={acct.pricing_tier} onValueChange={(v) => updateAccountTier(acct.id, v)}>
                        <SelectTrigger className="h-8 text-sm w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(TIER_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Badge variant={acct.is_approved ? 'default' : 'secondary'}>
                      {acct.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {accounts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No contractor accounts yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
