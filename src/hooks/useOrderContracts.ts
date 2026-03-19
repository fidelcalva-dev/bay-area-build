import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Contract, 
  ContractType,
  normalizeAddress,
  getCustomerMSA,
} from '@/lib/contractService';
import { 
  buildAddendumTerms, 
  buildMSATerms,
  getAddendumTemplateType,
  AddendumTemplateData 
} from '@/lib/contractTemplates';
import { CONTRACT_VERSION, ADDENDUM_VERSION, TERMS_VERSION } from '@/lib/policyLanguage';

interface OrderContractState {
  msaContract: Contract | null;
  addendumContract: Contract | null;
  msaRequired: boolean;
  addendumRequired: boolean;
  contractsValid: boolean;
  blockers: string[];
  isLoading: boolean;
}

interface UseOrderContractsParams {
  orderId: string | null;
  customerId: string | null;
  serviceAddress?: string | null;
  customerType?: string;
  quoteId?: string | null;
}

export function useOrderContracts({
  orderId,
  customerId,
  serviceAddress,
  customerType = 'homeowner',
  quoteId,
}: UseOrderContractsParams) {
  const [state, setState] = useState<OrderContractState>({
    msaContract: null,
    addendumContract: null,
    msaRequired: false,
    addendumRequired: false,
    contractsValid: true,
    blockers: [],
    isLoading: true,
  });
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const checkContracts = useCallback(async () => {
    if (!customerId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const blockers: string[] = [];

      // Check for signed MSA
      const { data: msaData } = await supabase
        .from('contracts')
        .select('*')
        .eq('customer_id', customerId)
        .eq('contract_type', 'msa')
        .eq('status', 'signed')
        .order('signed_at', { ascending: false })
        .limit(1)
        .single();

      const msaContract = msaData as Contract | null;
      const msaRequired = !msaContract;

      if (msaRequired) {
        blockers.push('Master Service Agreement signature required');
      }

      // Check for pending MSA if none signed
      let pendingMsa: Contract | null = null;
      if (msaRequired) {
        const { data: pendingData } = await supabase
          .from('contracts')
          .select('*')
          .eq('customer_id', customerId)
          .eq('contract_type', 'msa')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        pendingMsa = pendingData as Contract | null;
      }

      // Check for addendum at service address
      let addendumContract: Contract | null = null;
      let addendumRequired = false;

      if (serviceAddress) {
        const normalizedAddress = normalizeAddress(serviceAddress);
        
        const { data: addendumData } = await supabase
          .from('contracts')
          .select('*')
          .eq('customer_id', customerId)
          .eq('contract_type', 'addendum')
          .eq('status', 'signed')
          .eq('service_address_normalized', normalizedAddress)
          .limit(1)
          .single();

        addendumContract = addendumData as Contract | null;
        addendumRequired = !addendumContract;

        if (addendumRequired) {
          blockers.push('Service Addendum required for this address');
        }

        // Check for pending addendum if none signed
        if (addendumRequired) {
          const { data: pendingAddendum } = await supabase
            .from('contracts')
            .select('*')
            .eq('customer_id', customerId)
            .eq('contract_type', 'addendum')
            .eq('status', 'pending')
            .eq('service_address_normalized', normalizedAddress)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (pendingAddendum) {
            addendumContract = pendingAddendum as Contract;
          }
        }
      }

      setState({
        msaContract: msaContract || pendingMsa,
        addendumContract,
        msaRequired,
        addendumRequired,
        contractsValid: !msaRequired && !addendumRequired,
        blockers,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking contracts:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [customerId, serviceAddress]);

  useEffect(() => {
    checkContracts();
  }, [checkContracts]);

  // Generate a new addendum for the order
  const generateAddendum = useCallback(async (templateData: AddendumTemplateData) => {
    if (!customerId || !serviceAddress) {
      toast({ 
        title: 'Cannot generate addendum', 
        description: 'Customer and service address are required',
        variant: 'destructive' 
      });
      return null;
    }

    setIsGenerating(true);

    try {
      const templateType = getAddendumTemplateType(customerType);
      const termsContent = buildAddendumTerms(templateType, templateData);
      const normalizedAddress = normalizeAddress(serviceAddress);

      const { data, error } = await supabase
        .from('contracts')
        .insert({
          customer_id: customerId,
          contract_type: 'addendum' as const,
          status: 'pending' as const,
          service_address: serviceAddress,
          service_address_normalized: normalizedAddress,
          terms_content: termsContent,
          contract_version: ADDENDUM_VERSION,
          terms_version: TERMS_VERSION,
          quote_id: quoteId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Log event
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('contract_events').insert({
        contract_id: data.id,
        event_type: 'created',
        actor_id: user?.id,
        actor_role: 'staff',
        metadata: { template_type: templateType, order_id: orderId },
      });

      toast({ title: 'Addendum generated', description: 'Ready to send for signature' });
      await checkContracts();
      return data as Contract;
    } catch (error) {
      console.error('Error generating addendum:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to generate addendum',
        variant: 'destructive' 
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [customerId, serviceAddress, customerType, orderId, quoteId, toast, checkContracts]);

  // Generate MSA if not exists
  const generateMSA = useCallback(async (data: { 
    customerName: string; 
    companyName?: string;
    customerPhone: string;
    customerEmail?: string;
  }) => {
    if (!customerId) return null;

    setIsGenerating(true);

    try {
      const termsContent = buildMSATerms(data);

      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          customer_id: customerId,
          contract_type: 'msa' as const,
          status: 'pending' as const,
          terms_content: termsContent,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('contract_events').insert({
        contract_id: contract.id,
        event_type: 'created',
        actor_id: user?.id,
        actor_role: 'staff',
        metadata: { contract_type: 'msa' },
      });

      toast({ title: 'MSA generated', description: 'Ready to send for signature' });
      await checkContracts();
      return contract as Contract;
    } catch (error) {
      console.error('Error generating MSA:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to generate MSA',
        variant: 'destructive' 
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [customerId, toast, checkContracts]);

  // Send contract for signature
  const sendContract = useCallback(async (
    contractId: string, 
    method: 'sms' | 'email',
    phone?: string,
    email?: string
  ) => {
    setIsSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.functions.invoke('send-contract', {
        body: {
          contractId,
          method,
          phone,
          email,
          actorId: user?.id,
          actorRole: 'staff',
        },
      });

      if (error) throw error;

      toast({ 
        title: 'Contract sent', 
        description: `Signing link sent via ${method.toUpperCase()}` 
      });
    } catch (error) {
      console.error('Error sending contract:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to send contract via ${method}`,
        variant: 'destructive' 
      });
    } finally {
      setIsSending(false);
    }
  }, [toast]);

  return {
    ...state,
    isSending,
    isGenerating,
    checkContracts,
    generateAddendum,
    generateMSA,
    sendContract,
  };
}
