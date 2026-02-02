// Resend Portal Link Button Component

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useSendPortalLink, usePortalLinkStatus, type PortalLinkTrigger } from '@/hooks/usePortalLink';
import { formatDistanceToNow } from 'date-fns';

interface ResendPortalLinkButtonProps {
  orderId: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export function ResendPortalLinkButton({ 
  orderId, 
  size = 'sm',
  variant = 'outline' 
}: ResendPortalLinkButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<PortalLinkTrigger>('MANUAL');
  
  const sendMutation = useSendPortalLink();
  const { data: linkStatus } = usePortalLinkStatus(orderId);

  const handleSend = (trigger: PortalLinkTrigger, force = false) => {
    setSelectedTrigger(trigger);
    
    // If link was sent recently and not forcing, show confirm dialog
    if (linkStatus?.portal_link_sent_at && !force) {
      const lastSent = new Date(linkStatus.portal_link_sent_at);
      const hoursSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        setConfirmOpen(true);
        return;
      }
    }
    
    sendMutation.mutate({
      orderId,
      triggerSource: trigger,
      forceResend: force,
    });
  };

  const handleConfirmResend = () => {
    sendMutation.mutate({
      orderId,
      triggerSource: selectedTrigger,
      forceResend: true,
    });
    setConfirmOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size={size} 
            variant={variant}
            disabled={sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Send className="h-4 w-4 mr-1.5" />
            )}
            Send Portal Link
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSend('CONFIRMED')}>
            Send as Order Confirmed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSend('PAID')}>
            Send as Payment Received
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSend('SIGNED')}>
            Send as Agreement Signed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSend('MANUAL')}>
            Send as Manual Resend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {linkStatus?.portal_link_sent_at && (
        <Badge variant="outline" className="text-xs ml-2">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Sent {formatDistanceToNow(new Date(linkStatus.portal_link_sent_at))} ago
        </Badge>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Portal Link?</DialogTitle>
            <DialogDescription>
              A portal link was already sent to this customer{' '}
              {linkStatus?.portal_link_sent_at && (
                <>
                  {formatDistanceToNow(new Date(linkStatus.portal_link_sent_at))} ago
                </>
              )}
              . Are you sure you want to send another one?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmResend} disabled={sendMutation.isPending}>
              {sendMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              Yes, Resend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
