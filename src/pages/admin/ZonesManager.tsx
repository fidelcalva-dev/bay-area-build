import { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download, Trash2, Edit2, Save, X, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Zone {
  id: string;
  name: string;
  slug: string;
  base_multiplier: number;
  is_active: boolean;
}

interface ZipCode {
  id: string;
  zone_id: string;
  zip_code: string;
  city_name: string | null;
  county: string | null;
}

export default function ZonesManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [zipCodes, setZipCodes] = useState<ZipCode[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit states
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', base_multiplier: 1 });
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', slug: '', base_multiplier: 1 });
  
  // ZIP code add state
  const [newZipCode, setNewZipCode] = useState({ zip_code: '', city_name: '', county: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [zonesRes, zipCodesRes] = await Promise.all([
      supabase.from('pricing_zones').select('*').order('name'),
      supabase.from('zone_zip_codes').select('*').order('zip_code'),
    ]);

    if (zonesRes.data) setZones(zonesRes.data);
    if (zipCodesRes.data) setZipCodes(zipCodesRes.data);
    setIsLoading(false);
  }

  async function handleAddZone() {
    if (!newZone.name || !newZone.slug) {
      toast({ title: 'Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('pricing_zones').insert([newZone]);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Zone created' });
      setNewZone({ name: '', slug: '', base_multiplier: 1 });
      setIsAddingZone(false);
      fetchData();
    }
  }

  async function handleUpdateZone(id: string) {
    const { error } = await supabase.from('pricing_zones').update(editForm).eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Zone updated' });
      setEditingZone(null);
      fetchData();
    }
  }

  async function handleDeleteZone(id: string) {
    if (!confirm('Delete this zone? All associated ZIP codes will also be deleted.')) return;
    
    const { error } = await supabase.from('pricing_zones').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Zone deleted' });
      if (selectedZone === id) setSelectedZone(null);
      fetchData();
    }
  }

  async function handleAddZipCode() {
    if (!selectedZone || !newZipCode.zip_code) {
      toast({ title: 'Error', description: 'ZIP code is required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('zone_zip_codes').insert([{
      zone_id: selectedZone,
      ...newZipCode,
    }]);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'ZIP code added' });
      setNewZipCode({ zip_code: '', city_name: '', county: '' });
      fetchData();
    }
  }

  async function handleDeleteZipCode(id: string) {
    const { error } = await supabase.from('zone_zip_codes').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'ZIP code removed' });
      fetchData();
    }
  }

  function handleExportCSV() {
    const rows = zipCodes.map((zc) => {
      const zone = zones.find((z) => z.id === zc.zone_id);
      return `${zc.zip_code},${zc.city_name || ''},${zc.county || ''},${zone?.slug || ''}`;
    });
    
    const csv = 'zip_code,city_name,county,zone_slug\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zip-zones.csv';
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
      const [zip_code, city_name, county, zone_slug] = line.split(',').map((s) => s.trim());
      const zone = zones.find((z) => z.slug === zone_slug);
      
      if (zone && zip_code) {
        const { error } = await supabase.from('zone_zip_codes').upsert({
          zip_code,
          city_name: city_name || null,
          county: county || null,
          zone_id: zone.id,
        }, { onConflict: 'zip_code' });
        
        if (error) errors++;
        else imported++;
      } else {
        errors++;
      }
    }

    toast({
      title: 'Import Complete',
      description: `Imported ${imported} ZIP codes. ${errors > 0 ? `${errors} errors.` : ''}`,
    });
    
    fetchData();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const filteredZipCodes = zipCodes.filter((zc) => {
    if (selectedZone && zc.zone_id !== selectedZone) return false;
    if (searchTerm) {
      return zc.zip_code.includes(searchTerm) || 
             zc.city_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             zc.county?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

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
          <h1 className="text-2xl font-bold text-foreground">ZIP-to-Zone Mapping</h1>
          <p className="text-muted-foreground">Manage service zones and their ZIP code coverage</p>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Zones List */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Zones</h2>
            <Button size="sm" onClick={() => setIsAddingZone(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Zone
            </Button>
          </div>

          {isAddingZone && (
            <div className="p-4 border-b border-border bg-muted/50 space-y-3">
              <Input
                placeholder="Zone Name"
                value={newZone.name}
                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              />
              <Input
                placeholder="Slug (e.g., zone-1)"
                value={newZone.slug}
                onChange={(e) => setNewZone({ ...newZone, slug: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Base Multiplier"
                value={newZone.base_multiplier}
                onChange={(e) => setNewZone({ ...newZone, base_multiplier: parseFloat(e.target.value) || 1 })}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddZone}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingZone(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="divide-y divide-border">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  selectedZone === zone.id && 'bg-primary/10'
                )}
                onClick={() => setSelectedZone(zone.id)}
              >
                {editingZone === zone.id ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <Input
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm.base_multiplier}
                      onChange={(e) => setEditForm({ ...editForm, base_multiplier: parseFloat(e.target.value) || 1 })}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdateZone(zone.id)}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingZone(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{zone.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {zone.slug} • {zone.base_multiplier}x
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {zipCodes.filter((z) => z.zone_id === zone.id).length} ZIP codes
                      </p>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingZone(zone.id);
                          setEditForm({
                            name: zone.name,
                            slug: zone.slug,
                            base_multiplier: zone.base_multiplier,
                          });
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ZIP Codes List */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">
                ZIP Codes {selectedZone && `(${zones.find((z) => z.id === selectedZone)?.name})`}
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ZIP codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {selectedZone && (
            <div className="p-4 border-b border-border bg-muted/50">
              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="ZIP Code"
                  value={newZipCode.zip_code}
                  onChange={(e) => setNewZipCode({ ...newZipCode, zip_code: e.target.value })}
                />
                <Input
                  placeholder="City"
                  value={newZipCode.city_name}
                  onChange={(e) => setNewZipCode({ ...newZipCode, city_name: e.target.value })}
                />
                <Input
                  placeholder="County"
                  value={newZipCode.county}
                  onChange={(e) => setNewZipCode({ ...newZipCode, county: e.target.value })}
                />
                <Button onClick={handleAddZipCode}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="max-h-[500px] overflow-auto">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">ZIP</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">City</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">County</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredZipCodes.map((zc) => {
                  const zone = zones.find((z) => z.id === zc.zone_id);
                  return (
                    <tr key={zc.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2 text-sm font-mono">{zc.zip_code}</td>
                      <td className="px-4 py-2 text-sm">{zc.city_name || '-'}</td>
                      <td className="px-4 py-2 text-sm">{zc.county || '-'}</td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">{zone?.name}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive h-8 w-8"
                          onClick={() => handleDeleteZipCode(zc.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredZipCodes.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {selectedZone ? 'No ZIP codes in this zone' : 'Select a zone to view ZIP codes'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
