import { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface DumpsterSize {
  id: string;
  size_value: number;
  label: string;
  base_price: number;
  included_tons: number;
  description: string | null;
  dimensions: string | null;
  is_heavy_only: boolean;
  is_active: boolean;
  display_order: number;
}

interface Zone {
  id: string;
  name: string;
  slug: string;
  base_multiplier: number;
}

interface ZonePricing {
  id: string;
  zone_id: string;
  size_id: string;
  price_override: number | null;
  is_available: boolean;
}

interface MaterialType {
  id: string;
  value: string;
  label: string;
  icon: string | null;
  description: string | null;
  price_adjustment: number;
  allowed_sizes: number[];
  is_active: boolean;
}

interface RentalPeriod {
  id: string;
  days: number;
  label: string;
  extra_cost: number;
  is_default: boolean;
  is_active: boolean;
}

export default function PricingManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [sizes, setSizes] = useState<DumpsterSize[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonePricing, setZonePricing] = useState<ZonePricing[]>([]);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [rentalPeriods, setRentalPeriods] = useState<RentalPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DumpsterSize>>({});
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSize, setNewSize] = useState<Partial<DumpsterSize>>({
    size_value: 10,
    label: '10 yd',
    base_price: 395,
    included_tons: 1,
    description: '',
    dimensions: '',
    is_heavy_only: false,
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [sizesRes, zonesRes, zonePricingRes, materialsRes, rentalsRes] = await Promise.all([
      supabase.from('dumpster_sizes').select('*').order('display_order'),
      supabase.from('pricing_zones').select('*').order('name'),
      supabase.from('zone_pricing').select('*'),
      supabase.from('material_types').select('*').order('display_order'),
      supabase.from('rental_periods').select('*').order('display_order'),
    ]);

    if (sizesRes.data) setSizes(sizesRes.data);
    if (zonesRes.data) setZones(zonesRes.data);
    if (zonePricingRes.data) setZonePricing(zonePricingRes.data);
    if (materialsRes.data) setMaterials(materialsRes.data);
    if (rentalsRes.data) setRentalPeriods(rentalsRes.data);
    setIsLoading(false);
  }

  async function handleAddSize() {
    const sizeData = {
      size_value: newSize.size_value!,
      label: newSize.label!,
      base_price: newSize.base_price!,
      included_tons: newSize.included_tons!,
      description: newSize.description || null,
      dimensions: newSize.dimensions || null,
      is_heavy_only: newSize.is_heavy_only || false,
      is_active: newSize.is_active !== false,
      display_order: newSize.display_order || 0,
    };
    
    const { error } = await supabase.from('dumpster_sizes').insert([sizeData]);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Size added' });
      setIsAddingSize(false);
      setNewSize({
        size_value: 10,
        label: '10 yd',
        base_price: 395,
        included_tons: 1,
        description: '',
        dimensions: '',
        is_heavy_only: false,
        is_active: true,
        display_order: 0,
      });
      fetchData();
    }
  }

  async function handleUpdateSize(id: string) {
    const { error } = await supabase.from('dumpster_sizes').update(editForm).eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Size updated' });
      setEditingSize(null);
      fetchData();
    }
  }

  async function handleDeleteSize(id: string) {
    if (!confirm('Delete this size? This cannot be undone.')) return;
    
    const { error } = await supabase.from('dumpster_sizes').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Size deleted' });
      fetchData();
    }
  }

  async function handleZonePriceChange(zoneId: string, sizeId: string, priceOverride: number | null) {
    const existing = zonePricing.find((zp) => zp.zone_id === zoneId && zp.size_id === sizeId);
    
    if (existing) {
      await supabase.from('zone_pricing').update({ price_override: priceOverride }).eq('id', existing.id);
    } else {
      await supabase.from('zone_pricing').insert([{
        zone_id: zoneId,
        size_id: sizeId,
        price_override: priceOverride,
        is_available: true,
      }]);
    }
    
    fetchData();
  }

  function handleExportCSV() {
    const rows = sizes.map((size) => {
      const zonePrices = zones.map((zone) => {
        const zp = zonePricing.find((p) => p.zone_id === zone.id && p.size_id === size.id);
        return zp?.price_override || '';
      });
      return [
        size.size_value,
        size.label,
        size.base_price,
        size.included_tons,
        size.description || '',
        size.is_heavy_only,
        ...zonePrices,
      ].join(',');
    });
    
    const headers = ['size_value', 'label', 'base_price', 'included_tons', 'description', 'is_heavy_only', ...zones.map((z) => z.slug)];
    const csv = headers.join(',') + '\n' + rows.join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing-table.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    
    let imported = 0;
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = line.split(',').map((v) => v.trim());
      const size_value = parseInt(values[0]);
      const label = values[1];
      const base_price = parseFloat(values[2]);
      const included_tons = parseFloat(values[3]);
      const description = values[4] || null;
      const is_heavy_only = values[5]?.toLowerCase() === 'true';

      const { error } = await supabase.from('dumpster_sizes').upsert({
        size_value,
        label,
        base_price,
        included_tons,
        description,
        is_heavy_only,
      }, { onConflict: 'size_value' });

      if (error) errors++;
      else imported++;
    }

    toast({
      title: 'Import Complete',
      description: `Imported ${imported} sizes. ${errors > 0 ? `${errors} errors.` : ''}`,
    });
    
    fetchData();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pricing Tables</h1>
          <p className="text-muted-foreground">Configure base prices and zone-specific pricing</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sizes">
        <TabsList className="mb-4">
          <TabsTrigger value="sizes">Dumpster Sizes</TabsTrigger>
          <TabsTrigger value="zones">Zone Pricing</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="rentals">Rental Periods</TabsTrigger>
        </TabsList>

        <TabsContent value="sizes">
          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Dumpster Sizes</h2>
              <Button size="sm" onClick={() => setIsAddingSize(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Size
              </Button>
            </div>

            {isAddingSize && (
              <div className="p-4 border-b border-border bg-muted/50 grid grid-cols-6 gap-3">
                <Input
                  type="number"
                  placeholder="Size (yd)"
                  value={newSize.size_value}
                  onChange={(e) => setNewSize({ ...newSize, size_value: parseInt(e.target.value) })}
                />
                <Input
                  placeholder="Label"
                  value={newSize.label}
                  onChange={(e) => setNewSize({ ...newSize, label: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Base Price"
                  value={newSize.base_price}
                  onChange={(e) => setNewSize({ ...newSize, base_price: parseFloat(e.target.value) })}
                />
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Included Tons"
                  value={newSize.included_tons}
                  onChange={(e) => setNewSize({ ...newSize, included_tons: parseFloat(e.target.value) })}
                />
                <Input
                  placeholder="Description"
                  value={newSize.description || ''}
                  onChange={(e) => setNewSize({ ...newSize, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddSize}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingSize(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Label</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Base Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Included Tons</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Heavy Only</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Active</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sizes.map((size) => (
                  <tr key={size.id} className="hover:bg-muted/30">
                    {editingSize === size.id ? (
                      <>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            className="w-20"
                            value={editForm.size_value}
                            onChange={(e) => setEditForm({ ...editForm, size_value: parseInt(e.target.value) })}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            className="w-24"
                            value={editForm.label}
                            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            className="w-24"
                            value={editForm.base_price}
                            onChange={(e) => setEditForm({ ...editForm, base_price: parseFloat(e.target.value) })}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            step="0.5"
                            className="w-20"
                            value={editForm.included_tons}
                            onChange={(e) => setEditForm({ ...editForm, included_tons: parseFloat(e.target.value) })}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Switch
                            checked={editForm.is_heavy_only}
                            onCheckedChange={(v) => setEditForm({ ...editForm, is_heavy_only: v })}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Switch
                            checked={editForm.is_active}
                            onCheckedChange={(v) => setEditForm({ ...editForm, is_active: v })}
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleUpdateSize(size.id)}>
                              <Save className="w-4 h-4 text-primary" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditingSize(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm font-medium">{size.size_value} yd</td>
                        <td className="px-4 py-3 text-sm">{size.label}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">${size.base_price}</td>
                        <td className="px-4 py-3 text-sm text-right">{size.included_tons} ton</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{size.description}</td>
                        <td className="px-4 py-3 text-center">
                          {size.is_heavy_only && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">Heavy</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            'px-2 py-0.5 text-xs rounded-full',
                            size.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          )}>
                            {size.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingSize(size.id);
                                setEditForm(size);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDeleteSize(size.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="zones">
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground sticky left-0 bg-muted/50">Size</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Base</th>
                  {zones.map((zone) => (
                    <th key={zone.id} className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      {zone.name}
                      <br />
                      <span className="text-muted-foreground/70">({zone.base_multiplier}x)</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sizes.map((size) => (
                  <tr key={size.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-card">{size.label}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">${size.base_price}</td>
                    {zones.map((zone) => {
                      const zp = zonePricing.find((p) => p.zone_id === zone.id && p.size_id === size.id);
                      const calculatedPrice = Math.round(size.base_price * zone.base_multiplier);
                      
                      return (
                        <td key={zone.id} className="px-4 py-2">
                          <Input
                            type="number"
                            placeholder={calculatedPrice.toString()}
                            value={zp?.price_override ?? ''}
                            onChange={(e) => {
                              const val = e.target.value ? parseFloat(e.target.value) : null;
                              handleZonePriceChange(zone.id, size.id, val);
                            }}
                            className="w-24 text-right"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="p-4 text-sm text-muted-foreground border-t border-border">
              Leave blank to use base price × zone multiplier. Enter a value to override.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="materials">
          <div className="bg-card rounded-xl border border-border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Price Adjustment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Allowed Sizes</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">
                      {mat.icon} {mat.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{mat.description}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {mat.price_adjustment > 0 ? `+$${mat.price_adjustment}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{mat.allowed_sizes.join(', ')} yd</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        mat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      )}>
                        {mat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="rentals">
          <div className="bg-card rounded-xl border border-border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Label</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Extra Cost</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Default</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rentalPeriods.map((rp) => (
                  <tr key={rp.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{rp.days} days</td>
                    <td className="px-4 py-3 text-sm">{rp.label}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {rp.extra_cost > 0 ? `+$${rp.extra_cost}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rp.is_default && <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Default</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        rp.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      )}>
                        {rp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
