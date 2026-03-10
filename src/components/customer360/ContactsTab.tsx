import { useState } from 'react';
import { Phone, Mail, User, Plus, Trash2, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CustomerContact } from './types';

interface Props {
  customerId: string;
  contacts: CustomerContact[];
  customerPhone: string | null;
  customerEmail: string | null;
  customerName: string | null;
  onRefresh: () => void;
}

const ROLES = ['primary', 'owner', 'project_manager', 'office', 'accounting', 'property_manager', 'site_contact', 'other'];

export function ContactsTab({ customerId, contacts, customerPhone, customerEmail, customerName, onRefresh }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    contact_name: '',
    contact_role: 'primary',
    phone: '',
    email: '',
    preferred_method: 'phone',
  });

  const handleSave = async () => {
    if (!form.contact_name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('customer_contacts').insert({
      customer_id: customerId,
      contact_name: form.contact_name,
      contact_role: form.contact_role,
      phone: form.phone || null,
      email: form.email || null,
      preferred_method: form.preferred_method,
      is_primary: contacts.length === 0,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving contact', variant: 'destructive' });
    } else {
      toast({ title: 'Contact added' });
      setOpen(false);
      setForm({ contact_name: '', contact_role: 'primary', phone: '', email: '', preferred_method: 'phone' });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('customer_contacts').delete().eq('id', id);
    toast({ title: 'Contact removed' });
    onRefresh();
  };

  // Build combined list: legacy customer-level contact + customer_contacts rows
  const legacyContact = (customerPhone || customerEmail || customerName) ? {
    id: 'legacy',
    contact_name: customerName || 'Primary Contact',
    contact_role: 'primary',
    phone: customerPhone,
    email: customerEmail,
    preferred_method: 'phone',
    is_primary: true,
    is_legacy: true,
  } : null;

  const allContacts = [
    ...(legacyContact ? [legacyContact] : []),
    ...contacts.map(c => ({ ...c, is_legacy: false })),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Contacts</CardTitle>
            <CardDescription>All contacts associated with this customer</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Add Contact</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="John Doe" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={form.contact_role} onValueChange={v => setForm(f => ({ ...f, contact_role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
                  </div>
                </div>
                <div>
                  <Label>Preferred Method</Label>
                  <Select value={form.preferred_method} onValueChange={v => setForm(f => ({ ...f, preferred_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={saving || !form.contact_name.trim()}>
                  {saving ? 'Saving...' : 'Save Contact'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {allContacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No contacts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allContacts.map(contact => (
              <div key={contact.id} className="flex items-start justify-between p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{contact.contact_name}</p>
                      {contact.is_primary && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      <Badge variant="secondary" className="text-xs">{contact.contact_role.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Phone className="w-3.5 h-3.5" />{contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Mail className="w-3.5 h-3.5" />{contact.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {!contact.is_legacy && (
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(contact.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
