import { supabase } from '@/integrations/supabase/client';
import { createAuditLog } from './auditLog';

export type ContractType = 'msa' | 'addendum';
export type ContractStatus = 'pending' | 'signed' | 'declined' | 'expired';

export interface Contract {
  id: string;
  customer_id: string;
  contract_type: ContractType;
  status: ContractStatus;
  service_address: string | null;
  service_address_normalized: string | null;
  contract_version: string;
  terms_content: string | null;
  signed_at: string | null;
  signed_ip: string | null;
  signature_method: string | null;
  pdf_url: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractRequirement {
  msaRequired: boolean;
  msaContract: Contract | null;
  addendumRequired: boolean;
  addendumContract: Contract | null;
  allSigned: boolean;
  blockers: string[];
}

/**
 * Normalize address for comparison
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Helper to query contracts table (since types aren't generated yet)
async function queryContracts() {
  // Use type assertion to bypass generated types until they're updated
  return (supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> }).from('contracts');
}

async function queryContractEvents() {
  return (supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> }).from('contract_events');
}

/**
 * Check if customer has a signed MSA
 */
export async function getCustomerMSA(customerId: string): Promise<Contract | null> {
  const contractsTable = await queryContracts();
  const { data } = await contractsTable
    .select('*')
    .eq('customer_id', customerId)
    .eq('contract_type', 'msa')
    .eq('status', 'signed')
    .order('signed_at', { ascending: false })
    .limit(1)
    .single();
  
  return data as Contract | null;
}

/**
 * Check if customer has a signed addendum for a specific address
 */
export async function getAddendumForAddress(
  customerId: string, 
  serviceAddress: string
): Promise<Contract | null> {
  const normalized = normalizeAddress(serviceAddress);
  const contractsTable = await queryContracts();
  
  const { data } = await contractsTable
    .select('*')
    .eq('customer_id', customerId)
    .eq('contract_type', 'addendum')
    .eq('status', 'signed')
    .eq('service_address_normalized', normalized)
    .limit(1)
    .single();
  
  return data as Contract | null;
}

/**
 * Get all contracts for a customer
 */
export async function getCustomerContracts(customerId: string): Promise<Contract[]> {
  const contractsTable = await queryContracts();
  const { data, error } = await contractsTable
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
  
  return (data || []) as Contract[];
}

/**
 * Check contract requirements for an order
 */
export async function checkContractRequirements(
  customerId: string,
  serviceAddress?: string
): Promise<ContractRequirement> {
  const blockers: string[] = [];
  
  // Check MSA
  const msaContract = await getCustomerMSA(customerId);
  const msaRequired = !msaContract;
  
  if (msaRequired) {
    blockers.push('Master Service Agreement signature required');
  }
  
  // Check Addendum (if address provided)
  let addendumRequired = false;
  let addendumContract: Contract | null = null;
  
  if (serviceAddress) {
    addendumContract = await getAddendumForAddress(customerId, serviceAddress);
    addendumRequired = !addendumContract;
    
    if (addendumRequired) {
      blockers.push('Service Addendum signature required for this address');
    }
  }
  
  return {
    msaRequired,
    msaContract,
    addendumRequired,
    addendumContract,
    allSigned: !msaRequired && !addendumRequired,
    blockers,
  };
}

/**
 * Create a new contract
 */
export async function createContract(params: {
  customerId: string;
  contractType: ContractType;
  serviceAddress?: string;
  termsContent?: string;
}): Promise<{ contract: Contract | null; error: string | null }> {
  const { customerId, contractType, serviceAddress, termsContent } = params;
  
  const insertData: Record<string, unknown> = {
    customer_id: customerId,
    contract_type: contractType,
    status: 'pending',
    terms_content: termsContent,
  };
  
  if (serviceAddress) {
    insertData.service_address = serviceAddress;
    insertData.service_address_normalized = normalizeAddress(serviceAddress);
  }
  
  // Set expiration for MSA (1 year)
  if (contractType === 'msa') {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    insertData.expires_at = expiresAt.toISOString();
  }
  
  const contractsTable = await queryContracts();
  const { data, error } = await contractsTable
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating contract:', error);
    return { contract: null, error: error.message };
  }
  
  const contract = data as Contract;
  
  // Log event
  const eventsTable = await queryContractEvents();
  await eventsTable.insert({
    contract_id: contract.id,
    event_type: 'created',
    metadata: { contract_type: contractType },
  });
  
  await createAuditLog({
    action: 'create',
    entityType: 'customer',
    entityId: customerId,
    changesSummary: `Created ${contractType.toUpperCase()} contract`,
  });
  
  return { contract, error: null };
}

/**
 * Sign a contract
 */
export async function signContract(
  contractId: string,
  signatureMethod: 'sms_link' | 'email_link' | 'in_person',
  ipAddress?: string
): Promise<{ success: boolean; error: string | null }> {
  const contractsTable = await queryContracts();
  const { data: contract, error: fetchError } = await contractsTable
    .select('*')
    .eq('id', contractId)
    .single();
  
  if (fetchError || !contract) {
    return { success: false, error: 'Contract not found' };
  }
  
  const contractData = contract as Contract;
  
  if (contractData.status === 'signed') {
    return { success: false, error: 'Contract already signed' };
  }
  
  const { error } = await contractsTable
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      signed_ip: ipAddress,
      signature_method: signatureMethod,
    })
    .eq('id', contractId);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  // Log event
  const eventsTable = await queryContractEvents();
  await eventsTable.insert({
    contract_id: contractId,
    event_type: 'signed',
    ip_address: ipAddress,
    metadata: { method: signatureMethod },
  });
  
  await createAuditLog({
    action: 'status_change',
    entityType: 'customer',
    entityId: contractData.customer_id,
    changesSummary: `Contract signed via ${signatureMethod}`,
  });
  
  return { success: true, error: null };
}

/**
 * Validate contracts for order progression
 */
export async function validateOrderContracts(
  orderId: string,
  customerId: string,
  serviceAddress?: string
): Promise<{ valid: boolean; blockers: string[] }> {
  const requirements = await checkContractRequirements(customerId, serviceAddress);
  
  if (requirements.allSigned) {
    // Update order with contract IDs - using raw update since columns may not be in types yet
    await supabase
      .from('orders')
      .update({
        contracts_valid: true,
      } as Record<string, unknown>)
      .eq('id', orderId);
    
    return { valid: true, blockers: [] };
  }
  
  return { valid: false, blockers: requirements.blockers };
}

/**
 * Get contract status for display
 */
export function getContractStatusInfo(status: ContractStatus): {
  label: string;
  color: string;
  icon: string;
} {
  switch (status) {
    case 'signed':
      return { label: 'Signed', color: 'bg-green-500/10 text-green-600', icon: 'CheckCircle' };
    case 'pending':
      return { label: 'Pending Signature', color: 'bg-amber-500/10 text-amber-600', icon: 'Clock' };
    case 'declined':
      return { label: 'Declined', color: 'bg-red-500/10 text-red-600', icon: 'XCircle' };
    case 'expired':
      return { label: 'Expired', color: 'bg-muted text-muted-foreground', icon: 'AlertCircle' };
    default:
      return { label: status, color: 'bg-muted text-muted-foreground', icon: 'Circle' };
  }
}
