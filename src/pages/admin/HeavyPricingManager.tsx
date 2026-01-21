import { useEffect, useState } from 'react';
import { Loader2, Plus, Edit2, Trash2, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAuditLog } from '@/lib/auditLog';

interface HeavyRule {
  id: string;
  material_class: string;
  material_list: string[];
  increment_amount: number;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

interface SizeFactor {
  id: string;
  size_yards: number;
  volume_factor: number;
}

export default function HeavyPricingManager() {
  const [rules, setRules] = useState<HeavyRule[]>([]);
  const [factors, setFactors] = useState<SizeFactor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<HeavyRule | null>(null);
  const [form, setForm] = useState({
    material_class: '',
    material_list: '',
    increment_amount: 0,
    description: '',
    display_order: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [rulesRes, factorsRes] = await Promise.all([
      supabase.from('heavy_material_rules').select('*').order('display_order'),
      supabase.from('size_volume_factors').select('*').order('size_yards'),
    ]);

    if (rulesRes.data) setRules(rulesRes.data);
    if (factorsRes.data) setFactors(factorsRes.data);
    setIsLoading(false);
  }

  function openAdd() {
    setEditingRule(null);
    setForm({
      material_class: '',
      material_list: '',
      increment_amount: 0,
      description: '',
      display_order: rules.length,
    });
    setDialogOpen(true);
  }

  function openEdit(rule: HeavyRule) {
    setEditingRule(rule);
    setForm({
      material_class: rule.material_class,
      material_list: rule.material_list.join(', '),
      increment_amount: rule.increment_amount,
      description: rule.description || '',
      display_order: rule.display_order,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.material_class) {
      toast({ title: 'Error', description: 'Material class is required', variant: 'destructive' });
      return;
    }

    const materials = form.material_list
      .split(',')
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      material_class: form.material_class,
      material_list: materials,
      increment_amount: form.increment_amount,
      description: form.description || null,
      display_order: form.display_order,
    };

    if (editingRule) {
      const { error } = await supabase
        .from('heavy_material_rules')
        .update(payload)
        .eq('id', editingRule.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        await createAuditLog({
          action: 'config_edit',
          entityType: 'config_settings',
          entityId: editingRule.id,
          beforeData: JSON.parse(JSON.stringify(editingRule)),
          afterData: JSON.parse(JSON.stringify(payload)),
          changesSummary: `Updated heavy rule: ${form.material_class}`,
        });
        toast({ title: 'Rule updated' });
        setDialogOpen(false);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('heavy_material_rules').insert([payload]);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Rule created' });
        setDialogOpen(false);
        fetchData();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this rule?')) return;

    const { error } = await supabase.from('heavy_material_rules').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Rule deleted' });
      fetchData();
    }
  }

  async function updateFactor(id: string, factor: number) {
    const { error } = await supabase
      .from('size_volume_factors')
      .update({ volume_factor: factor })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Factor updated' });
      fetchData();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Heavy Pricing Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Manage heavy material rules, increments, and size factors
        </p>
      </div>

      {/* Size Volume Factors */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Size Volume Factors (Proportional Pricing)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Base is 10 yd = 1.0x. Other sizes are proportional.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {factors.map((f) => (
            <div key={f.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <span className="font-medium">{f.size_yards} yd</span>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={f.volume_factor}
                onChange={(e) => updateFactor(f.id, parseFloat(e.target.value) || 1)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">× base</span>
            </div>
          ))}
        </div>
      </div>

      {/* Material Rules */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Material Increment Rules</h2>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Class</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead>Increment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <span className="font-medium capitalize">
                    {rule.material_class.replace('_', ' ')}
                  </span>
                  {rule.description && (
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {rule.material_list.slice(0, 5).map((m) => (
                      <Badge key={m} variant="outline" className="text-xs capitalize">
                        {m}
                      </Badge>
                    ))}
                    {rule.material_list.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{rule.material_list.length - 5}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-medium">
                    +${rule.increment_amount}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(rule)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pricing Notes */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Pricing Formula</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Heavy Price = (Base 10yd Price + Increment) × Size Factor<br />
              Example: 8 yd Concrete = ($638 + $200) × 0.8 = $670.40
            </p>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'New Rule'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Material Class</label>
              <Select
                value={form.material_class}
                onValueChange={(v) => setForm({ ...form, material_class: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heavy_clean">Heavy Clean (+$200)</SelectItem>
                  <SelectItem value="heavy_mixed">Heavy Mixed (+$300)</SelectItem>
                  <SelectItem value="heavy_specialty">Heavy Specialty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Increment Amount ($)</label>
              <Input
                type="number"
                value={form.increment_amount}
                onChange={(e) => setForm({ ...form, increment_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Materials (comma-separated)</label>
              <Input
                value={form.material_list}
                onChange={(e) => setForm({ ...form, material_list: e.target.value })}
                placeholder="concrete, asphalt, brick, rock"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Heavy Clean +$200"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
