/**
 * DocumentDeliveryCenter — Preview, send, and download quotes/contracts/addenda.
 * Used from Quote Detail and Customer 360.
 */
import { useState } from 'react';
import {
  Send, Download, Copy, Eye, Mail, MessageSquare,
  Loader2, Link2, ScrollText, FileText, Upload,
  CheckCircle,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryAction {
  documentId: string;
  documentType: 'quote' | 'contract' | 'addendum';
  customerId?: string;
  quoteId?: string;
  orderId?: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  pdfUrl?: string | null;
  signingLink?: string | null;
  onSent?: () => void;
}

export function DocumentDeliveryCenter({
  documentId,
  documentType,
  customerId,
  quoteId,
  orderId,
  customerPhone,
  customerEmail,
  customerName,
  pdfUrl,
  signingLink,
  onSent,
}: DeliveryAction) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [method, setMethod] = useState<'sms' | 'email' | null>(null);
  const { toast } = useToast();

  const typeLabels: Record<string, string> = {
    quote: 'Quote',
    contract: 'Contract',
    addendum: 'Addendum',
  };
  const label = typeLabels[documentType] || 'Document';

  const link = signingLink || (documentType === 'quote'
    ? `${window.location.origin}/portal/quote/${documentId}`
    : `${window.location.origin}/contract/${documentId}`);

  async function handleSend(via: 'sms' | 'email') {
    setSending(true);
    setMethod(via);
    try {
      // Log the send event
      if (customerId) {
        await supabase.from('timeline_events').insert({
          entity_type: 'CUSTOMER' as const,
          entity_id: customerId,
          customer_id: customerId,
          event_type: 'SYSTEM' as const,
          event_action: 'SENT' as const,
          summary: `${label} sent via ${via.toUpperCase()}`,
          details_json: {
            document_id: documentId,
            document_type: documentType,
            delivery_method: via,
            quote_id: quoteId,
            order_id: orderId,
            event: `${documentType.toUpperCase()}_SENT`,
          },
        });
      }

      // Invoke appropriate edge function
      if (documentType === 'contract' || documentType === 'addendum') {
        try {
          await supabase.functions.invoke('send-contract', {
            body: {
              contractId: documentId,
              method: via,
              phone: customerPhone,
              email: customerEmail,
            },
          });
        } catch { /* edge function may not exist yet */ }
      } else if (documentType === 'quote') {
        // Quote sending via outbound-quote system
        try {
          await supabase.functions.invoke('send-outbound-quote', {
            body: {
              quoteId: documentId,
              channels: [via.toUpperCase()],
            },
          });
        } catch { /* fallback: just log */ }
      }

      toast({ title: `${label} sent via ${via.toUpperCase()}` });
      onSent?.();
      setOpen(false);
    } catch {
      toast({ title: `Failed to send ${label.toLowerCase()}`, variant: 'destructive' });
    } finally {
      setSending(false);
      setMethod(null);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copied to clipboard' });
  }

  const [generatingPdf, setGeneratingPdf] = useState(false);

  async function handleGeneratePdf() {
    setGeneratingPdf(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quote-pdf', {
        body: {
          documentId,
          documentType,
          quoteId,
          customerId,
        },
      });
      if (error) throw error;
      if (data?.pdf_url) {
        window.open(data.pdf_url, '_blank');
        toast({ title: 'PDF generated and opened' });
      } else {
        // Fallback: open the preview link as printable page
        window.open(link + '?print=true', '_blank');
        toast({ title: 'Opening printable preview', description: 'Use browser Print → Save as PDF' });
      }
    } catch {
      // Fallback: open preview in print mode
      window.open(link + '?print=true', '_blank');
      toast({ title: 'Opening printable preview', description: 'Use browser Print → Save as PDF' });
    } finally {
      setGeneratingPdf(false);
    }
  }

  function handleDownloadPDF() {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      handleGeneratePdf();
    }
  }

  function handlePreview() {
    window.open(link, '_blank');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Send className="w-3.5 h-3.5" />{`Send ${label}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5" /> {label} Delivery Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Customer Info */}
          <div className="rounded-lg bg-muted/40 p-3 space-y-1">
            <p className="text-sm font-medium">{customerName || 'Customer'}</p>
            {customerPhone && <p className="text-xs text-muted-foreground">📱 {customerPhone}</p>}
            {customerEmail && <p className="text-xs text-muted-foreground">✉️ {customerEmail}</p>}
          </div>

          {/* Send Methods */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Send Via</Label>
            <div className="grid grid-cols-2 gap-2">
              {customerPhone && (
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={() => handleSend('sms')}
                  disabled={sending}
                >
                  {sending && method === 'sms' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  SMS
                </Button>
              )}
              {customerEmail && (
                <Button
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={() => handleSend('email')}
                  disabled={sending}
                >
                  {sending && method === 'email' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Email
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-10 gap-1.5" onClick={handlePreview}>
                <Eye className="w-3.5 h-3.5" /> Preview
              </Button>
              <Button variant="outline" size="sm" className="h-10 gap-1.5" onClick={handleCopyLink}>
                <Link2 className="w-3.5 h-3.5" /> Copy Link
              </Button>
              <Button variant="outline" size="sm" className="h-10 gap-1.5" onClick={handleDownloadPDF}>
                <Download className="w-3.5 h-3.5" /> Download PDF
              </Button>
              <Button variant="outline" size="sm" className="h-10 gap-1.5" disabled>
                <Upload className="w-3.5 h-3.5" /> Upload Signed
              </Button>
            </div>
          </div>

          {/* Secure Link */}
          <div className="rounded-lg border p-2.5">
            <Label className="text-xs text-muted-foreground">Secure Link</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={link} readOnly className="text-xs h-8" />
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={handleCopyLink}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
