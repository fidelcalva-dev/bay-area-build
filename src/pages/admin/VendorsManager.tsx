import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader2, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Vendor {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  is_active: boolean;
}

interface Zone {
  id: string;
  name: string;
}

interface VendorZone {
  id: string;
  vendor_id: string;
  zone_id: string;
  is_primary: boolean;
}

interface DumpsterSize {
  id: string;
  size_value: number;
  label: string;
}

interface VendorPricing {
  id: string;
  vendor_id: string;
  size_id: string;
  cost: number;
  notes: string | null;
}

export default function VendorsManager() {
  const { toast } = useToast();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [sizes, setSizes] = useState<DumpsterSize[]>([]);
  const [vendorZones, setVendorZones] = useState<VendorZone[]>([]);
  const [vendorPricing, setVendorPricing] = useState<VendorPricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [vendorsRes, zonesRes, sizesRes, vendorZonesRes, vendorPricingRes] = await Promise.all([
      supabase.from('vendors').select('*').order('name'),
      supabase.from('pricing_zones').select('id, name').order('name'),
      supabase.from('dumpster_sizes').select('id, size_value, label').order('size_value'),
      supabase.from('vendor_zones').select('*'),
      supabase.from('vendor_pricing').select('*'),
    ]);

    if (vendorsRes.data) setVendors(vendorsRes.data);
    if (zonesRes.data) setZones(zonesRes.data);
    if (sizesRes.data) setSizes(sizesRes.data);
    if (vendorZonesRes.data) setVendorZones(vendorZonesRes.data);
    if (vendorPricingRes.data) setVendorPricing(vendorPricingRes.data);
    setIsLoading(false);
  }

  async function handleSaveVendor() {
    const data = {
      name: vendorForm.name,
      contact_name: vendorForm.contact_name || null,
      contact_email: vendorForm.contact_email || null,
      contact_phone: vendorForm.contact_phone || null,
      notes: vendorForm.notes || null,
      is_active: vendorForm.is_active,
    };

    if (editingVendor) {
      const { error } = await supabase.from('vendors').update(data).eq('id', editingVendor);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Vendor updated' });
        setEditingVendor(null);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('vendors').insert([data]);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Vendor added' });
        setIsAddingVendor(false);
        fetchData();
      }
    }
    
    setVendorForm({
      name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
      is_active: true,
    });
  }

  async function handleDeleteVendor(id: string) {
    if (!confirm('Delete this vendor? This cannot be undone.')) return;
    
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Vendor deleted' });
      if (selectedVendor === id) setSelectedVendor(null);
      fetchData();
    }
  }

  async function handleToggleZone(vendorId: string, zoneId: string, currentlyAssigned: boolean) {
    if (currentlyAssigned) {
      await supabase.from('vendor_zones').delete()
        .eq('vendor_id', vendorId)
        .eq('zone_id', zoneId);
    } else {
      await supabase.from('vendor_zones').insert([{
        vendor_id: vendorId,
        zone_id: zoneId,
        is_primary: false,
      }]);
    }
    fetchData();
  }

  async function handlePricingChange(vendorId: string, sizeId: string, cost: number | null) {
    const existing = vendorPricing.find((vp) => vp.vendor_id === vendorId && vp.size_id === sizeId);
    
    if (cost === null || isNaN(cost)) {
      if (existing) {
        await supabase.from('vendor_pricing').delete().eq('id', existing.id);
      }
    } else if (existing) {
      await supabase.from('vendor_pricing').update({ cost }).eq('id', existing.id);
    } else {
      await supabase.from('vendor_pricing').insert([{
        vendor_id: vendorId,
        size_id: sizeId,
        cost,
      }]);
    }
    
    fetchData();
  }

  const selectedVendorData = vendors.find((v) => v.id === selectedVendor);
  const selectedVendorZones = vendorZones.filter((vz) => vz.vendor_id === selectedVendor);
  const selectedVendorPricing = vendorPricing.filter((vp) => vp.vendor_id === selectedVendor);

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
          <h1 className="text-2xl font-bold text-foreground">Vendors & Partners</h1>
          <p className="text-muted-foreground">Manage hauler partners and their service zones</p>
        </div>
        <Button onClick={() => setIsAddingVendor(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Add/Edit Vendor Dialog */}
      <Dialog open={isAddingVendor || !!editingVendor} onOpenChange={(open) => {
        if (!open) {
          setIsAddingVendor(false);
          setEditingVendor(null);
          setVendorForm({
            name: '',
            contact_name: '',
            contact_email: '',
            contact_phone: '',
            notes: '',
            is_active: true,
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Vendor Name *"
              value={vendorForm.name}
              onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
            />
            <Input
              placeholder="Contact Name"
              value={vendorForm.contact_name}
              onChange={(e) => setVendorForm({ ...vendorForm, contact_name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="email"
                placeholder="Email"
                value={vendorForm.contact_email}
                onChange={(e) => setVendorForm({ ...vendorForm, contact_email: e.target.value })}
              />
              <Input
                type="tel"
                placeholder="Phone"
                value={vendorForm.contact_phone}
                onChange={(e) => setVendorForm({ ...vendorForm, contact_phone: e.target.value })}
              />
            </div>
            <Textarea
              placeholder="Notes"
              value={vendorForm.notes}
              onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={vendorForm.is_active}
                onCheckedChange={(v) => setVendorForm({ ...vendorForm, is_active: v })}
              />
              <span className="text-sm">Active</span>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setIsAddingVendor(false);
                setEditingVendor(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveVendor} disabled={!vendorForm.name}>
                {editingVendor ? 'Update' : 'Add'} Vendor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vendors List */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Vendors ({vendors.length})</h2>
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-auto">
            {vendors.map((vendor) => {
              const vZones = vendorZones.filter((vz) => vz.vendor_id === vendor.id);
              return (
                <div
                  key={vendor.id}
                  className={cn(
                    'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                    selectedVendor === vendor.id && 'bg-primary/10'
                  )}
                  onClick={() => setSelectedVendor(vendor.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{vendor.name}</h3>
                      {vendor.contact_name && (
                        <p className="text-sm text-muted-foreground">{vendor.contact_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {vZones.length} zone{vZones.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        vendor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      )}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingVendor(vendor.id);
                            setVendorForm({
                              name: vendor.name,
                              contact_name: vendor.contact_name || '',
                              contact_email: vendor.contact_email || '',
                              contact_phone: vendor.contact_phone || '',
                              notes: vendor.notes || '',
                              is_active: vendor.is_active,
                            });
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteVendor(vendor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {vendors.length === 0 && (
              <p className="p-8 text-center text-muted-foreground">No vendors yet</p>
            )}
          </div>
        </div>

        {/* Vendor Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedVendorData ? (
            <>
              {/* Vendor Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">{selectedVendorData.name}</h2>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <p className="font-medium">{selectedVendorData.contact_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedVendorData.contact_email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedVendorData.contact_phone || '-'}</p>
                  </div>
                </div>
                {selectedVendorData.notes && (
                  <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                    {selectedVendorData.notes}
                  </p>
                )}
              </div>

              {/* Service Zones */}
              <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Service Zones</h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {zones.map((zone) => {
                    const isAssigned = selectedVendorZones.some((vz) => vz.zone_id === zone.id);
                    return (
                      <button
                        key={zone.id}
                        onClick={() => handleToggleZone(selectedVendor!, zone.id, isAssigned)}
                        className={cn(
                          'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                          isAssigned
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                        )}
                      >
                        {zone.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vendor Pricing */}
              <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Cost to Company</h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sizes.map((size) => {
                    const pricing = selectedVendorPricing.find((vp) => vp.size_id === size.id);
                    return (
                      <div key={size.id} className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{size.label}</label>
                        <Input
                          type="number"
                          placeholder="Cost"
                          value={pricing?.cost ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : null;
                            handlePricingChange(selectedVendor!, size.id, val);
                          }}
                          className="text-right"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
              Select a vendor to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
