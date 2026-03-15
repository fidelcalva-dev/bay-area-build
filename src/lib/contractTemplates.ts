/**
 * Contract Templates — MSA, Service Addendum, and Quote Contract
 * Uses canonical policy language from policyLanguage.ts
 * 
 * Version tracking: templates reference POLICY_VERSION and CONTRACT_VERSION
 * so older accepted contracts preserve their version.
 */

import {
  POLICY_VERSION,
  CONTRACT_VERSION,
  ADDENDUM_VERSION,
  HEAVY_MATERIAL_NOTICE,
  CONTAMINATION_NOTICE,
  MISDECLARED_REROUTE_NOTICE,
  OVERAGE_NOTICE,
  FILL_LINE_NOTICE,
  PLACEMENT_PERMIT_NOTICE,
  DRY_RUN_NOTICE,
  EXTRA_DAY_NOTICE,
  PAYMENT_TERMS_NOTICE,
  PROHIBITED_MATERIALS_NOTICE,
  ESIGN_CONSENT,
  LIABILITY_NOTICE,
  INDEMNIFICATION_NOTICE,
  GOVERNING_LAW_NOTICE,
  PHOTO_DOCUMENTATION_NOTICE,
} from './policyLanguage';

export type AddendumTemplateType = 'residential' | 'contractor' | 'commercial';

export interface AddendumTemplateData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName?: string;
  serviceAddress: string;
  dumpsterSize: string;
  materialType: string;
  rentalDays: number;
  deliveryDate?: string;
  deliveryWindow?: string;
  replacementValue?: number;
}

// Determine template type based on customer type
export function getAddendumTemplateType(customerType: string): AddendumTemplateType {
  switch (customerType?.toLowerCase()) {
    case 'contractor':
    case 'broker':
      return 'contractor';
    case 'commercial':
    case 'business':
      return 'commercial';
    default:
      return 'residential';
  }
}

// Template label for UI
export function getAddendumTemplateLabel(type: AddendumTemplateType): string {
  switch (type) {
    case 'contractor':
      return 'Contractor Service Addendum';
    case 'commercial':
      return 'Commercial Service Addendum';
    default:
      return 'Residential Service Addendum';
  }
}

function buildServiceHeader(data: AddendumTemplateData): string {
  return `
Customer: ${data.customerName}
${data.companyName ? `Company: ${data.companyName}` : ''}
Phone: ${data.customerPhone}
${data.customerEmail ? `Email: ${data.customerEmail}` : ''}

SERVICE LOCATION
${data.serviceAddress}

SERVICE DETAILS
Dumpster Size: ${data.dumpsterSize}
Material Type: ${data.materialType}
Rental Period: ${data.rentalDays} days
${data.deliveryDate ? `Delivery Date: ${data.deliveryDate}` : ''}
${data.deliveryWindow ? `Time Window: ${data.deliveryWindow}` : ''}
`.trim();
}

// Build addendum terms content based on template type
export function buildAddendumTerms(
  type: AddendumTemplateType,
  data: AddendumTemplateData
): string {
  const header = buildServiceHeader(data);

  const commonClauses = `
TERMS INHERITED FROM MASTER SERVICE AGREEMENT
This Service Addendum is subject to and governed by the Master Service Agreement ("MSA") between the parties. In the event of any conflict, the terms of this Addendum prevail for this specific service location.

PLACEMENT & ACCESS
${PLACEMENT_PERMIT_NOTICE.en}

PERMITTED & PROHIBITED MATERIALS
${PROHIBITED_MATERIALS_NOTICE.en}

WEIGHT & OVERAGE
${OVERAGE_NOTICE.en}

HEAVY MATERIAL RULES
${HEAVY_MATERIAL_NOTICE.en}

CONTAMINATION & RECLASSIFICATION
${CONTAMINATION_NOTICE.en}

MISDECLARED MATERIALS
${MISDECLARED_REROUTE_NOTICE.en}

FILL LINE
${FILL_LINE_NOTICE.en}

RENTAL PERIOD
${EXTRA_DAY_NOTICE.en}

DRY RUNS & BLOCKED ACCESS
${DRY_RUN_NOTICE.en}

PHOTO DOCUMENTATION
${PHOTO_DOCUMENTATION_NOTICE.en}
`.trim();

  const residentialFooter = `
By signing, you agree to these terms and authorize Calsan Dumpsters Pro to provide service at this location.`;

  const contractorFooter = `
CONTRACTOR-SPECIFIC TERMS
Contractor is responsible for safe and accessible placement on the job site. Calsan Dumpsters Pro is not liable for damage caused by site conditions or third parties. Contractor maintains their own liability insurance. For high-volume projects, swaps and multiple hauls are available — contact dispatch.

By signing, contractor agrees to these terms for all service at this location.`;

  const commercialFooter = `
COMMERCIAL-SPECIFIC TERMS
This addendum governs dumpster rental services at the specified commercial location. Commercial accounts are billed per service or on an agreed schedule. Net 30 terms may be available for qualified accounts. Commercial site must maintain safe access for service vehicles. Customer is responsible for ensuring all disposed materials comply with environmental regulations. Customer agrees to indemnify Calsan Dumpsters Pro against claims arising from improper material disposal or site conditions.

By signing, the authorized representative agrees to these commercial service terms.`;

  let footer: string;
  switch (type) {
    case 'contractor':
      footer = contractorFooter;
      break;
    case 'commercial':
      footer = commercialFooter;
      break;
    default:
      footer = residentialFooter;
  }

  return `SERVICE ADDENDUM
Addendum Version: ${ADDENDUM_VERSION}
Policy Version: ${POLICY_VERSION}

${header}

${commonClauses}
${footer}`.trim();
}

