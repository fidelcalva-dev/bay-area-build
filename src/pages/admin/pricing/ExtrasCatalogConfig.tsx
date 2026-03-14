import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, RefreshCw, Plus, Trash2 } from 'lucide-react';

interface ExtraItem {
  id: string;
  code: string;
  label: string;
  category: string;
  description: string | null;
  default_amount: number;
  pricing_mode: string;
  taxable: boolean;
  requires_photo: boolean;
  requires_note: boolean;
  requires_dispatch_review: boolean;
  requires_customer_notice: boolean;
  driver_selectable: boolean;
  customer_visible: boolean;
  is_active: boolean;
  display_order: number;
}

const CATEGORIES = [
  { value: 'site_access', label: 'Site / Access' },
  { value: 'readiness', label: 'Readiness / Trip' },
  { value: 'time', label: 'Time' },
  { value: 'material', label: 'Material / Disposal' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'general', label: 'General' },
];

const PRICING_MODES = [
  { value: 'flat', label: 'Flat' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_ton', label: 'Per Ton' },
  { value: 'manual_review', label: 'Manual Review' },
];

const categoryColor: Record<string, string> = {
  site_access: 'bg-blue-100 text-blue-800',
  readiness: 'bg-amber-100 text-amber-800',
  time: 'bg-purple-100 text-purple-800',
  material: 'bg-red-100 text-red-800',
  scheduling: 'bg-green-100 text-green-800',
  general: 'bg-gray-100 text-gray-800',
};

export default function ExtrasCatalogConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [items, setItems] = useState<ExtraItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('extra_items')
      .select('*')
      .order('display_order');
    setItems((data as any[])?.map(d => ({ ...d, default_amount: Number(d.default_amount) })) || []);
    setLoading(false);
  }

  const filtered = filterCategory === 'all' ? items : items.filter(i => i.category === filterCategory);

  function updateItem(id: string, field: string, value: any) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  async function handleSave(item: ExtraItem) {
    setSaving(item.id);
    const { error } = await supabase
      .from('extra_items')
      .update({
        label: item.label,
        category: item.category,
        description: item.description,
        default_amount: item.default_amount,
        pricing_mode: item.pricing_mode,
        taxable: item.taxable,
        requires_photo: item.requires_photo,
        requires_note: item.requires_note,
        requires_dispatch_review: item.requires_dispatch_review,
        requires_customer_notice: item.requires_customer_notice,
        driver_selectable: item.driver_selectable,
        customer_visible: item.customer_visible,
        is_active: item.is_active,
        display_order: item.display_order,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', item.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `${item.label} updated.` });
    }
    setSaving(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Extras & Exceptions Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurable line items for operational exceptions, surcharges, and add-ons
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filterCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterCategory('all')}>All ({items.length})</Button>
        {CATEGORIES.map(c => {
          const count = items.filter(i => i.category === c.value).length;
          return (
            <Button key={c.value} variant={filterCategory === c.value ? 'default' : 'outline'} size="sm" onClick={() => setFilterCategory(c.value)}>
              {c.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filtered.map(item => (
          <Card key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={categoryColor[item.category] || categoryColor.general} variant="secondary">
                    {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                  </Badge>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">{item.code}</code>
                  <span className="font-semibold text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={item.is_active} onCheckedChange={v => updateItem(item.id, 'is_active', v)} />
                  <Button size="sm" onClick={() => handleSave(item)} disabled={saving === item.id}>
                    {saving === item.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} Save
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Label</label>
                  <Input value={item.label} onChange={e => updateItem(item.id, 'label', e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Default $</label>
                  <Input type="number" value={item.default_amount} onChange={e => updateItem(item.id, 'default_amount', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Pricing Mode</label>
                  <Select value={item.pricing_mode} onValueChange={v => updateItem(item.id, 'pricing_mode', v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{PRICING_MODES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Category</label>
                  <Select value={item.category} onValueChange={v => updateItem(item.id, 'category', v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Order</label>
                  <Input type="number" value={item.display_order} onChange={e => updateItem(item.id, 'display_order', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase">Flags</label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      ['requires_photo', 'Photo'],
                      ['requires_note', 'Note'],
                      ['requires_dispatch_review', 'Dispatch'],
                      ['driver_selectable', 'Driver'],
                      ['customer_visible', 'Public'],
                      ['taxable', 'Tax'],
                    ].map(([field, lbl]) => (
                      <button
                        key={field}
                        className={`text-[9px] px-1.5 py-0.5 rounded border ${(item as any)[field] ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}
                        onClick={() => updateItem(item.id, field, !(item as any)[field])}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No extras in this category.</p>
        )}
      </div>
    </div>
  );
}
