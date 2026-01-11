import { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface Extra {
  id: string;
  value: string;
  label: string;
  description: string | null;
  price: number;
  icon: string | null;
  is_active: boolean;
  display_order: number;
}

export default function ExtrasManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExtra, setEditingExtra] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Extra>>({});
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [newExtra, setNewExtra] = useState({
    value: '',
    label: '',
    description: '',
    price: 0,
    icon: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const { data } = await supabase.from('pricing_extras').select('*').order('display_order');
    if (data) setExtras(data);
    setIsLoading(false);
  }

  async function handleAddExtra() {
    if (!newExtra.value || !newExtra.label) {
      toast({ title: 'Error', description: 'Value and label are required', variant: 'destructive' });
      return;
    }

    const extraData = {
      value: newExtra.value,
      label: newExtra.label,
      description: newExtra.description || null,
      price: newExtra.price,
      icon: newExtra.icon || null,
      is_active: newExtra.is_active,
      display_order: newExtra.display_order,
    };

    const { error } = await supabase.from('pricing_extras').insert([extraData]);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Extra added' });
      setIsAddingExtra(false);
      setNewExtra({
        value: '',
        label: '',
        description: '',
        price: 0,
        icon: '',
        is_active: true,
        display_order: 0,
      });
      fetchData();
    }
  }

  async function handleUpdateExtra(id: string) {
    const { error } = await supabase.from('pricing_extras').update(editForm).eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Extra updated' });
      setEditingExtra(null);
      fetchData();
    }
  }

  async function handleDeleteExtra(id: string) {
    if (!confirm('Delete this extra? This cannot be undone.')) return;
    
    const { error } = await supabase.from('pricing_extras').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Extra deleted' });
      fetchData();
    }
  }

  function handleExportCSV() {
    const rows = extras.map((extra) => 
      `${extra.value},${extra.label},"${extra.description || ''}",${extra.price},${extra.icon || ''},${extra.is_active}`
    );
    
    const csv = 'value,label,description,price,icon,is_active\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extras.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').slice(1).filter(Boolean);
    
    let imported = 0;
    let errors = 0;

    for (const line of lines) {
      const parts = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g);
      if (!parts || parts.length < 4) {
        errors++;
        continue;
      }
      
      const cleanValue = (s: string) => s.replace(/^,?"?|"?$/g, '').replace(/""/g, '"');
      
      const value = cleanValue(parts[0]);
      const label = cleanValue(parts[1]);
      const description = cleanValue(parts[2]) || null;
      const price = parseFloat(cleanValue(parts[3])) || 0;
      const icon = parts[4] ? cleanValue(parts[4]) : null;
      const is_active = parts[5] ? cleanValue(parts[5]).toLowerCase() !== 'false' : true;

      const { error } = await supabase.from('pricing_extras').upsert({
        value,
        label,
        description,
        price,
        icon,
        is_active,
      }, { onConflict: 'value' });

      if (error) errors++;
      else imported++;
    }

    toast({
      title: 'Import Complete',
      description: `Imported ${imported} extras. ${errors > 0 ? `${errors} errors.` : ''}`,
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
          <h1 className="text-2xl font-bold text-foreground">Extras Catalog</h1>
          <p className="text-muted-foreground">Configure additional services and fees</p>
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
          <Button onClick={() => setIsAddingExtra(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Extra
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        {isAddingExtra && (
          <div className="p-4 border-b border-border bg-muted/50 grid grid-cols-7 gap-3 items-end">
            <Input
              placeholder="Value (ID)"
              value={newExtra.value}
              onChange={(e) => setNewExtra({ ...newExtra, value: e.target.value })}
            />
            <Input
              placeholder="Label"
              value={newExtra.label}
              onChange={(e) => setNewExtra({ ...newExtra, label: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newExtra.description}
              onChange={(e) => setNewExtra({ ...newExtra, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Price"
              value={newExtra.price}
              onChange={(e) => setNewExtra({ ...newExtra, price: parseFloat(e.target.value) || 0 })}
            />
            <Input
              placeholder="Icon (emoji)"
              value={newExtra.icon}
              onChange={(e) => setNewExtra({ ...newExtra, icon: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={newExtra.is_active}
                onCheckedChange={(v) => setNewExtra({ ...newExtra, is_active: v })}
              />
              <span className="text-sm">Active</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddExtra}>
                <Save className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingExtra(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Icon</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Label</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Active</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {extras.map((extra) => (
              <tr key={extra.id} className="hover:bg-muted/30">
                {editingExtra === extra.id ? (
                  <>
                    <td className="px-4 py-2">
                      <Input
                        className="w-16"
                        value={editForm.icon || ''}
                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        className="w-28"
                        value={editForm.value}
                        onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={editForm.label}
                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        className="w-24"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
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
                        <Button size="icon" variant="ghost" onClick={() => handleUpdateExtra(extra.id)}>
                          <Save className="w-4 h-4 text-primary" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingExtra(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-xl">{extra.icon}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{extra.value}</td>
                    <td className="px-4 py-3 text-sm font-medium">{extra.label}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{extra.description}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">${extra.price}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        extra.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      )}>
                        {extra.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingExtra(extra.id);
                            setEditForm(extra);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteExtra(extra.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {extras.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No extras configured yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