// Build MSA terms content
export function buildMSATerms(data: { 
  customerName: string; 
  companyName?: string;
  customerPhone: string;
  customerEmail?: string;
}): string {
  return `MASTER SERVICE AGREEMENT
Contract Version: ${CONTRACT_VERSION}
Policy Version: ${POLICY_VERSION}

This Master Service Agreement ("Agreement") is entered into by Calsan Dumpsters Pro ("Company") and the Customer identified below.

CUSTOMER INFORMATION
Name: ${data.customerName}
${data.companyName ? `Company: ${data.companyName}` : ''}
Phone: ${data.customerPhone}
${data.customerEmail ? `Email: ${data.customerEmail}` : ''}

1. SCOPE OF SERVICES
Company agrees to provide dumpster rental and waste hauling services as requested by Customer. Individual services are governed by this Agreement and any applicable Service Addendums for specific locations.

2. PRICING & PAYMENT
${PAYMENT_TERMS_NOTICE.en}

3. CUSTOMER RESPONSIBILITIES
Customer agrees to:
- Provide accurate service location and contact information
- Ensure safe access for delivery and pickup
- Dispose only of permitted materials
- Not overfill dumpsters above the marked fill line
- Obtain any required permits for street placement
- Pay all invoices in accordance with agreed terms

4. PROHIBITED MATERIALS
${PROHIBITED_MATERIALS_NOTICE.en}

5. HEAVY MATERIAL RULES
${HEAVY_MATERIAL_NOTICE.en}

6. CONTAMINATION & RECLASSIFICATION
${CONTAMINATION_NOTICE.en}

7. MISDECLARED MATERIALS & REROUTING
${MISDECLARED_REROUTE_NOTICE.en}

8. WEIGHT & OVERAGE BILLING
${OVERAGE_NOTICE.en}

9. FILL LINE COMPLIANCE
${FILL_LINE_NOTICE.en}

10. PLACEMENT & PERMITS
${PLACEMENT_PERMIT_NOTICE.en}

11. RENTAL PERIOD & EXTRA DAYS
${EXTRA_DAY_NOTICE.en}

12. DRY RUNS & BLOCKED ACCESS
${DRY_RUN_NOTICE.en}

13. PHOTO DOCUMENTATION
${PHOTO_DOCUMENTATION_NOTICE.en}

14. LIABILITY & INDEMNIFICATION
${LIABILITY_NOTICE.en}

${INDEMNIFICATION_NOTICE.en}

15. ELECTRONIC RECORDS & SIGNATURES
${ESIGN_CONSENT.en}

16. SERVICE ADDENDUMS
Individual services may require a Service Addendum specifying site-specific terms, especially for new service locations, street placement, or commercial compliance requirements. Addendums inherit all terms of this Agreement unless specifically modified.

17. TERM & TERMINATION
This Agreement remains in effect for one year from signing and automatically renews unless terminated by either party with 30 days written notice.

18. GOVERNING LAW & DISPUTES
${GOVERNING_LAW_NOTICE.en}

By signing, Customer acknowledges reading, understanding, and agreeing to these terms.

AGREEMENT VALID FOR ONE YEAR FROM DATE OF SIGNATURE
`.trim();
}

// Check if addendum is required based on order conditions
export function isAddendumRequired(params: {
  isNewAddress: boolean;
  placementType?: string;
  materialType?: string;
  customerType?: string;
  hasCustomService?: boolean;
}): { required: boolean; reason: string } {
  const { isNewAddress, placementType, customerType, hasCustomService } = params;

  if (isNewAddress) {
    return { required: true, reason: 'New service address requires addendum' };
  }

  if (placementType === 'street' || placementType === 'public_row') {
    return { required: true, reason: 'Street placement requires addendum' };
  }

  if (customerType === 'commercial') {
    return { required: true, reason: 'Commercial service requires addendum' };
  }

  if (hasCustomService) {
    return { required: true, reason: 'Custom service terms require addendum' };
  }

  return { required: false, reason: '' };
}
