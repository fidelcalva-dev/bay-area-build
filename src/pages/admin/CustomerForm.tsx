import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Save, FileText, MapPin, StickyNote,
  Send, CreditCard, Plus, AlertTriangle, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Alert, AlertDescription,
} from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CUSTOMER_TYPES = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'broker', label: 'Broker' },
];

const PREFERRED_CONTACT = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS / Text' },
];

interface DuplicateWarning {
  field: string;
  matches: Array<{ id: string; company_name: string | null; contact_name: string | null }>;
}

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateWarning[]>([]);

  // Form state
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceCity, setServiceCity] = useState('');
  const [serviceZip, setServiceZip] = useState('');
  const [customerType, setCustomerType] = useState('homeowner');
  const [preferredContact, setPreferredContact] = useState('phone');
  const [assignedRep, setAssignedRep] = useState('');
  const [notes, setNotes] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [permitNotes, setPermitNotes] = useState('');

  // Load existing customer for edit mode
  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        toast({ title: 'Customer not found', variant: 'destructive' });
        navigate('/admin/customers');
        return;
      }
      setContactName(data.contact_name || '');
      setCompanyName(data.company_name || '');
      setPhone(data.phone || '');
      setBillingEmail(data.billing_email || '');
      setBillingPhone(data.billing_phone || '');
      setBillingAddress(data.billing_address || '');
      setCustomerType(data.customer_type || 'homeowner');
      setNotes(data.notes || '');
      setIsLoading(false);
    })();
  }, [id, isEdit, navigate, toast]);

  // Duplicate detection
  const checkDuplicates = useCallback(async () => {
    const warnings: DuplicateWarning[] = [];

    if (phone && phone.length >= 7) {
      const { data } = await supabase
        .from('customers')
        .select('id, company_name, contact_name')
        .eq('phone', phone)
        .neq('id', id || '00000000-0000-0000-0000-000000000000')
        .limit(3);
      if (data?.length) warnings.push({ field: 'Phone', matches: data });
    }

    if (billingEmail && billingEmail.includes('@')) {
      const { data } = await supabase
        .from('customers')
        .select('id, company_name, contact_name')
        .eq('billing_email', billingEmail)
        .neq('id', id || '00000000-0000-0000-0000-000000000000')
        .limit(3);
      if (data?.length) warnings.push({ field: 'Email', matches: data });
    }

    if (companyName && billingAddress && companyName.length > 2) {
      const { data } = await supabase
        .from('customers')
        .select('id, company_name, contact_name')
        .ilike('company_name', companyName)
        .ilike('billing_address', `%${billingAddress.slice(0, 20)}%`)
        .neq('id', id || '00000000-0000-0000-0000-000000000000')
        .limit(3);
      if (data?.length) warnings.push({ field: 'Company + Address', matches: data });
    }

    setDuplicates(warnings);
  }, [phone, billingEmail, companyName, billingAddress, id]);

  useEffect(() => {
    const timer = setTimeout(() => { checkDuplicates(); }, 600);
    return () => clearTimeout(timer);
  }, [checkDuplicates]);

  async function handleSave() {
    if (!contactName && !companyName) {
      toast({ title: 'Name or company required', variant: 'destructive' });
      return;
    }
    if (!phone && !billingEmail) {
      toast({ title: 'Phone or email required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const payload = {
      contact_name: contactName || null,
      company_name: companyName || null,
      phone: phone || null,
      billing_email: billingEmail || null,
      billing_phone: billingPhone || phone || null,
      billing_address: billingAddress || null,
      customer_type: customerType,
      notes: [notes, accessNotes && `ACCESS: ${accessNotes}`, permitNotes && `PERMIT: ${permitNotes}`].filter(Boolean).join('\n') || null,
    };

    if (isEdit && id) {
      const { error } = await supabase.from('customers').update(payload).eq('id', id);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Customer updated' });
        navigate(`/admin/customers/${id}`);
      }
    } else {
      const { data, error } = await supabase.from('customers').insert(payload).select('id').single();
      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      } else if (data) {
        toast({ title: 'Customer created' });
        navigate(`/admin/customers/${data.id}`);
      }
    }
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Customer' : 'New Customer'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update customer information' : 'Create a new customer record'}
          </p>
        </div>
      </div>

      {/* Duplicate Warnings */}
      {duplicates.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Possible duplicates detected:</p>
            {duplicates.map((d) => (
              <div key={d.field} className="mb-1">
                <span className="font-medium">{d.field}:</span>{' '}
                {d.matches.map((m) => (
                  <Link
                    key={m.id}
                    to={`/admin/customers/${m.id}`}
                    className="text-primary underline mr-2"
                  >
                    {m.contact_name || m.company_name || m.id.slice(0, 8)}
                  </Link>
                ))}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="grid gap-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Full Name</Label>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Construction" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(510) 555-0123" type="tel" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="john@example.com" type="email" />
            </div>
            <div>
              <Label>Customer Type</Label>
              <Select value={customerType} onValueChange={setCustomerType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preferred Contact</Label>
              <Select value={preferredContact} onValueChange={setPreferredContact}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PREFERRED_CONTACT.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Billing / Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Billing & Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Billing Address</Label>
              <Input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="123 Main St, Oakland, CA 94601" />
            </div>
            <div>
              <Label>Billing Phone (if different)</Label>
              <Input value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} placeholder="Same as primary if empty" />
            </div>
          </CardContent>
        </Card>

        {/* Service / Property Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Service / Property Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Street Address</Label>
              <Input value={serviceAddress} onChange={(e) => setServiceAddress(e.target.value)} placeholder="456 Job Site Rd" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={serviceCity} onChange={(e) => setServiceCity(e.target.value)} placeholder="Oakland" />
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input value={serviceZip} onChange={(e) => setServiceZip(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="94601" inputMode="numeric" />
            </div>
            <div>
              <Label>Assigned Rep</Label>
              <Input value={assignedRep} onChange={(e) => setAssignedRep(e.target.value)} placeholder="Rep name" />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <StickyNote className="w-4 h-4" /> Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Service notes, access instructions, permit details..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {isEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>

        {/* Quick Actions (only on edit) */}
        {isEdit && id && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/sales/quotes/new?customerId=${id}`}>
                  <FileText className="w-4 h-4 mr-1" /> Create Quote
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/customers/${id}?tab=sites`}>
                  <MapPin className="w-4 h-4 mr-1" /> Add Site
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/customers/${id}?tab=overview`}>
                  <StickyNote className="w-4 h-4 mr-1" /> Open Timeline
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
