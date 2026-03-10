import { useState } from 'react';
import { MapPin, Plus, Trash2, Lock, FileText, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CustomerSite } from './types';

interface Props {
  customerId: string;
  sites: CustomerSite[];
  billingAddress: string | null;
  onRefresh: () => void;
}

export function SitesTab({ customerId, sites, billingAddress, onRefresh }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    gate_code: '',
    placement_instructions: '',
    permit_notes: '',
  });

  const handleSave = async () => {
    if (!form.address.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('customer_sites').insert({
      customer_id: customerId,
      site_name: form.site_name || 'Service Site',
      address: form.address,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      gate_code: form.gate_code || null,
      placement_instructions: form.placement_instructions || null,
      permit_notes: form.permit_notes || null,
      is_primary: sites.length === 0,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving site', variant: 'destructive' });
    } else {
      toast({ title: 'Site added' });
      setOpen(false);
      setForm({ site_name: '', address: '', city: '', state: '', zip: '', gate_code: '', placement_instructions: '', permit_notes: '' });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('customer_sites').delete().eq('id', id);
    toast({ title: 'Site removed' });
    onRefresh();
  };

  // Include billing address as legacy site
  const legacySite = billingAddress ? {
    id: 'billing',
    site_name: 'Billing Address',
    address: billingAddress,
    is_primary: true,
    is_legacy: true,
  } : null;

  const allSites = [
    ...(legacySite ? [legacySite] : []),
    ...sites.map(s => ({ ...s, is_legacy: false })),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Service Sites</CardTitle>
            <CardDescription>All locations where this customer receives service</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Add Site</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add Service Site</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Site Name</Label>
                  <Input value={form.site_name} onChange={e => setForm(f => ({ ...f, site_name: e.target.value }))} placeholder="Main House, Job Site #2, etc." />
                </div>
                <div>
                  <Label>Address *</Label>
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                  </div>
                  <div>
                    <Label>ZIP</Label>
                    <Input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Gate Code</Label>
                  <Input value={form.gate_code} onChange={e => setForm(f => ({ ...f, gate_code: e.target.value }))} placeholder="e.g. #1234" />
                </div>
                <div>
                  <Label>Placement Instructions</Label>
                  <Textarea value={form.placement_instructions} onChange={e => setForm(f => ({ ...f, placement_instructions: e.target.value }))} placeholder="Place on driveway, left side..." rows={2} />
                </div>
                <div>
                  <Label>Permit Notes</Label>
                  <Textarea value={form.permit_notes} onChange={e => setForm(f => ({ ...f, permit_notes: e.target.value }))} placeholder="Permit required for street placement..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={saving || !form.address.trim()}>
                  {saving ? 'Saving...' : 'Save Site'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {allSites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No service sites recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allSites.map(site => (
              <div key={site.id} className="p-4 rounded-lg border space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{site.site_name}</p>
                        {site.is_primary && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        {site.is_legacy && <Badge variant="outline" className="text-xs">From billing</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{site.address}</p>
                    </div>
                  </div>
                  {!site.is_legacy && (
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(site.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {!site.is_legacy && 'gate_code' in site && (site as unknown as CustomerSite).gate_code && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-8">
                    <Lock className="w-3.5 h-3.5" />Gate: {(site as unknown as CustomerSite).gate_code}
                  </div>
                )}
                {!site.is_legacy && 'placement_instructions' in site && (site as unknown as CustomerSite).placement_instructions && (
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground ml-8">
                    <FileText className="w-3.5 h-3.5 mt-0.5" />{(site as unknown as CustomerSite).placement_instructions}
                  </div>
                )}
                {!site.is_legacy && 'permit_notes' in site && (site as unknown as CustomerSite).permit_notes && (
                  <div className="flex items-start gap-1.5 text-sm ml-8">
                    <Badge variant="outline" className="text-xs">Permit</Badge>
                    <span className="text-muted-foreground">{(site as unknown as CustomerSite).permit_notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
