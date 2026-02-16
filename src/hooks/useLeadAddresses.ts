import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeadAddress {
  id: string;
  lead_id: string;
  label: string;
  address_line: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  is_primary: boolean;
  created_at: string;
}

export function useLeadAddresses(leadId: string | null) {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<LeadAddress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_addresses')
        .select('*')
        .eq('lead_id', leadId)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      setAddresses((data || []) as LeadAddress[]);
    } catch {
      console.error('Error fetching addresses');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const addAddress = useCallback(async (addr: Omit<LeadAddress, 'id' | 'lead_id' | 'created_at'>) => {
    if (!leadId) return;
    try {
      const { error } = await supabase.from('lead_addresses').insert({
        lead_id: leadId,
        label: addr.label || 'Address',
        address_line: addr.address_line,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        notes: addr.notes,
        is_primary: addr.is_primary,
      });
      if (error) throw error;
      toast({ title: 'Address added' });
      fetchAddresses();
    } catch {
      toast({ title: 'Error adding address', variant: 'destructive' });
    }
  }, [leadId, fetchAddresses, toast]);

  const deleteAddress = useCallback(async (addressId: string) => {
    try {
      const { error } = await supabase.from('lead_addresses').delete().eq('id', addressId);
      if (error) throw error;
      toast({ title: 'Address removed' });
      fetchAddresses();
    } catch {
      toast({ title: 'Error removing address', variant: 'destructive' });
    }
  }, [fetchAddresses, toast]);

  return { addresses, loading, fetchAddresses, addAddress, deleteAddress };
}
