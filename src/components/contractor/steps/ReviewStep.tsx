import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText } from 'lucide-react';
import type { ContractorFormData } from '../ContractorApplicationTypes';

interface Props {
  data: ContractorFormData;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="text-sm text-muted-foreground space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | boolean | null }) {
  if (!value && value !== false) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
      </span>
    </div>
  );
}

export function ReviewStep({ data }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium text-sm">Review your application before submitting</span>
      </div>

      <Section title="Company Information">
        <Row label="Legal Name" value={data.legal_business_name} />
        <Row label="DBA" value={data.dba_name} />
        <Row label="Contact" value={data.contact_name} />
        <Row label="Role" value={data.role_title} />
        <Row label="Phone" value={data.phone} />
        <Row label="Email" value={data.email} />
        <Row label="Website" value={data.website} />
        <Row label="Address" value={`${data.business_address}, ${data.city}, ${data.state} ${data.zip}`} />
      </Section>

      <Section title="Contractor Profile">
        <Row label="Type" value={data.contractor_type} />
        <Row label="License #" value={data.license_number} />
        <Row label="Insured" value={data.is_insured} />
        <Row label="Years in Business" value={data.years_in_business} />
        <Row label="Service Area" value={data.service_area} />
        <Row label="Project Type" value={data.typical_project_type} />
        <Row label="Active Projects" value={data.current_active_projects} />
        <Row label="Avg Project Size" value={data.average_project_size} />
      </Section>

      <Section title="Service Needs">
        <Row label="Service Interest" value={data.service_line_interest} />
        <Row label="Dumpster Usage/mo" value={data.monthly_dumpster_usage_estimate} />
        <Row label="Cleanup Usage/mo" value={data.monthly_cleanup_usage_estimate} />
        <Row label="Recurring Interest" value={data.recurring_service_interest} />
        <Row label="Cleanup Frequency" value={data.preferred_cleanup_frequency} />
        <Row label="Priority Service" value={data.need_priority_service} />
        <Row label="Net Terms" value={data.need_net_terms} />
        {data.common_dumpster_sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.common_dumpster_sizes.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
          </div>
        )}
        {data.common_materials.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.common_materials.map(m => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}
          </div>
        )}
        <Row label="Required Dump Sites" value={data.required_dump_sites} />
        <Row label="Notes" value={data.notes} />
      </Section>

      <Section title="Documents">
        {data.uploadedFiles.length === 0 ? (
          <p className="text-muted-foreground text-xs italic">No documents uploaded</p>
        ) : (
          data.uploadedFiles.map(f => (
            <div key={f.path} className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{f.name}</span>
              <Badge variant="secondary" className="text-[10px]">{f.category}</Badge>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}
