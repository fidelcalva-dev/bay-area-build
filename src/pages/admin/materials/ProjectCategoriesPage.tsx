// Admin: Project Categories Manager
import { useState, useEffect } from 'react';
import { Plus, Edit2, GripVertical, Search, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ProjectCategoryRow {
  id: string;
  category_code: string;
  display_name: string;
  display_name_es: string | null;
  description: string | null;
  description_es: string | null;
  icon: string;
  is_active: boolean;
  display_order: number;
}

export default function ProjectCategoriesPage() {
  const [categories, setCategories] = useState<ProjectCategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<ProjectCategoryRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredCategories = categories.filter(c =>
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleEdit(category: ProjectCategoryRow) {
    setEditingCategory({ ...category });
    setIsDialogOpen(true);
  }

  function handleNew() {
    setEditingCategory({
      id: '',
      category_code: '',
      display_name: '',
      display_name_es: '',
      description: '',
      description_es: '',
      icon: 'package',
      is_active: true,
      display_order: categories.length * 10 + 10,
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!editingCategory) return;

    if (!editingCategory.category_code || !editingCategory.display_name) {
      toast.error('Category code and display name are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        category_code: editingCategory.category_code.toUpperCase().replace(/\s+/g, '_'),
        display_name: editingCategory.display_name,
        display_name_es: editingCategory.display_name_es || null,
        description: editingCategory.description || null,
        description_es: editingCategory.description_es || null,
        icon: editingCategory.icon,
        is_active: editingCategory.is_active,
        display_order: editingCategory.display_order,
      };

      if (editingCategory.id) {
        const { error } = await supabase
          .from('project_categories')
          .update(payload)
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase
          .from('project_categories')
          .insert(payload);
        if (error) throw error;
        toast.success('Category created');
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(category: ProjectCategoryRow) {
    try {
      const { error } = await supabase
        .from('project_categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);
      if (error) throw error;

      setCategories(prev => prev.map(c =>
        c.id === category.id ? { ...c, is_active: !c.is_active } : c
      ));
      toast.success(category.is_active ? 'Category deactivated' : 'Category activated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project Categories</h1>
          <p className="text-muted-foreground">Define project types for the quote calculator</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Categories</CardTitle>
          <CardDescription>{categories.length} project categories defined</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="min-w-0">
                    <div className="font-medium truncate flex items-center gap-2">
                      {category.display_name}
                      {!category.is_active && (
                        <span className="text-xs text-muted-foreground">(Inactive)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {category.category_code}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden md:block">
                    Order: {category.display_order}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={category.is_active}
                    onCheckedChange={() => toggleActive(category)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory?.id ? 'Edit Category' : 'New Category'}
            </DialogTitle>
            <DialogDescription>
              Configure project category properties
            </DialogDescription>
          </DialogHeader>

          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category Code *</Label>
                  <Input
                    value={editingCategory.category_code}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      category_code: e.target.value.toUpperCase().replace(/\s+/g, '_')
                    })}
                    placeholder="HOME_CLEANOUT"
                    disabled={!!editingCategory.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={editingCategory.display_order}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      display_order: parseInt(e.target.value) || 100
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name (EN) *</Label>
                  <Input
                    value={editingCategory.display_name}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      display_name: e.target.value
                    })}
                    placeholder="Home Cleanout"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Name (ES)</Label>
                  <Input
                    value={editingCategory.display_name_es || ''}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      display_name_es: e.target.value
                    })}
                    placeholder="Limpieza del Hogar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Description (EN)</Label>
                  <Input
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      description: e.target.value
                    })}
                    placeholder="Garage, attic, basement..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (ES)</Label>
                  <Input
                    value={editingCategory.description_es || ''}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      description_es: e.target.value
                    })}
                    placeholder="Garaje, ático, sótano..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium text-sm">Active</div>
                  <div className="text-xs text-muted-foreground">Show in calculator</div>
                </div>
                <Switch
                  checked={editingCategory.is_active}
                  onCheckedChange={(v) => setEditingCategory({
                    ...editingCategory,
                    is_active: v
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
