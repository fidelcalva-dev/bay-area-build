import { supabase } from '@/integrations/supabase/client';
import { createAuditLog } from './auditLog';
import { CONTRACT_VERSION, ADDENDUM_VERSION, TERMS_VERSION, POLICY_VERSION } from './policyLanguage';

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
  terms_version: string | null;
  terms_content: string | null;
  signed_at: string | null;
  signed_ip: string | null;
  signature_method: string | null;
  signer_name: string | null;
  signer_email: string | null;
  signer_phone: string | null;
  signer_title: string | null;
  esign_consent_at: string | null;
  delivery_method: string | null;
  pdf_url: string | null;
  expires_at: string | null;
  quote_id: string | null;
  parent_contract_id: string | null;
  viewed_at: string | null;
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

// Helper type for contracts table queries
type ContractsTable = 'contracts';
const CONTRACTS_TABLE = 'contracts' as 'orders';
const CONTRACT_EVENTS_TABLE = 'contract_events' as 'orders';

/**
 * Check if customer has a signed MSA
 */
export async function getCustomerMSA(customerId: string): Promise<Contract | null> {
  const { data } = await supabase
    .from(CONTRACTS_TABLE)
    .select('*')
    .eq('customer_id' as 'id', customerId)
    .eq('contract_type' as 'id', 'msa')
    .eq('status' as 'id', 'signed')
    .order('signed_at' as 'id', { ascending: false })
    .limit(1)
    .single();
  
  return (data as unknown as Contract) || null;
}

/**
 * Check if customer has a signed addendum for a specific address
 */
export async function getAddendumForAddress(
  customerId: string, 
  serviceAddress: string
): Promise<Contract | null> {
  const normalized = normalizeAddress(serviceAddress);
  
  const { data } = await supabase
    .from(CONTRACTS_TABLE)
    .select('*')
    .eq('customer_id' as 'id', customerId)
    .eq('contract_type' as 'id', 'addendum')
    .eq('status' as 'id', 'signed')
    .eq('service_address_normalized' as 'id', normalized)
    .limit(1)
    .single();
  
  return (data as unknown as Contract) || null;
}

/**
 * Get all contracts for a customer
 */
export async function getCustomerContracts(customerId: string): Promise<Contract[]> {
  const { data, error } = await supabase
    .from(CONTRACTS_TABLE)
    .select('*')
    .eq('customer_id' as 'id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
  
  return (data as unknown as Contract[]) || [];
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
  quoteId?: string;
  parentContractId?: string;
}): Promise<{ contract: Contract | null; error: string | null }> {
  const { customerId, contractType, serviceAddress, termsContent, quoteId, parentContractId } = params;
  
  // Set canonical version stamps at creation time
  const contractVersion = contractType === 'msa' ? CONTRACT_VERSION : ADDENDUM_VERSION;
  const termsVersion = TERMS_VERSION;
  
  const insertData: Record<string, unknown> = {
    customer_id: customerId,
    contract_type: contractType,
    status: 'pending',
    terms_content: termsContent,
    contract_version: contractVersion,
    terms_version: termsVersion,
    quote_id: quoteId || null,
    parent_contract_id: parentContractId || null,
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
  
  const { data, error } = await supabase
    .from(CONTRACTS_TABLE)
    .insert(insertData as never)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating contract:', error);
    return { contract: null, error: error.message };
  }
  
  const contract = data as unknown as Contract;
  
  // Log event
  await supabase
    .from(CONTRACT_EVENTS_TABLE)
    .insert({
      contract_id: contract.id,
      event_type: 'created',
      metadata: { contract_type: contractType },
    } as never);
  
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
  const { data: contract, error: fetchError } = await supabase
    .from(CONTRACTS_TABLE)
    .select('*')
    .eq('id' as 'id', contractId)
    .single();
  
  if (fetchError || !contract) {
    return { success: false, error: 'Contract not found' };
  }
  
  const contractData = contract as unknown as Contract;
  
  if (contractData.status === 'signed') {
    return { success: false, error: 'Contract already signed' };
  }
  
  const { error } = await supabase
    .from(CONTRACTS_TABLE)
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      signed_ip: ipAddress,
      signature_method: signatureMethod,
    } as never)
    .eq('id' as 'id', contractId);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  // Log event
  await supabase
    .from(CONTRACT_EVENTS_TABLE)
    .insert({
      contract_id: contractId,
      event_type: 'signed',
      ip_address: ipAddress,
      metadata: { method: signatureMethod },
    } as never);
  
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
