import { useState } from 'react';
import { MapPin, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLeadAddresses, LeadAddress } from '@/hooks/useLeadAddresses';

interface Props {
  leadId: string;
}

export function LeadAddressManager({ leadId }: Props) {
  const { addresses, loading, addAddress, deleteAddress } = useLeadAddresses(leadId);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: '', address_line: '', city: '', state: '', zip: '', notes: '', is_primary: false });

  const handleSave = async () => {
    if (!form.address_line.trim()) return;
    await addAddress(form);
    setForm({ label: '', address_line: '', city: '', state: '', zip: '', notes: '', is_primary: false });
    setShowAdd(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Addresses ({addresses.length})
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" /></div>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No addresses added yet</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{addr.label || 'Address'}</span>
                    {addr.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                  </div>
                  <p className="text-sm">{addr.address_line}</p>
                  <p className="text-xs text-muted-foreground">
                    {[addr.city, addr.state, addr.zip].filter(Boolean).join(', ') || '—'}
                  </p>
                  {addr.notes && <p className="text-xs text-muted-foreground mt-1">{addr.notes}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteAddress(addr.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Address</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input placeholder="e.g. Job Site, Office" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input placeholder="94612" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address Line *</Label>
                <Input placeholder="123 Main St" value={form.address_line} onChange={e => setForm({ ...form, address_line: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="Oakland" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input placeholder="CA" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input placeholder="Gate code, instructions..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.address_line.trim()}>Save Address</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface AddressesPopoverProps {
  addresses: LeadAddress[];
  leadZip?: string | null;
}

export function AddressesCell({ addresses, leadZip }: AddressesPopoverProps) {
  const [open, setOpen] = useState(false);
  
  if (addresses.length === 0) {
    return <span className="text-sm text-muted-foreground">{leadZip || 'n/a'}</span>;
  }

  const zips = [...new Set(addresses.map(a => a.zip).filter(Boolean))];
  const displayZip = zips.length > 0 ? zips.join(', ') : leadZip || 'n/a';

  return (
    <>
      <button
        className="text-sm text-primary underline-offset-2 hover:underline cursor-pointer flex items-center gap-1"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        <MapPin className="w-3 h-3" />
        {displayZip}
        {addresses.length > 1 && <Badge variant="secondary" className="text-[10px] ml-1">+{addresses.length}</Badge>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" onClick={e => e.stopPropagation()}>
          <DialogHeader><DialogTitle>Customer Addresses</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{addr.label || 'Address'}</span>
                  {addr.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                </div>
                <p className="text-sm">{addr.address_line}</p>
                <p className="text-xs text-muted-foreground">
                  {[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}
                </p>
                {addr.notes && <p className="text-xs text-muted-foreground mt-1 italic">{addr.notes}</p>}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
