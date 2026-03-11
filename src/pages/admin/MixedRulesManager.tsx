import { useEffect, useState } from 'react';
import { Loader2, Save, AlertTriangle, DollarSign, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createAuditLog } from '@/lib/auditLog';

interface MixedRule {
  id: string;
  category: string;
  key: string;
  value: number | string;
  description: string | null;
}

interface IncludedTons {
  [size: string]: number;
}

export default function MixedRulesManager() {
  const [rules, setRules] = useState<MixedRule[]>([]);
  const [includedTons, setIncludedTons] = useState<IncludedTons>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Default values
  const [smallOverageRate, setSmallOverageRate] = useState(30);
  const [standardTonRate, setStandardTonRate] = useState(165);
  const [prepayDiscount, setPrepayDiscount] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from('config_settings')
      .select('*')
      .eq('category', 'pricing');

    if (data) {
      data.forEach((item) => {
        if (item.key === 'extra_ton_rate_default') {
          setStandardTonRate(Number(item.value) || 165);
        }
        if (item.key === 'prepay_discount_pct') {
          setPrepayDiscount(Number(item.value) || 5);
        }
      });
    }

    // Default included tons
    setIncludedTons({
      '5': 0.5,
      '8': 0.5,
      '10': 1,
      '20': 2,
      '30': 3,
      '40': 4,
      '50': 5,
    });

    setIsLoading(false);
  }

  async function handleSaveRates() {
    setIsSaving(true);

    try {
      // Update extra ton rate
      // Update using canonical key: pricing.extra_ton_rate_default
      const { error: rateError } = await supabase
        .from('config_settings')
        .update({ value: standardTonRate, updated_at: new Date().toISOString() })
        .eq('category', 'pricing')
        .eq('key', 'extra_ton_rate_default');

      // Update prepay discount
      const { error: discountError } = await supabase
        .from('config_settings')
        .update({ value: prepayDiscount })
        .eq('category', 'pricing')
        .eq('key', 'prepay_discount_pct');

      if (rateError || discountError) {
        toast({ title: 'Error saving', description: 'Failed to update rates', variant: 'destructive' });
      } else {
        await createAuditLog({
          action: 'config_edit',
          entityType: 'config_settings',
          changesSummary: `Updated mixed rules: ton rate=$${standardTonRate}, prepay=${prepayDiscount}%`,
        });
        toast({ title: 'Rates saved' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    }

    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const prepayRate = standardTonRate * (1 - prepayDiscount / 100);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mixed/General Pricing Rules</h1>
        <p className="text-muted-foreground mt-1">
          Configure overage rates and included tonnage for general debris
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Per-Ton Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Per-Ton Overage Rates
            </CardTitle>
            <CardDescription>
              For Mixed 20+ yard containers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Standard Rate ($/ton)</label>
              <Input
                type="number"
                value={standardTonRate}
                onChange={(e) => setStandardTonRate(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prepay Discount (%)</label>
              <Input
                type="number"
                value={prepayDiscount}
                onChange={(e) => setPrepayDiscount(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Prepay Rate:</p>
              <p className="text-lg font-bold">${prepayRate.toFixed(2)}/ton</p>
            </div>
          </CardContent>
        </Card>

        {/* Small Container Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Small Container Rules (5/8/10 yd)
            </CardTitle>
            <CardDescription>
              Per-yard overage for smaller containers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Overage Rate ($/additional yard)</label>
              <Input
                type="number"
                value={smallOverageRate}
                onChange={(e) => setSmallOverageRate(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Note:</p>
              <p className="text-sm">
                Small mixed containers (6/8/10 yd) charge ${smallOverageRate}/yard for overage
                instead of per-ton billing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Included Tons Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Included Tonnage by Size</CardTitle>
          <CardDescription>
            Tons included in base price before overage charges apply
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {Object.entries(includedTons).map(([size, tons]) => (
              <div key={size} className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{size} yd</p>
                <p className="text-2xl font-bold mt-1">{tons}</p>
                <p className="text-xs text-muted-foreground">tons</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveRates} disabled={isSaving} size="lg">
        {isSaving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save All Changes
      </Button>

      {/* Pricing Notes */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Mixed Pricing Logic</h3>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Mixed 6/8/10 yd: Base price + ${smallOverageRate}/additional yard</li>
              <li>• Mixed 20+ yd: Included tons + ${standardTonRate}/ton overage (${prepayRate.toFixed(2)} prepaid)</li>
              <li>• Heavy + Trash contamination → Auto-reclass to Mixed (per-ton)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
