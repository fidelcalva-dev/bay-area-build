import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, Loader2, CheckCircle, Clock, AlertTriangle, Ban } from 'lucide-react';

interface Props {
  customerId: string;
  activationStatus: string;
  activationAttempts: number;
  phone?: string | null;
  email?: string | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  not_sent: { label: 'Not Sent', variant: 'outline', icon: Ban },
  sent: { label: 'Sent', variant: 'secondary', icon: Send },
  opened: { label: 'Opened', variant: 'default', icon: Clock },
  activated: { label: 'Activated', variant: 'default', icon: CheckCircle },
  expired: { label: 'Expired', variant: 'destructive', icon: AlertTriangle },
};

export function CustomerActivationStatus({ customerId, activationStatus, activationAttempts, phone, email }: Props) {
  const queryClient = useQueryClient();
  const [sending, setSending] = useState(false);

  const config = statusConfig[activationStatus] || statusConfig.not_sent;
  const StatusIcon = config.icon;

  const resend = useMutation({
    mutationFn: async (channel: string) => {
      setSending(true);
      const { data, error } = await supabase.functions.invoke('send-activation', {
        body: { resend_customer_id: customerId, channel },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.status === 'sent') {
        toast.success('Activation link sent!');
      } else {
        toast.error(data.error || 'Failed to send');
      }
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      setSending(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setSending(false);
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Activation Status</span>
          <Badge variant={config.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        {activationAttempts > 0 && (
          <span className="text-xs text-muted-foreground">
            {activationAttempts}/3 attempts
          </span>
        )}
      </div>

      {activationStatus !== 'activated' && activationAttempts < 3 && (
        <div className="flex gap-2">
          {phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => resend.mutate('sms')}
              disabled={sending}
            >
              {sending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
              Send SMS
            </Button>
          )}
          {email && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => resend.mutate('email')}
              disabled={sending}
            >
              {sending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
              Send Email
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
