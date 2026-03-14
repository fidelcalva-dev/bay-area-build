import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, Save, Loader2, RefreshCw } from 'lucide-react';

interface RushConfig {
  id: string;
  yard_id: string;
  yard_name?: string;
  allow_same_day: boolean;
  same_day_cutoff_hour: number;
  next_day_cutoff_hour: number;
  daily_capacity: number;
  rush_fee_same_day: number;
  rush_fee_same_day_small_medium: number;
  rush_fee_same_day_large: number;
  rush_fee_next_day: number;
  rush_fee_priority: number;
  rush_fee_priority_next_day: number;
  rush_fee_after_hours: number;
  is_active: boolean;
}

export default function RushDeliveryConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [configs, setConfigs] = useState<RushConfig[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('rush_delivery_config')
      .select('*, yards(name)')
      .order('created_at');

    setConfigs(
      (data || []).map((c: any) => ({
        id: c.id,
        yard_id: c.yard_id,
        yard_name: c.yards?.name || 'Unknown',
        allow_same_day: c.allow_same_day,
        same_day_cutoff_hour: c.same_day_cutoff_hour,
        next_day_cutoff_hour: c.next_day_cutoff_hour,
        daily_capacity: c.daily_capacity,
        rush_fee_same_day: Number(c.rush_fee_same_day),
        rush_fee_same_day_small_medium: Number((c as any).rush_fee_same_day_small_medium ?? 95),
        rush_fee_same_day_large: Number((c as any).rush_fee_same_day_large ?? 145),
        rush_fee_next_day: Number(c.rush_fee_next_day),
        rush_fee_priority: Number(c.rush_fee_priority),
        rush_fee_priority_next_day: Number((c as any).rush_fee_priority_next_day ?? 45),
        rush_fee_after_hours: Number(c.rush_fee_after_hours),
        is_active: c.is_active,
      }))
    );
    setLoading(false);
  }

  function update(id: string, field: string, value: any) {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  async function handleSave(config: RushConfig) {
    setSaving(config.id);
    const { error } = await supabase
      .from('rush_delivery_config')
      .update({
        allow_same_day: config.allow_same_day,
        same_day_cutoff_hour: config.same_day_cutoff_hour,
        next_day_cutoff_hour: config.next_day_cutoff_hour,
        daily_capacity: config.daily_capacity,
        rush_fee_same_day: config.rush_fee_same_day,
        rush_fee_same_day_small_medium: config.rush_fee_same_day_small_medium,
        rush_fee_same_day_large: config.rush_fee_same_day_large,
        rush_fee_next_day: config.rush_fee_next_day,
        rush_fee_priority: config.rush_fee_priority,
        rush_fee_priority_next_day: config.rush_fee_priority_next_day,
        rush_fee_after_hours: config.rush_fee_after_hours,
        is_active: config.is_active,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', config.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `${config.yard_name} rush config updated.` });
    }
    setSaving(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rush Delivery Config</h1>
          <p className="text-sm text-muted-foreground mt-1">Same-day, next-day, priority, and after-hours fees per yard</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="space-y-4">
        {configs.map(config => (
          <Card key={config.id} className={!config.is_active ? 'opacity-50' : ''}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{config.yard_name}</span>
                  {config.allow_same_day && <Badge className="text-[10px]">Same-Day OK</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={config.is_active} onCheckedChange={(v) => update(config.id, 'is_active', v)} />
                  <Button size="sm" onClick={() => handleSave(config)} disabled={saving === config.id}>
                    <Save className="w-3 h-3 mr-1" /> Save
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Same-Day Small/Med (5-20yd)</label>
                  <Input type="number" value={config.rush_fee_same_day_small_medium} onChange={(e) => update(config.id, 'rush_fee_same_day_small_medium', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Same-Day Large (30-50yd)</label>
                  <Input type="number" value={config.rush_fee_same_day_large} onChange={(e) => update(config.id, 'rush_fee_same_day_large', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Priority Next-Day</label>
                  <Input type="number" value={config.rush_fee_priority_next_day} onChange={(e) => update(config.id, 'rush_fee_priority_next_day', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Next-Day Fee</label>
                  <Input type="number" value={config.rush_fee_next_day} onChange={(e) => update(config.id, 'rush_fee_next_day', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Priority Fee</label>
                  <Input type="number" value={config.rush_fee_priority} onChange={(e) => update(config.id, 'rush_fee_priority', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">After-Hours / Holiday</label>
                  <Input type="number" value={config.rush_fee_after_hours} onChange={(e) => update(config.id, 'rush_fee_after_hours', Number(e.target.value))} className="h-8 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Same-Day Cutoff (hr)</label>
                  <Input type="number" min={6} max={18} value={config.same_day_cutoff_hour} onChange={(e) => update(config.id, 'same_day_cutoff_hour', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Next-Day Cutoff (hr)</label>
                  <Input type="number" min={6} max={22} value={config.next_day_cutoff_hour} onChange={(e) => update(config.id, 'next_day_cutoff_hour', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Daily Capacity</label>
                  <Input type="number" value={config.daily_capacity} onChange={(e) => update(config.id, 'daily_capacity', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch checked={config.allow_same_day} onCheckedChange={(v) => update(config.id, 'allow_same_day', v)} />
                    <label className="text-xs text-muted-foreground">Allow Same-Day</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
