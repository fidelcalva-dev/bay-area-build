// Admin: Material Catalog Manager
import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, 
  Package, Scale, Recycle, AlertTriangle, Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface MaterialCatalogRow {
  id: string;
  material_code: string;
  display_name: string;
  display_name_es: string | null;
  group_name: string;
  description_short: string | null;
  description_short_es: string | null;
  default_pricing_model: string;
  green_halo_allowed: boolean;
  allowed_sizes_json: number[];
  icon: string;
  density_hint: string;
  requires_contamination_check: boolean;
  is_heavy_material: boolean;
  heavy_increment: number;
  is_active: boolean;
  display_order: number;
}

const PRICING_MODELS = [
  { value: 'DEBRIS', label: 'Standard Debris' },
  { value: 'DEBRIS_HEAVY', label: 'Debris Heavy (Yard Waste)' },
  { value: 'HEAVY_BASE', label: 'Heavy Flat Fee' },
  { value: 'GREEN_HALO', label: 'Green Halo™ Recycling' },
];

const GROUP_OPTIONS = [
  'General Debris',
  'Construction',
  'Heavy Clean',
  'Landscaping',
  'Recycling Streams',
  'Commercial Waste',
];

const SIZE_OPTIONS = [6, 8, 10, 20, 30, 40, 50];

