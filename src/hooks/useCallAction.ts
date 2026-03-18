import { useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logTimelineEvent } from '@/lib/timelineService';

export type CallMode = 'NATIVE_DIALER' | 'GHL_SOFTPHONE' | 'TEL_LINK';

interface CallActionOptions {
  toNumber: string;
  contactId?: string;
  customerId?: string;
  leadId?: string;
  orderId?: string;
  contactName?: string;
  entityType?: 'CUSTOMER' | 'LEAD' | 'ORDER' | 'QUOTE';
  entityId?: string;
}

interface CallActionResult {
  success: boolean;
  mode: CallMode;
  error?: string;
}

/**
 * Determines the best call strategy based on device type.
 * Mobile: native tel: dialer
 * Desktop: GHL softphone link (opens GHL contact in new tab) or tel: fallback
 */
export function useCallAction() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const getCallMode = useCallback((): CallMode => {
    if (isMobile) return 'NATIVE_DIALER';
    return 'GHL_SOFTPHONE';
  }, [isMobile]);

  const formatPhoneForTel = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return phone.startsWith('+') ? phone : `+${digits}`;
  };

  const logCallIntent = useCallback(async (options: CallActionOptions, mode: CallMode) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (options.entityType && options.entityId) {
        await logTimelineEvent({
          entityType: options.entityType,
          entityId: options.entityId,
          eventType: 'CALL',
          eventAction: 'CREATED',
          summary: `Outbound call initiated to ${options.contactName || options.toNumber} via ${mode === 'NATIVE_DIALER' ? 'mobile dialer' : 'GHL softphone'}`,
          customerId: options.customerId || null,
          orderId: options.orderId || null,
          source: 'USER',
          details: {
            to_number: options.toNumber,
            call_mode: mode,
            contact_name: options.contactName || null,
            device: isMobile ? 'mobile' : 'desktop',
            initiated_by: user?.id || null,
          },
          visibility: 'INTERNAL',
        });
      }
    } catch (err) {
      console.warn('Failed to log call intent:', err);
    }
  }, [isMobile]);

  const makeCall = useCallback(async (options: CallActionOptions): Promise<CallActionResult> => {
    const { toNumber, contactName } = options;
    
    if (!toNumber) {
      toast({
        title: 'No phone number',
        description: 'This contact has no phone number on file.',
        variant: 'destructive',
      });
      return { success: false, mode: 'TEL_LINK', error: 'No phone number' };
    }

    const mode = getCallMode();
    const telUrl = `tel:${formatPhoneForTel(toNumber)}`;

    if (mode === 'NATIVE_DIALER') {
      // Mobile: use native dialer
      window.location.href = telUrl;
      await logCallIntent(options, mode);
      
      toast({
        title: 'Calling...',
        description: `Dialing ${contactName || toNumber}`,
      });
      
      return { success: true, mode };
    }

    // Desktop: try GHL softphone or fall back to tel: link
    // GHL softphone opens the contact page where the user can click to call
    try {
      // Use tel: link as the primary desktop path too — 
      // most desktop systems have a default handler (FaceTime, Skype, softphone apps)
      window.open(telUrl, '_self');
      await logCallIntent(options, 'GHL_SOFTPHONE');

      toast({
        title: 'Call initiated',
        description: `Opening dialer for ${contactName || toNumber}. If no app opens, copy the number and call from your phone.`,
      });

      return { success: true, mode: 'GHL_SOFTPHONE' };
    } catch (err) {
      toast({
        title: 'Could not start call',
        description: 'No phone app detected. Copy the number or call from your mobile device.',
      });
      return { success: false, mode: 'GHL_SOFTPHONE', error: 'No dialer available' };
    }
  }, [getCallMode, logCallIntent, toast]);

  const copyNumber = useCallback(async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      toast({ title: 'Number copied', description: phone });
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually', variant: 'destructive' });
    }
  }, [toast]);

  return {
    makeCall,
    copyNumber,
    getCallMode,
    isMobile,
  };
}
