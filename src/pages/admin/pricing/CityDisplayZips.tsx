/**
 * Admin: City Display ZIP Manager
 * Manage principal ZIPs used for city-page pricing display.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, RefreshCw, MapPin } from 'lucide-react';
import { invalidateCityPricingCache } from '@/lib/cityDisplayPricing';

interface CityRow {
  id: string;
  city_slug: string;
  city_name: string;
  primary_zip: string;
  fallback_zip: string | null;
  assigned_market_id: string | null;
  preferred_yard_id: string | null;
  is_active: boolean;
  notes: string | null;
}

export default function CityDisplayZips() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CityRow>>({});
  const [newRow, setNewRow] = useState({ city_slug: '', city_name: '', primary_zip: '', fallback_zip: '', assigned_market_id: '', preferred_yard_id: '', notes: '' });
  const [showAdd, setShowAdd] = useState(false);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['admin-city-display-zips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_display_pricing')
        .select('*')
        .order('city_name');
      if (error) throw error;
      return (data || []) as CityRow[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<CityRow> }) => {
      const { error } = await supabase
        .from('city_display_pricing')
        .update(values)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-city-display-zips'] });
      invalidateCityPricingCache();
      setEditingId(null);
      toast({ title: 'Updated', description: 'City ZIP config saved.' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const insertMutation = useMutation({
    mutationFn: async (row: typeof newRow) => {
      const { error } = await supabase.from('city_display_pricing').insert({
        city_slug: row.city_slug,
        city_name: row.city_name,
        primary_zip: row.primary_zip,
        fallback_zip: row.fallback_zip || null,
        assigned_market_id: row.assigned_market_id || null,
        preferred_yard_id: row.preferred_yard_id || null,
        notes: row.notes || null,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-city-display-zips'] });
      invalidateCityPricingCache();
      setShowAdd(false);
      setNewRow({ city_slug: '', city_name: '', primary_zip: '', fallback_zip: '', assigned_market_id: '', preferred_yard_id: '', notes: '' });
      toast({ title: 'Added', description: 'New city ZIP config created.' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('city_display_pricing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-city-display-zips'] });
      invalidateCityPricingCache();
      toast({ title: 'Deleted' });
    },
  });

  const startEdit = (city: CityRow) => {
    setEditingId(city.id);
    setEditValues({ primary_zip: city.primary_zip, fallback_zip: city.fallback_zip, assigned_market_id: city.assigned_market_id, preferred_yard_id: city.preferred_yard_id, is_active: city.is_active, notes: city.notes });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            City Display ZIP Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the principal ZIP codes used for dynamic pricing on city SEO pages.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { invalidateCityPricingCache(); toast({ title: 'Cache cleared' }); }}>
            <RefreshCw className="w-4 h-4 mr-1" /> Clear Cache
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4 mr-1" /> Add City
          </Button>
        </div>
      </div>

      {/* Add new row */}
      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input placeholder="city-slug" value={newRow.city_slug} onChange={e => setNewRow(p => ({ ...p, city_slug: e.target.value }))} />
          <Input placeholder="City Name" value={newRow.city_name} onChange={e => setNewRow(p => ({ ...p, city_name: e.target.value }))} />
          <Input placeholder="Primary ZIP" value={newRow.primary_zip} onChange={e => setNewRow(p => ({ ...p, primary_zip: e.target.value }))} />
          <Input placeholder="Fallback ZIP" value={newRow.fallback_zip} onChange={e => setNewRow(p => ({ ...p, fallback_zip: e.target.value }))} />
          <Input placeholder="Market ID" value={newRow.assigned_market_id} onChange={e => setNewRow(p => ({ ...p, assigned_market_id: e.target.value }))} />
          <Input placeholder="Yard ID" value={newRow.preferred_yard_id} onChange={e => setNewRow(p => ({ ...p, preferred_yard_id: e.target.value }))} />
          <Input placeholder="Notes" value={newRow.notes} onChange={e => setNewRow(p => ({ ...p, notes: e.target.value }))} />
          <Button onClick={() => insertMutation.mutate(newRow)} disabled={!newRow.city_slug || !newRow.primary_zip}>
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 px-3 font-semibold text-foreground">City</th>
                <th className="py-3 px-3 font-semibold text-foreground">Slug</th>
                <th className="py-3 px-3 font-semibold text-foreground">Primary ZIP</th>
                <th className="py-3 px-3 font-semibold text-foreground">Fallback</th>
                <th className="py-3 px-3 font-semibold text-foreground">Market</th>
                <th className="py-3 px-3 font-semibold text-foreground">Yard</th>
                <th className="py-3 px-3 font-semibold text-foreground">Active</th>
                <th className="py-3 px-3 font-semibold text-foreground">Notes</th>
                <th className="py-3 px-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map(city => (
                <tr key={city.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-3 font-medium text-foreground">{city.city_name}</td>
                  <td className="py-3 px-3 text-muted-foreground">{city.city_slug}</td>
                  <td className="py-3 px-3">
                    {editingId === city.id ? (
                      <Input className="h-8 w-20" value={editValues.primary_zip || ''} onChange={e => setEditValues(p => ({ ...p, primary_zip: e.target.value }))} />
                    ) : (
                      <code className="text-primary font-mono">{city.primary_zip}</code>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {editingId === city.id ? (
                      <Input className="h-8 w-20" value={editValues.fallback_zip || ''} onChange={e => setEditValues(p => ({ ...p, fallback_zip: e.target.value }))} />
                    ) : (
                      <span className="text-muted-foreground">{city.fallback_zip || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {editingId === city.id ? (
                      <Input className="h-8 w-32" value={editValues.assigned_market_id || ''} onChange={e => setEditValues(p => ({ ...p, assigned_market_id: e.target.value }))} />
                    ) : (
                      <span className="text-xs text-muted-foreground">{city.assigned_market_id || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {editingId === city.id ? (
                      <Input className="h-8 w-20" value={editValues.preferred_yard_id || ''} onChange={e => setEditValues(p => ({ ...p, preferred_yard_id: e.target.value }))} />
                    ) : (
                      <span className="text-xs text-muted-foreground">{city.preferred_yard_id || '—'}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {editingId === city.id ? (
                      <Button variant="ghost" size="sm" onClick={() => setEditValues(p => ({ ...p, is_active: !p.is_active }))}>
                        <Badge variant={editValues.is_active ? 'default' : 'secondary'}>{editValues.is_active ? 'Yes' : 'No'}</Badge>
                      </Button>
                    ) : (
                      <Badge variant={city.is_active ? 'default' : 'secondary'}>{city.is_active ? 'Yes' : 'No'}</Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground max-w-[120px] truncate">{city.notes || '—'}</td>
                  <td className="py-3 px-3">
                    {editingId === city.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="default" onClick={() => updateMutation.mutate({ id: city.id, values: editValues })}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(city)}>Edit</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(city.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-xs text-muted-foreground">
        <strong>{cities.length}</strong> cities configured · Changes clear pricing cache automatically
      </div>
    </div>
  );
}
