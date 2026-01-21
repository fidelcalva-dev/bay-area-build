import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Loader2, Check, X, Power } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Yard {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  market: string;
  latitude: number;
  longitude: number;
  priority_rank: number;
  is_active: boolean;
}

const initialForm = {
  name: '',
  slug: '',
  address: '',
  market: '',
  latitude: '',
  longitude: '',
  priority_rank: 1,
  is_active: true,
};

export default function YardsManager() {
  const [yards, setYards] = useState<Yard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingYard, setEditingYard] = useState<Yard | null>(null);
  const [form, setForm] = useState(initialForm);
  const { toast } = useToast();

  useEffect(() => {
    fetchYards();
  }, []);

  async function fetchYards() {
    const { data, error } = await supabase
      .from('yards')
      .select('*')
      .order('priority_rank');

    if (error) {
      toast({ title: 'Error loading yards', description: error.message, variant: 'destructive' });
    } else {
      setYards(data || []);
    }
    setIsLoading(false);
  }

  function openAddDialog() {
    setEditingYard(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  }

  function openEditDialog(yard: Yard) {
    setEditingYard(yard);
    setForm({
      name: yard.name,
      slug: yard.slug,
      address: yard.address || '',
      market: yard.market,
      latitude: yard.latitude.toString(),
      longitude: yard.longitude.toString(),
      priority_rank: yard.priority_rank,
      is_active: yard.is_active,
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.slug || !form.market || !form.latitude || !form.longitude) {
      toast({ title: 'Missing required fields', variant: 'destructive' });
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
      address: form.address || null,
      market: form.market,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      priority_rank: form.priority_rank,
      is_active: form.is_active,
    };

    if (editingYard) {
      const { error } = await supabase
        .from('yards')
        .update(payload)
        .eq('id', editingYard.id);

      if (error) {
        toast({ title: 'Error updating yard', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Yard updated successfully' });
        setIsDialogOpen(false);
        fetchYards();
      }
    } else {
      const { error } = await supabase.from('yards').insert(payload);

      if (error) {
        toast({ title: 'Error creating yard', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Yard created successfully' });
        setIsDialogOpen(false);
        fetchYards();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this yard?')) return;

    const { error } = await supabase.from('yards').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting yard', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Yard deleted' });
      fetchYards();
    }
  }

  async function toggleActive(yard: Yard) {
    const { error } = await supabase
      .from('yards')
      .update({ is_active: !yard.is_active })
      .eq('id', yard.id);

    if (error) {
      toast({ title: 'Error toggling status', description: error.message, variant: 'destructive' });
    } else {
      fetchYards();
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Yard Manager</h1>
          <p className="text-muted-foreground mt-1">
            Manage dispatch yards and their locations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Yard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingYard ? 'Edit Yard' : 'Add New Yard'}</DialogTitle>
              <DialogDescription>
                Configure yard location and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Oakland Yard"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="oakland"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Industrial Blvd, Oakland, CA"
                />
              </div>
              <div className="space-y-2">
                <Label>Market *</Label>
                <Input
                  value={form.market}
                  onChange={(e) => setForm({ ...form, market: e.target.value })}
                  placeholder="OAK, SJ, TRACY"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder="37.8044"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder="-122.2712"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority Rank</Label>
                  <Input
                    type="number"
                    value={form.priority_rank}
                    onChange={(e) => setForm({ ...form, priority_rank: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  {editingYard ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Market</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {yards.map((yard) => (
              <TableRow key={yard.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {yard.name}
                  </div>
                </TableCell>
                <TableCell>{yard.market}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {yard.address || '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {yard.latitude.toFixed(4)}, {yard.longitude.toFixed(4)}
                </TableCell>
                <TableCell>{yard.priority_rank}</TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleActive(yard)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      yard.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {yard.is_active ? 'Active' : 'Inactive'}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(yard)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(yard.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {yards.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No yards configured. Add your first yard to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
