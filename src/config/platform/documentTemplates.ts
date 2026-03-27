// =====================================================
// Document Template Registry (Multi-Tenant)
// =====================================================

export const DOCUMENT_TEMPLATE_CODES = {
  MSA_CLEANUP_STD: 'MSA_CLEANUP_STD',
  SERVICE_ADDENDUM_STD: 'SERVICE_ADDENDUM_STD',
  SOW_CLEANUP_STD: 'SOW_CLEANUP_STD',
  QUOTE_PROPOSAL_STD: 'QUOTE_PROPOSAL_STD',
  CHANGE_ORDER_STD: 'CHANGE_ORDER_STD',
  PAYMENT_TERMS_NET7: 'PAYMENT_TERMS_NET7',
  RECURRING_SERVICE_AGREEMENT_STD: 'RECURRING_SERVICE_AGREEMENT_STD',
  JOB_COMPLETION_REPORT_STD: 'JOB_COMPLETION_REPORT_STD',
  // Legacy dumpster templates (separate brand)
  MSA_DUMPSTER_STD: 'MSA_DUMPSTER_STD',
} as const;

export type DocumentTemplateCode = keyof typeof DOCUMENT_TEMPLATE_CODES;

export interface DocumentTemplateDefinition {
  code: string;
  name: string;
  description: string;
  service_scope: string[]; // Which service_codes can use this template
  merge_tags: string[];
}

export const DOCUMENT_TEMPLATE_DEFINITIONS: DocumentTemplateDefinition[] = [
  {
    code: 'MSA_CLEANUP_STD',
    name: 'Master Service Agreement — Cleanup',
    description: 'Standard MSA for C&D waste removal and construction cleanup services',
    service_scope: ['CONSTRUCTION_CLEANUP', 'POST_CONSTRUCTION_CLEANUP', 'DEMOLITION_SUPPORT'],
    merge_tags: ['{{company_name}}', '{{client_name}}', '{{client_address}}', '{{license_number}}', '{{effective_date}}', '{{scope_of_work}}', '{{payment_terms}}'],
  },
  {
    code: 'SERVICE_ADDENDUM_STD',
    name: 'Service Addendum',
    description: 'Site-specific addendum inheriting MSA terms',
    service_scope: ['SITE_CLEANUP', 'MATERIAL_PICKUP', 'LABOR_ASSISTED_CLEANUP'],
    merge_tags: ['{{company_name}}', '{{client_name}}', '{{site_address}}', '{{service_description}}', '{{price}}', '{{schedule}}'],
  },
  {
    code: 'SOW_CLEANUP_STD',
    name: 'Scope of Work — Cleanup',
    description: 'Detailed scope document for cleanup projects',
    service_scope: ['CONSTRUCTION_CLEANUP', 'POST_CONSTRUCTION_CLEANUP', 'DEMOLITION_SUPPORT'],
    merge_tags: ['{{company_name}}', '{{project_name}}', '{{site_address}}', '{{sqft}}', '{{debris_types}}', '{{crew_size}}', '{{estimated_hours}}', '{{disposal_method}}'],
  },
  {
    code: 'QUOTE_PROPOSAL_STD',
    name: 'Quote Proposal',
    description: 'Standard customer-facing quote/proposal document',
    service_scope: ['CONSTRUCTION_CLEANUP', 'POST_CONSTRUCTION_CLEANUP', 'DEMOLITION_SUPPORT', 'SITE_CLEANUP', 'MATERIAL_PICKUP', 'LABOR_ASSISTED_CLEANUP'],
    merge_tags: ['{{company_name}}', '{{client_name}}', '{{service_name}}', '{{line_items}}', '{{subtotal}}', '{{surcharges}}', '{{total}}', '{{valid_until}}'],
  },
  {
    code: 'CHANGE_ORDER_STD',
    name: 'Change Order',
    description: 'Change order for scope or pricing modifications',
    service_scope: ['CONSTRUCTION_CLEANUP', 'POST_CONSTRUCTION_CLEANUP', 'DEMOLITION_SUPPORT'],
    merge_tags: ['{{company_name}}', '{{original_quote_ref}}', '{{change_description}}', '{{price_adjustment}}', '{{new_total}}'],
  },
  {
    code: 'PAYMENT_TERMS_NET7',
    name: 'Payment Terms — Net 7',
    description: 'Standard Net 7 payment terms document',
    service_scope: ['CONSTRUCTION_CLEANUP', 'POST_CONSTRUCTION_CLEANUP', 'DEMOLITION_SUPPORT', 'RECURRING_SITE_SERVICE'],
    merge_tags: ['{{company_name}}', '{{client_name}}', '{{invoice_amount}}', '{{due_date}}'],
  },
  {
    code: 'RECURRING_SERVICE_AGREEMENT_STD',
    name: 'Recurring Service Agreement',
    description: 'Agreement for ongoing/recurring cleanup services',
    service_scope: ['RECURRING_SITE_SERVICE'],
    merge_tags: ['{{company_name}}', '{{client_name}}', '{{site_address}}', '{{frequency}}', '{{monthly_rate}}', '{{start_date}}', '{{term_months}}'],
  },
  {
    code: 'JOB_COMPLETION_REPORT_STD',
    name: 'Job Completion Report',
    description: 'Post-job completion report with photos and sign-off',
    service_scope: ['CONSTRUCTION_CLEANUP', 'POST_CONSTRUCTION_CLEANUP', 'DEMOLITION_SUPPORT', 'SITE_CLEANUP'],
    merge_tags: ['{{company_name}}', '{{job_ref}}', '{{site_address}}', '{{completion_date}}', '{{crew_lead}}', '{{hours_worked}}', '{{disposal_summary}}', '{{client_signature}}'],
  },
];
