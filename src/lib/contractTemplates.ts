/**
 * Contract Templates - MSA and Service Addendum
 * Supports Residential, Contractor, and Commercial templates
 */

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

// Build addendum terms content based on template type
export function buildAddendumTerms(
  type: AddendumTemplateType,
  data: AddendumTemplateData
): string {
  const baseTerms = `
SERVICE ADDENDUM

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

  const residentialTerms = `
${baseTerms}

RESIDENTIAL SERVICE TERMS

1. PLACEMENT & ACCESS
The dumpster will be placed at the agreed location on your property. You are responsible for ensuring clear access for delivery and pickup. Driveway placement may be available upon request.

2. PERMITTED MATERIALS
General household debris, construction materials, yard waste, and furniture are accepted. Hazardous materials, electronics, tires, mattresses, and appliances with refrigerants may incur additional fees or be refused.

3. WEIGHT & OVERAGE
Your rental includes the specified tonnage allowance. Overages are billed at the prevailing rate based on official scale tickets. Final weight determines final billing.

4. RENTAL PERIOD
The rental period begins at delivery. Extensions may be available at a daily rate. Contact us to extend before your scheduled pickup.

5. CUSTOMER RESPONSIBILITY
Do not overfill the dumpster above the fill line. Overfilled or hazardous loads may incur additional fees or require re-handling.

6. STREET PLACEMENT
If the dumpster is placed on a public street, you are responsible for obtaining any required permits from your local municipality.

By signing, you agree to these terms and authorize CalSan Dumpsters to provide service at this location.
`;

  const contractorTerms = `
${baseTerms}

CONTRACTOR SERVICE ADDENDUM

1. SITE RESPONSIBILITY
Contractor is responsible for safe and accessible placement on the job site. CalSan is not liable for damage caused by site conditions or third parties.

2. MATERIAL COMPLIANCE
All materials must comply with disposal facility requirements. Mixed loads containing hazardous or prohibited materials may be refused, reclassified, or incur surcharges.

3. WEIGHT-BASED BILLING
Final billing is based on official scale tickets. Overages beyond the included tonnage are billed at the agreed rate per ton.

4. JOB SITE SCHEDULING
Delivery and pickup times are estimates. Contractor must ensure site access during scheduled windows. Dry run fees apply if the truck cannot access the site.

5. MULTIPLE HAULS
For high-volume projects, swaps and multiple hauls are available. Contact dispatch to schedule additional service.

6. PERMIT RESPONSIBILITY
Contractor is responsible for all permits required for dumpster placement, including street and ROW permits.

7. INSURANCE & LIABILITY
Contractor maintains their own liability insurance. CalSan is not responsible for site damage, theft, or injury arising from dumpster use.

By signing, contractor agrees to these terms for all service at this location.
`;

  const commercialTerms = `
${baseTerms}

COMMERCIAL SERVICE ADDENDUM

1. COMMERCIAL SERVICE AGREEMENT
This addendum governs dumpster rental services at the specified commercial location and is subject to the Master Service Agreement.

2. BILLING & PAYMENT
Commercial accounts are billed per service or on an agreed schedule. Net 30 terms may be available for qualified accounts. Late payments may result in service suspension.

3. SERVICE SCHEDULE
Regular service schedules can be arranged. Contact your account manager for recurring service options.

4. COMPLIANCE
All materials must comply with local, state, and federal disposal regulations. Hazardous materials are prohibited without prior arrangement.

5. ACCESS & SAFETY
Commercial site must maintain safe access for service vehicles. Loading dock or designated staging area is required for efficient service.

6. INSURANCE REQUIREMENTS
Commercial customers must maintain adequate liability insurance. Proof of insurance may be required upon request.

7. ENVIRONMENTAL COMPLIANCE
Customer is responsible for ensuring all disposed materials comply with environmental regulations. Recycling and diversion options are available.

8. INDEMNIFICATION
Customer agrees to indemnify CalSan Dumpsters against claims arising from improper material disposal or site conditions.

By signing, the authorized representative agrees to these commercial service terms.
`;

  switch (type) {
    case 'contractor':
      return contractorTerms.trim();
    case 'commercial':
      return commercialTerms.trim();
    default:
      return residentialTerms.trim();
  }
}

// Build MSA terms content
export function buildMSATerms(data: { 
  customerName: string; 
  companyName?: string;
  customerPhone: string;
  customerEmail?: string;
}): string {
  return `
MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is entered into by CalSan Dumpsters ("Company") and the Customer identified below.

CUSTOMER INFORMATION
Name: ${data.customerName}
${data.companyName ? `Company: ${data.companyName}` : ''}
Phone: ${data.customerPhone}
${data.customerEmail ? `Email: ${data.customerEmail}` : ''}

1. SCOPE OF SERVICES
Company agrees to provide dumpster rental and waste hauling services as requested by Customer. Individual services are governed by this Agreement and any applicable Service Addendums.

2. PRICING & PAYMENT
Pricing is quoted per service based on dumpster size, material type, location, and duration. Payment is due before or at time of service unless credit terms are established. Post-service charges, including tonnage overages, are billed after disposal.

3. CUSTOMER RESPONSIBILITIES
Customer agrees to:
- Provide accurate service location and contact information
- Ensure safe access for delivery and pickup
- Dispose only of permitted materials
- Not overfill dumpsters above the marked fill line
- Obtain any required permits for street placement
- Pay all invoices in accordance with agreed terms

4. PROHIBITED MATERIALS
Hazardous materials, chemicals, liquids, asbestos, medical waste, and other regulated materials are prohibited without prior written approval and special handling arrangements.

5. WEIGHT & OVERAGE BILLING
Final billing is based on official scale tickets. Overages beyond included tonnage are charged at the rate specified in the quote or addendum.

6. LIABILITY & INDEMNIFICATION
Customer agrees to indemnify and hold Company harmless from claims arising from:
- Improper material disposal
- Site conditions causing damage or injury
- Failure to obtain required permits
- Third-party claims related to Customer's use of services

7. SERVICE ADDENDUMS
Individual services may require a Service Addendum specifying site-specific terms, especially for new service locations, street placement, or commercial compliance requirements.

8. TERM & TERMINATION
This Agreement remains in effect for one year from signing and automatically renews unless terminated by either party with 30 days written notice.

9. DISPUTE RESOLUTION
Any disputes shall be resolved through good faith negotiation. If unresolved, disputes shall be subject to binding arbitration in accordance with California law.

10. GOVERNING LAW
This Agreement is governed by the laws of the State of California.

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

  // New address always requires addendum
  if (isNewAddress) {
    return { required: true, reason: 'New service address requires addendum' };
  }

  // Street placement requires addendum
  if (placementType === 'street' || placementType === 'public_row') {
    return { required: true, reason: 'Street placement requires addendum' };
  }

  // Commercial compliance requires addendum
  if (customerType === 'commercial') {
    return { required: true, reason: 'Commercial service requires addendum' };
  }

  // Custom service requires addendum
  if (hasCustomService) {
    return { required: true, reason: 'Custom service terms require addendum' };
  }

  return { required: false, reason: '' };
}
