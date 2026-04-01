import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ContractorFormData } from '../ContractorApplicationTypes';

interface Props {
  data: ContractorFormData;
  onChange: (updates: Partial<ContractorFormData>) => void;
}

export function CompanyInfoStep({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="legal_business_name">Legal Business Name *</Label>
          <Input id="legal_business_name" value={data.legal_business_name} onChange={e => onChange({ legal_business_name: e.target.value })} required placeholder="ABC Construction Inc." />
        </div>
        <div>
          <Label htmlFor="dba_name">DBA / Trade Name</Label>
          <Input id="dba_name" value={data.dba_name} onChange={e => onChange({ dba_name: e.target.value })} placeholder="Optional" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_name">Primary Contact Name *</Label>
          <Input id="contact_name" value={data.contact_name} onChange={e => onChange({ contact_name: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="role_title">Role / Title</Label>
          <Input id="role_title" value={data.role_title} onChange={e => onChange({ role_title: e.target.value })} placeholder="e.g., Project Manager" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" type="tel" value={data.phone} onChange={e => onChange({ phone: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={data.email} onChange={e => onChange({ email: e.target.value })} required />
        </div>
      </div>
      <div>
        <Label htmlFor="website">Website (optional)</Label>
        <Input id="website" value={data.website} onChange={e => onChange({ website: e.target.value })} placeholder="https://..." />
      </div>
      <div>
        <Label htmlFor="business_address">Business Address *</Label>
        <Input id="business_address" value={data.business_address} onChange={e => onChange({ business_address: e.target.value })} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" value={data.city} onChange={e => onChange({ city: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" value={data.state} onChange={e => onChange({ state: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="zip">ZIP *</Label>
          <Input id="zip" value={data.zip} onChange={e => onChange({ zip: e.target.value })} required />
        </div>
      </div>
    </div>
  );
}
