import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Save, Loader2, RefreshCw } from 'lucide-react';

interface ZoneSurcharge {
  id: string;
  zone_name: string;
  yard_id: string;
  miles_from_yard_min: number;
  miles_from_yard_max: number | null;
  quote_surcharge: number;
  dispatch_cost_adjustment: number;
  remote_area_flag: boolean;
  is_active: boolean;
  display_order: number;
}

interface Yard {
  id: string;
  name: string;
}

export default function ZoneSurchargesConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zones, setZones] = useState<ZoneSurcharge[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [selectedYard, setSelectedYard] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [yardsRes, zonesRes] = await Promise.all([
      supabase.from('yards').select('id, name').eq('is_active', true).order('priority_rank'),
      supabase.from('zone_surcharges').select('*').order('display_order'),
    ]);
    setYards(yardsRes.data || []);
    setZones(zonesRes.data?.map(z => ({
      ...z,
      miles_from_yard_min: Number(z.miles_from_yard_min),
      miles_from_yard_max: z.miles_from_yard_max ? Number(z.miles_from_yard_max) : null,
      quote_surcharge: Number(z.quote_surcharge),
      dispatch_cost_adjustment: Number(z.dispatch_cost_adjustment),
    })) || []);
    if (yardsRes.data?.length && !selectedYard) {
      setSelectedYard(yardsRes.data[0].id);
    }
    setLoading(false);
  }

  const filteredZones = zones.filter(z => z.yard_id === selectedYard);

  async function handleSave(zone: ZoneSurcharge) {
    setSaving(true);
    const { error } = await supabase
      .from('zone_surcharges')
      .update({
        quote_surcharge: zone.quote_surcharge,
        dispatch_cost_adjustment: zone.dispatch_cost_adjustment,
        remote_area_flag: zone.remote_area_flag,
        is_active: zone.is_active,
        miles_from_yard_min: zone.miles_from_yard_min,
        miles_from_yard_max: zone.miles_from_yard_max,
        updated_at: new Date().toISOString(),
      })
      .eq('id', zone.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `${zone.zone_name} updated.` });
    }
    setSaving(false);
  }

  function updateZone(id: string, field: string, value: any) {
    setZones(prev => prev.map(z => z.id === id ? { ...z, [field]: value } : z));
  }

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Zone Surcharges</h1>
          <p className="text-sm text-muted-foreground mt-1">Distance-based pricing zones per yard</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Yard selector */}
      <div className="flex gap-2 flex-wrap">
        {yards.map(y => (
          <Button
            key={y.id}
            variant={selectedYard === y.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedYard(y.id)}
          >
            {y.name}
          </Button>
        ))}
      </div>

      {/* Zone cards */}
      <div className="space-y-3">
        {filteredZones.map(zone => (
          <Card key={zone.id} className={!zone.is_active ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{zone.zone_name}</span>
                  {zone.remote_area_flag && <Badge variant="destructive" className="text-[10px]">Remote</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={zone.is_active}
                    onCheckedChange={(v) => updateZone(zone.id, 'is_active', v)}
                  />
                  <Button size="sm" onClick={() => handleSave(zone)} disabled={saving}>
                    <Save className="w-3 h-3 mr-1" /> Save
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Min Miles</label>
                  <Input
                    type="number"
                    value={zone.miles_from_yard_min}
                    onChange={(e) => updateZone(zone.id, 'miles_from_yard_min', Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Max Miles</label>
                  <Input
                    type="number"
                    value={zone.miles_from_yard_max ?? ''}
                    placeholder="∞"
                    onChange={(e) => updateZone(zone.id, 'miles_from_yard_max', e.target.value ? Number(e.target.value) : null)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Quote Surcharge</label>
                  <Input
                    type="number"
                    value={zone.quote_surcharge}
                    onChange={(e) => updateZone(zone.id, 'quote_surcharge', Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Dispatch Adj</label>
                  <Input
                    type="number"
                    value={zone.dispatch_cost_adjustment}
                    onChange={(e) => updateZone(zone.id, 'dispatch_cost_adjustment', Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={zone.remote_area_flag}
                      onCheckedChange={(v) => updateZone(zone.id, 'remote_area_flag', v)}
                    />
                    <label className="text-[10px] text-muted-foreground">Remote</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredZones.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No zones configured for this yard.</p>
        )}
      </div>
    </div>
  );
}
