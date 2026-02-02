// Portal Link Hook - for sending and validating portal links

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PortalLinkTrigger = 'SIGNED' | 'CONFIRMED' | 'PAID' | 'MANUAL';

interface SendPortalLinkResponse {
  success: boolean;
  mode: 'DRY_RUN' | 'LIVE';
  portal_link?: string;
  sms_queued?: boolean;
  email_queued?: boolean;
  link_id?: string;
  message?: string;
  last_sent_at?: string;
  error?: string;
}

interface ValidateTokenResponse {
  valid: boolean;
  order_id?: string;
  customer_id?: string;
  link_id?: string;
  order?: {
    id: string;
    status: string;
    scheduled_delivery_date: string | null;
    scheduled_delivery_window: string | null;
    scheduled_pickup_date: string | null;
    scheduled_pickup_window: string | null;
    actual_delivery_at: string | null;
    actual_pickup_at: string | null;
    payment_status: string | null;
    amount_due: number | null;
    balance_due: number | null;
    quotes: {
      id: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      delivery_address: string;
      material_type: string;
      placement_type: string;
      placement_notes: string;
      size_id: string;
      subtotal: number;
    } | null;
  };
  error?: string;
}

// Send portal link to customer
export function useSendPortalLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      triggerSource,
      forceResend = false,
    }: {
      orderId: string;
      triggerSource: PortalLinkTrigger;
      forceResend?: boolean;
    }): Promise<SendPortalLinkResponse> => {
      const { data, error } = await supabase.functions.invoke('send-portal-link', {
        body: {
          order_id: orderId,
          trigger_source: triggerSource,
          force_resend: forceResend,
        },
      });

      if (error) throw error;
      return data as SendPortalLinkResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        const channels: string[] = [];
        if (data.sms_queued) channels.push('SMS');
        if (data.email_queued) channels.push('Email');
        
        toast.success(
          data.mode === 'LIVE' 
            ? `Portal link sent via ${channels.join(' & ')}`
            : `Portal link drafted (${data.mode})`
        );
      } else if (data.message) {
        toast.info(data.message);
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      console.error('Send portal link error:', error);
      toast.error(error.message || 'Failed to send portal link');
    },
  });
}

// Validate a portal token (for customer portal access)
export function useValidatePortalToken(orderId: string, token: string | null) {
  return useQuery({
    queryKey: ['portal-token', orderId, token],
    queryFn: async (): Promise<ValidateTokenResponse> => {
      if (!orderId || !token) {
        return { valid: false, error: 'Missing order ID or token' };
      }

      const { data, error } = await supabase.functions.invoke('validate-portal-token', {
        body: { order_id: orderId, token },
      });

      if (error) throw error;
      return data as ValidateTokenResponse;
    },
    enabled: !!orderId && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Check if portal link was already sent
export function usePortalLinkStatus(orderId?: string) {
  return useQuery({
    queryKey: ['portal-link-status', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('orders')
        .select('portal_link_sent_at, portal_link_id')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });
}