export default function MaterialCatalogPage() {
  const [materials, setMaterials] = useState<MaterialCatalogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<MaterialCatalogRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch materials
  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const { data, error } = await supabase
        .from('material_catalog')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const parsed = (data || []).map(m => ({
        ...m,
        allowed_sizes_json: Array.isArray(m.allowed_sizes_json) 
          ? m.allowed_sizes_json 
          : JSON.parse(m.allowed_sizes_json as string || '[]'),
      }));
      
      setMaterials(parsed);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      toast.error('Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  }

  // Filter materials
  const filteredMaterials = materials.filter(m => 
    m.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.material_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.group_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by group_name
  const groupedMaterials = filteredMaterials.reduce((acc, m) => {
    if (!acc[m.group_name]) acc[m.group_name] = [];
    acc[m.group_name].push(m);
    return acc;
  }, {} as Record<string, MaterialCatalogRow[]>);

  // Handle edit
  function handleEdit(material: MaterialCatalogRow) {
    setEditingMaterial({ ...material });
    setIsDialogOpen(true);
  }

  // Handle new
  function handleNew() {
    setEditingMaterial({
      id: '',
      material_code: '',
      display_name: '',
      display_name_es: '',
      group_name: 'General Debris',
      description_short: '',
      description_short_es: '',
      default_pricing_model: 'DEBRIS',
      green_halo_allowed: false,
      allowed_sizes_json: [6, 8, 10, 20, 30, 40, 50],
      icon: 'package',
      density_hint: 'Medium',
      requires_contamination_check: false,
      is_heavy_material: false,
      heavy_increment: 0,
      is_active: true,
      display_order: 100,
    });
    setIsDialogOpen(true);
  }

  // Handle save
  async function handleSave() {
    if (!editingMaterial) return;
    
    if (!editingMaterial.material_code || !editingMaterial.display_name) {
      toast.error('Material code and display name are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        material_code: editingMaterial.material_code.toUpperCase().replace(/\s+/g, '_'),
        display_name: editingMaterial.display_name,
        display_name_es: editingMaterial.display_name_es || null,
        group_name: editingMaterial.group_name,
        description_short: editingMaterial.description_short || null,
        description_short_es: editingMaterial.description_short_es || null,
        default_pricing_model: editingMaterial.default_pricing_model,
        green_halo_allowed: editingMaterial.green_halo_allowed,
        allowed_sizes_json: editingMaterial.allowed_sizes_json,
        icon: editingMaterial.icon,
        density_hint: editingMaterial.density_hint,
        requires_contamination_check: editingMaterial.requires_contamination_check,
        is_heavy_material: editingMaterial.is_heavy_material,
        heavy_increment: editingMaterial.heavy_increment,
        is_active: editingMaterial.is_active,
        display_order: editingMaterial.display_order,
      };

      if (editingMaterial.id) {
        // Update
        const { error } = await supabase
          .from('material_catalog')
          .update(payload)
          .eq('id', editingMaterial.id);
        if (error) throw error;
        toast.success('Material updated');
      } else {
        // Insert
        const { error } = await supabase
          .from('material_catalog')
          .insert(payload);
        if (error) throw error;
        toast.success('Material created');
      }

      setIsDialogOpen(false);
      setEditingMaterial(null);
      fetchMaterials();
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save material');
    } finally {
      setIsSaving(false);
    }
  }

  // Toggle active status
  async function toggleActive(material: MaterialCatalogRow) {
    try {
      const { error } = await supabase
        .from('material_catalog')
        .update({ is_active: !material.is_active })
        .eq('id', material.id);
      if (error) throw error;
      
      setMaterials(prev => prev.map(m => 
        m.id === material.id ? { ...m, is_active: !m.is_active } : m
      ));
      toast.success(material.is_active ? 'Material deactivated' : 'Material activated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  }

  // Toggle size in allowed_sizes
  function toggleSize(size: number) {
    if (!editingMaterial) return;
    const current = editingMaterial.allowed_sizes_json;
    const updated = current.includes(size)
      ? current.filter(s => s !== size)
      : [...current, size].sort((a, b) => a - b);
    setEditingMaterial({ ...editingMaterial, allowed_sizes_json: updated });
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Material Catalog</h1>
          <p className="text-muted-foreground">Manage materials available in the quote calculator</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Materials by group */}
      <div className="space-y-6">
        {Object.entries(groupedMaterials).map(([group, items]) => (
          <Card key={group}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{group}</CardTitle>
              <CardDescription>{items.length} materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {items.map((material) => (
                  <div 
                    key={material.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted ${!material.is_active && 'opacity-50'}`}>
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          {material.display_name}
                          {!material.is_active && (
                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {material.material_code}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Badges */}
                      <div className="hidden md:flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {PRICING_MODELS.find(p => p.value === material.default_pricing_model)?.label || material.default_pricing_model}
                        </Badge>
                        {material.is_heavy_material && (
                          <Badge variant="outline" className="text-xs bg-amber-50">
                            <Scale className="w-3 h-3 mr-1" />
                            Heavy
                          </Badge>
                        )}
                        {material.green_halo_allowed && (
                          <Badge variant="outline" className="text-xs bg-green-50">
                            <Recycle className="w-3 h-3 mr-1" />
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(material)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={material.is_active}
                        onCheckedChange={() => toggleActive(material)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial?.id ? 'Edit Material' : 'New Material'}
            </DialogTitle>
            <DialogDescription>
              Configure material properties and pricing rules
            </DialogDescription>
          </DialogHeader>

          {editingMaterial && (
            <div className="space-y-4 py-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material Code *</Label>
                  <Input
                    value={editingMaterial.material_code}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      material_code: e.target.value.toUpperCase().replace(/\s+/g, '_')
                    })}
                    placeholder="CONCRETE_CLEAN"
                    disabled={!!editingMaterial.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={editingMaterial.display_order}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      display_order: parseInt(e.target.value) || 100
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name (EN) *</Label>
                  <Input
                    value={editingMaterial.display_name}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      display_name: e.target.value
                    })}
                    placeholder="Concrete Only (Clean)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Name (ES)</Label>
                  <Input
                    value={editingMaterial.display_name_es || ''}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      display_name_es: e.target.value
                    })}
                    placeholder="Solo Concreto (Limpio)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Description (EN)</Label>
                  <Input
                    value={editingMaterial.description_short || ''}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      description_short: e.target.value
                    })}
                    placeholder="100% clean broken concrete"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (ES)</Label>
                  <Input
                    value={editingMaterial.description_short_es || ''}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      description_short_es: e.target.value
                    })}
                    placeholder="Concreto roto 100% limpio"
                  />
                </div>
              </div>

              {/* Group and pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Group</Label>
                  <Select
                    value={editingMaterial.group_name}
                    onValueChange={(v) => setEditingMaterial({
                      ...editingMaterial,
                      group_name: v
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_OPTIONS.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pricing Model</Label>
                  <Select
                    value={editingMaterial.default_pricing_model}
                    onValueChange={(v) => setEditingMaterial({
                      ...editingMaterial,
                      default_pricing_model: v
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_MODELS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Allowed sizes */}
              <div className="space-y-2">
                <Label>Allowed Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map(size => {
                    const isSelected = editingMaterial.allowed_sizes_json.includes(size);
                    return (
                      <Button
                        key={size}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSize(size)}
                      >
                        {size} yd
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Heavy Material</div>
                    <div className="text-xs text-muted-foreground">Uses flat-fee pricing</div>
                  </div>
                  <Switch
                    checked={editingMaterial.is_heavy_material}
                    onCheckedChange={(v) => setEditingMaterial({
                      ...editingMaterial,
                      is_heavy_material: v,
                      allowed_sizes_json: v ? [6, 8, 10] : editingMaterial.allowed_sizes_json
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Green Halo Eligible</div>
                    <div className="text-xs text-muted-foreground">Recyclable material</div>
                  </div>
                  <Switch
                    checked={editingMaterial.green_halo_allowed}
                    onCheckedChange={(v) => setEditingMaterial({
                      ...editingMaterial,
                      green_halo_allowed: v
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Contamination Check</div>
                    <div className="text-xs text-muted-foreground">Requires clean/trash toggle</div>
                  </div>
                  <Switch
                    checked={editingMaterial.requires_contamination_check}
                    onCheckedChange={(v) => setEditingMaterial({
                      ...editingMaterial,
                      requires_contamination_check: v
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Active</div>
                    <div className="text-xs text-muted-foreground">Show in calculator</div>
                  </div>
                  <Switch
                    checked={editingMaterial.is_active}
                    onCheckedChange={(v) => setEditingMaterial({
                      ...editingMaterial,
                      is_active: v
                    })}
                  />
                </div>
              </div>

              {/* Heavy increment */}
              {editingMaterial.is_heavy_material && (
                <div className="space-y-2">
                  <Label>Heavy Increment ($)</Label>
                  <Select
                    value={String(editingMaterial.heavy_increment)}
                    onValueChange={(v) => setEditingMaterial({
                      ...editingMaterial,
                      heavy_increment: parseInt(v)
                    })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">$0 (Clean Base)</SelectItem>
                      <SelectItem value="200">+$200 (Plus 200)</SelectItem>
                      <SelectItem value="300">+$300 (Mixed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Added to the $638 heavy base price
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
