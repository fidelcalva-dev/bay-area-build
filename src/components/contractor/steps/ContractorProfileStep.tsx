import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CONTRACTOR_TYPES, SERVICE_CITIES } from '../ContractorApplicationTypes';
import type { ContractorFormData } from '../ContractorApplicationTypes';

interface Props {
  data: ContractorFormData;
  onChange: (updates: Partial<ContractorFormData>) => void;
}

export function ContractorProfileStep({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Contractor Type *</Label>
        <Select value={data.contractor_type} onValueChange={v => onChange({ contractor_type: v })}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            {CONTRACTOR_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="license_number">License Number (optional)</Label>
          <Input id="license_number" value={data.license_number} onChange={e => onChange({ license_number: e.target.value })} placeholder="e.g., CSLB #123456" />
        </div>
        <div>
          <Label htmlFor="years_in_business">Years in Business *</Label>
          <Input id="years_in_business" type="number" value={data.years_in_business} onChange={e => onChange({ years_in_business: e.target.value })} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="is_insured" checked={data.is_insured} onCheckedChange={v => onChange({ is_insured: !!v })} />
        <Label htmlFor="is_insured" className="text-sm font-normal cursor-pointer">We carry general liability insurance</Label>
      </div>
      <div>
        <Label className="mb-2 block">Service Area (select cities)</Label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_CITIES.map(city => (
            <Badge
              key={city}
              variant={data.service_area?.includes(city) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                const current = data.service_area ? data.service_area.split(', ').filter(Boolean) : [];
                const next = current.includes(city) ? current.filter(c => c !== city) : [...current, city];
                onChange({ service_area: next.join(', ') });
              }}
            >
              {city}
            </Badge>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="typical_project_type">Typical Project Type</Label>
          <Input id="typical_project_type" value={data.typical_project_type} onChange={e => onChange({ typical_project_type: e.target.value })} placeholder="e.g., Residential Remodels" />
        </div>
        <div>
          <Label htmlFor="current_active_projects">Current Active Projects</Label>
          <Input id="current_active_projects" type="number" value={data.current_active_projects} onChange={e => onChange({ current_active_projects: e.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="average_project_size">Average Project Size</Label>
        <Select value={data.average_project_size} onValueChange={v => onChange({ average_project_size: v })}>
          <SelectTrigger><SelectValue placeholder="Select size range" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (under $50K)</SelectItem>
            <SelectItem value="medium">Medium ($50K–$250K)</SelectItem>
            <SelectItem value="large">Large ($250K–$1M)</SelectItem>
            <SelectItem value="enterprise">Enterprise ($1M+)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
