// Admin: Customer Material Offers Manager
// Controls which materials show for each customer type + project category combination

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Star, EyeOff, GripVertical } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface MaterialOffer {
  id: string;
  customer_type: string;
  project_category_code: string;
  material_code: string;
  priority: number;
  is_recommended: boolean;
  is_hidden: boolean;
}

interface ProjectCategory {
  category_code: string;
  display_name: string;
}

interface MaterialCatalog {
  material_code: string;
  display_name: string;
  group_name: string;
}

const CUSTOMER_TYPES = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'business', label: 'Business' },
  { value: 'preferred_contractor', label: 'Preferred Contractor' },
  { value: 'wholesaler', label: 'Wholesaler/Broker' },
];

export default function MaterialOffersPage() {
  const [offers, setOffers] = useState<MaterialOffer[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [materials, setMaterials] = useState<MaterialCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCustomerType, setSelectedCustomerType] = useState('homeowner');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [editingOffer, setEditingOffer] = useState<MaterialOffer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      try {
        const [offersRes, categoriesRes, materialsRes] = await Promise.all([
          supabase.from('customer_material_offers').select('*').order('priority', { ascending: true }),
          supabase.from('project_categories').select('category_code, display_name').eq('is_active', true).order('display_order'),
          supabase.from('material_catalog').select('material_code, display_name, group_name').eq('is_active', true).order('display_order'),
        ]);

        if (offersRes.error) throw offersRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (materialsRes.error) throw materialsRes.error;

        setOffers(offersRes.data || []);
        setCategories(categoriesRes.data || []);
        setMaterials(materialsRes.data || []);
        
        if (categoriesRes.data?.[0]) {
          setSelectedCategory(categoriesRes.data[0].category_code);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter offers for current selection
  const filteredOffers = offers.filter(o => 
    o.customer_type === selectedCustomerType && 
    o.project_category_code === selectedCategory
  ).sort((a, b) => a.priority - b.priority);

  // Get material info by code
  function getMaterial(code: string) {
    return materials.find(m => m.material_code === code);
  }

  // Handle new offer
  function handleNew() {
    if (!selectedCategory) {
      toast.error('Please select a project category first');
      return;
    }
    
    setEditingOffer({
      id: '',
      customer_type: selectedCustomerType,
      project_category_code: selectedCategory,
      material_code: '',
      priority: filteredOffers.length + 1,
      is_recommended: false,
      is_hidden: false,
    });
    setIsDialogOpen(true);
  }

  // Handle edit
  function handleEdit(offer: MaterialOffer) {
    setEditingOffer({ ...offer });
    setIsDialogOpen(true);
  }

  // Handle save
  async function handleSave() {
    if (!editingOffer) return;

    if (!editingOffer.material_code) {
      toast.error('Please select a material');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        customer_type: editingOffer.customer_type,
        project_category_code: editingOffer.project_category_code,
        material_code: editingOffer.material_code,
        priority: editingOffer.priority,
        is_recommended: editingOffer.is_recommended,
        is_hidden: editingOffer.is_hidden,
      };

      if (editingOffer.id) {
        const { error } = await supabase
          .from('customer_material_offers')
          .update(payload)
          .eq('id', editingOffer.id);
        if (error) throw error;
        
        setOffers(prev => prev.map(o => o.id === editingOffer.id ? { ...o, ...payload } : o));
        toast.success('Offer updated');
      } else {
        const { data, error } = await supabase
          .from('customer_material_offers')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        
        setOffers(prev => [...prev, data]);
        toast.success('Offer created');
      }

      setIsDialogOpen(false);
      setEditingOffer(null);
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save offer');
    } finally {
      setIsSaving(false);
    }
  }

  // Handle delete
  async function handleDelete(offer: MaterialOffer) {
    if (!confirm('Delete this material offer?')) return;

    try {
      const { error } = await supabase
        .from('customer_material_offers')
        .delete()
        .eq('id', offer.id);
      if (error) throw error;

      setOffers(prev => prev.filter(o => o.id !== offer.id));
      toast.success('Offer deleted');
    } catch (err) {
      toast.error('Failed to delete offer');
    }
  }

  // Toggle recommended
  async function toggleRecommended(offer: MaterialOffer) {
    try {
      const { error } = await supabase
        .from('customer_material_offers')
        .update({ is_recommended: !offer.is_recommended })
        .eq('id', offer.id);
      if (error) throw error;

      setOffers(prev => prev.map(o =>
        o.id === offer.id ? { ...o, is_recommended: !o.is_recommended } : o
      ));
    } catch (err) {
      toast.error('Failed to update');
    }
  }

  // Toggle hidden
  async function toggleHidden(offer: MaterialOffer) {
    try {
      const { error } = await supabase
        .from('customer_material_offers')
        .update({ is_hidden: !offer.is_hidden })
        .eq('id', offer.id);
      if (error) throw error;

      setOffers(prev => prev.map(o =>
        o.id === offer.id ? { ...o, is_hidden: !o.is_hidden } : o
      ));
    } catch (err) {
      toast.error('Failed to update');
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Material Offers</h1>
        <p className="text-muted-foreground">Configure which materials show for each customer type and project</p>
      </div>

      {/* Customer Type Tabs */}
      <Tabs value={selectedCustomerType} onValueChange={setSelectedCustomerType}>
        <TabsList>
          {CUSTOMER_TYPES.map(ct => (
            <TabsTrigger key={ct.value} value={ct.value}>
              {ct.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCustomerType} className="mt-4 space-y-4">
          {/* Category selector */}
          <div className="flex items-center gap-4">
            <Label className="shrink-0">Project Category:</Label>
            <Select value={selectedCategory || ''} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.category_code} value={c.category_code}>
                    {c.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleNew} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>

          {/* Offers list */}
          {selectedCategory && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {categories.find(c => c.category_code === selectedCategory)?.display_name}
                </CardTitle>
                <CardDescription>
                  {filteredOffers.length} materials configured for {CUSTOMER_TYPES.find(ct => ct.value === selectedCustomerType)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredOffers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No materials configured. Add materials to show them in the quote calculator.
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredOffers.map((offer, idx) => {
                      const material = getMaterial(offer.material_code);
                      return (
                        <div
                          key={offer.id}
                          className={`py-3 flex items-center justify-between gap-4 ${offer.is_hidden ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                            <span className="text-sm text-muted-foreground w-6">{offer.priority}</span>
                            <div className="min-w-0">
                              <div className="font-medium truncate flex items-center gap-2">
                                {material?.display_name || offer.material_code}
                                {offer.is_recommended && (
                                  <Badge variant="default" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                                {offer.is_hidden && (
                                  <Badge variant="outline" className="text-xs">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Hidden
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {material?.group_name}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRecommended(offer)}
                              title="Toggle recommended"
                            >
                              <Star className={`w-4 h-4 ${offer.is_recommended ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleHidden(offer)}
                              title="Toggle hidden"
                            >
                              <EyeOff className={`w-4 h-4 ${offer.is_hidden ? 'text-muted-foreground' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(offer)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(offer)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOffer?.id ? 'Edit Material Offer' : 'Add Material Offer'}
            </DialogTitle>
            <DialogDescription>
              Configure how this material appears for {CUSTOMER_TYPES.find(ct => ct.value === selectedCustomerType)?.label} + {categories.find(c => c.category_code === selectedCategory)?.display_name}
            </DialogDescription>
          </DialogHeader>

          {editingOffer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Material *</Label>
                <Select
                  value={editingOffer.material_code}
                  onValueChange={(v) => setEditingOffer({ ...editingOffer, material_code: v })}
                  disabled={!!editingOffer.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map(m => (
                      <SelectItem key={m.material_code} value={m.material_code}>
                        {m.display_name} ({m.group_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority (1 = highest)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={editingOffer.priority}
                  onChange={(e) => setEditingOffer({
                    ...editingOffer,
                    priority: parseInt(e.target.value) || 1
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium text-sm">Recommended</div>
                  <div className="text-xs text-muted-foreground">Show at top with badge</div>
                </div>
                <Switch
                  checked={editingOffer.is_recommended}
                  onCheckedChange={(v) => setEditingOffer({
                    ...editingOffer,
                    is_recommended: v
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium text-sm">Hidden</div>
                  <div className="text-xs text-muted-foreground">Don't show in calculator</div>
                </div>
                <Switch
                  checked={editingOffer.is_hidden}
                  onCheckedChange={(v) => setEditingOffer({
                    ...editingOffer,
                    is_hidden: v
                  })}
                />
              </div>
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
