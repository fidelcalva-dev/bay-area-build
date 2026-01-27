import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Send } from 'lucide-react';
import { googleService } from '@/services/googleService';
import { useToast } from '@/hooks/use-toast';

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  defaultTo?: string;
  defaultRecipientName?: string;
  defaultSubject?: string;
  onSuccess?: () => void;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  defaultTo = '',
  defaultRecipientName,
  defaultSubject = '',
  onSuccess,
}: SendEmailDialogProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');

  async function handleSend() {
    if (!to || !subject || !body) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      const result = await googleService.sendEmail({
        to,
        subject,
        body,
        cc: cc || undefined,
        entityType,
        entityId,
      });

      if (result.success) {
        toast({
          title: result.mode === 'DRY_RUN' ? 'Email would be sent (DRY_RUN)' : 'Email Sent',
          description: result.messageId ? `Message ID: ${result.messageId.substring(0, 20)}...` : undefined,
        });
        onOpenChange(false);
        onSuccess?.();
        // Reset form
        setTo(defaultTo);
        setCc('');
        setSubject(defaultSubject);
        setBody('');
      } else {
        toast({ title: 'Failed to send email', description: result.error, variant: 'destructive' });
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send an email via your connected Gmail account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="to">To *</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            {defaultRecipientName && (
              <p className="text-xs text-muted-foreground">{defaultRecipientName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cc">CC (optional)</Label>
            <Input
              id="cc"
              type="email"
              placeholder="cc@example.com"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !to || !subject || !body}>
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
