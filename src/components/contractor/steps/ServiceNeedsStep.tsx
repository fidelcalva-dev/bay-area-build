import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DUMPSTER_SIZES, MATERIAL_OPTIONS, CLEANUP_FREQUENCIES } from '../ContractorApplicationTypes';
import type { ContractorFormData } from '../ContractorApplicationTypes';

interface Props {
  data: ContractorFormData;
  onChange: (updates: Partial<ContractorFormData>) => void;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
}

export function ServiceNeedsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <Label>Service Line Interest *</Label>
        <Select value={data.service_line_interest} onValueChange={(v: 'DUMPSTER' | 'CLEANUP' | 'BOTH') => onChange({ service_line_interest: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DUMPSTER">Dumpster Rental</SelectItem>
            <SelectItem value="CLEANUP">Construction Cleanup</SelectItem>
            <SelectItem value="BOTH">Both — Dumpster + Cleanup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(data.service_line_interest === 'DUMPSTER' || data.service_line_interest === 'BOTH') && (
        <>
          <div>
            <Label>Monthly Dumpster Usage Estimate</Label>
            <Select value={data.monthly_dumpster_usage_estimate} onValueChange={v => onChange({ monthly_dumpster_usage_estimate: v })}>
              <SelectTrigger><SelectValue placeholder="How many per month?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3">1–3 per month</SelectItem>
                <SelectItem value="4-10">4–10 per month</SelectItem>
                <SelectItem value="11-25">11–25 per month</SelectItem>
                <SelectItem value="25+">25+ per month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Common Dumpster Sizes</Label>
            <div className="flex flex-wrap gap-2">
              {DUMPSTER_SIZES.map(s => (
                <Badge key={s} variant={data.common_dumpster_sizes.includes(s) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => onChange({ common_dumpster_sizes: toggleItem(data.common_dumpster_sizes, s) })}>
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Common Materials</Label>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_OPTIONS.map(m => (
                <Badge key={m} variant={data.common_materials.includes(m) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => onChange({ common_materials: toggleItem(data.common_materials, m) })}>
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {(data.service_line_interest === 'CLEANUP' || data.service_line_interest === 'BOTH') && (
        <>
          <div>
            <Label>Monthly Cleanup Usage Estimate</Label>
            <Select value={data.monthly_cleanup_usage_estimate} onValueChange={v => onChange({ monthly_cleanup_usage_estimate: v })}>
              <SelectTrigger><SelectValue placeholder="How many per month?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1–2 per month</SelectItem>
                <SelectItem value="3-5">3–5 per month</SelectItem>
                <SelectItem value="6-10">6–10 per month</SelectItem>
                <SelectItem value="10+">10+ per month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Preferred Cleanup Frequency</Label>
            <Select value={data.preferred_cleanup_frequency} onValueChange={v => onChange({ preferred_cleanup_frequency: v })}>
              <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent>
                {CLEANUP_FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <Checkbox id="recurring" checked={data.recurring_service_interest} onCheckedChange={v => onChange({ recurring_service_interest: !!v })} />
        <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">Interested in recurring/scheduled service</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="priority" checked={data.need_priority_service} onCheckedChange={v => onChange({ need_priority_service: !!v })} />
        <Label htmlFor="priority" className="text-sm font-normal cursor-pointer">Need priority / same-day service</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="net_terms" checked={data.need_net_terms} onCheckedChange={v => onChange({ need_net_terms: !!v })} />
        <Label htmlFor="net_terms" className="text-sm font-normal cursor-pointer">Requesting net terms (Net 15/30)</Label>
      </div>
      <div>
        <Label htmlFor="required_dump_sites">Required Dump Sites (optional)</Label>
        <Input id="required_dump_sites" value={data.required_dump_sites} onChange={e => onChange({ required_dump_sites: e.target.value })} placeholder="e.g., Zanker Recycling, Guadalupe Landfill" />
      </div>
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea id="notes" value={data.notes} onChange={e => onChange({ notes: e.target.value })} rows={3} placeholder="Anything else about your needs?" />
      </div>
    </div>
  );
}
