// Quote Send Panel — one-click send BASE/CORE/PREMIUM via SMS + Email

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Send, Copy, MessageSquare, Mail, CheckCircle2,
  AlertTriangle, Clock, Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  createOutboundQuote,
  sendOutboundQuote,
  buildSmsPreview,
  buildCustomerNextStepsLinks,
  getIncludedTonsText,
} from '@/services/outboundQuoteService';
import type { PricingTier, TierPricing, TierConfig } from '@/services/pricingTierService';

interface QuoteSendPanelProps {
  activeTier: PricingTier;
  activePricing: TierPricing;
  tierConfig: TierConfig;
  dumpsterSize: number;
  customerType: string;
  materialCategory: string;
  userId: string;
  userRole: string;
  inputs: {
    zip_code?: string;
    address_text?: string;
    is_same_day?: boolean;
  };
}

export function QuoteSendPanel({
  activeTier,
  activePricing,
  tierConfig,
  dumpsterSize,
  customerType,
  materialCategory,
  userId,
  userRole,
  inputs,
}: QuoteSendPanelProps) {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<{ time: string; status: string } | null>(null);

  const canSend = userRole === 'admin' || userRole === 'sales' || userRole === 'cs';
  const includedTons = getIncludedTonsText(dumpsterSize);

  // Check guardrails
  const marginPct = activePricing.gross_margin_pct / 100;
  const belowMinMargin = marginPct < tierConfig.margin_min_pct;
  const needsApproval = belowMinMargin && userRole !== 'admin';

  const handleSend = async () => {
    if (!customerName.trim()) {
      toast({ title: 'Customer name required', variant: 'destructive' });
      return;
    }
    if (sendSms && !customerPhone.trim()) {
      toast({ title: 'Phone number required for SMS', variant: 'destructive' });
      return;
    }
    if (sendEmail && !customerEmail.trim()) {
      toast({ title: 'Email required for email delivery', variant: 'destructive' });
      return;
    }
    if (!sendSms && !sendEmail) {
      toast({ title: 'Select at least one channel', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      // Create outbound quote record
      const quote = await createOutboundQuote({
        customer_name: customerName,
        customer_phone: customerPhone || undefined,
        customer_email: customerEmail || undefined,
        address_text: inputs.address_text,
        zip: inputs.zip_code,
        customer_type: customerType,
        material_category: materialCategory,
        size_yd: dumpsterSize,
        tier: activeTier,
        customer_price: activePricing.customer_price,
        included_days: 7,
        included_tons: includedTons,
        overage_rule_text: '$165/ton overage',
        same_day_flag: inputs.is_same_day || false,
      }, userId);

      if (needsApproval) {
        toast({
          title: 'Approval Required',
          description: `Margin ${(marginPct * 100).toFixed(1)}% is below minimum. Quote saved as APPROVAL_REQUIRED.`,
          variant: 'destructive',
        });
        setLastSent({ time: new Date().toLocaleTimeString(), status: 'APPROVAL_REQUIRED' });
        return;
      }

      // Send via edge function
      const channels: ('SMS' | 'EMAIL')[] = [];
      if (sendSms) channels.push('SMS');
      if (sendEmail) channels.push('EMAIL');

      const result = await sendOutboundQuote(quote.id, channels);

      if (result.success) {
        toast({
          title: `Quote Sent (${activeTier})`,
          description: `${result.status} via ${channels.join(' + ')} to ${customerName}`,
        });
        setLastSent({ time: new Date().toLocaleTimeString(), status: result.status });
      } else {
        toast({
          title: 'Send Failed',
          description: result.error || 'Unknown error',
          variant: 'destructive',
        });
        setLastSent({ time: new Date().toLocaleTimeString(), status: 'FAILED' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = () => {
    const links = buildCustomerNextStepsLinks('preview');
    const msg = buildSmsPreview({
      customer_name: customerName || '[Name]',
      customer_type: customerType,
      size_yd: dumpsterSize,
      customer_price: activePricing.customer_price,
      included_days: 7,
      included_tons: includedTons,
      overage_rule_text: '$165/ton overage',
      material_category: materialCategory,
      schedule_link: links.schedule_link,
      payment_link: links.payment_link,
      portal_link: links.portal_link,
    });
    navigator.clipboard.writeText(msg);
    toast({ title: 'Copied!', description: 'Quote message copied to clipboard' });
  };

  if (!canSend) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="h-5 w-5" />
          Send Quote ({activeTier})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Customer info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Customer Name *</Label>
            <Input
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Phone (SMS)</Label>
            <Input
              placeholder="(510) 555-1234"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input
              placeholder="john@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Channel selection */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={sendSms} onCheckedChange={(v) => setSendSms(!!v)} />
            <MessageSquare className="h-3.5 w-3.5" />
            SMS
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={sendEmail} onCheckedChange={(v) => setSendEmail(!!v)} />
            <Mail className="h-3.5 w-3.5" />
            Email
          </label>
        </div>

        {/* Guardrail warning */}
        {needsApproval && (
          <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Margin below {(tierConfig.margin_min_pct * 100).toFixed(0)}% — requires admin approval.
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 mr-1.5" />
            )}
            Send {activeTier} Quote
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyMessage}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Message
          </Button>
        </div>

        {/* Last sent status */}
        {lastSent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {lastSent.status === 'SENT' || lastSent.status === 'DRY_RUN' ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            ) : lastSent.status === 'APPROVAL_REQUIRED' ? (
              <Clock className="h-3.5 w-3.5 text-accent-foreground" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            )}
            Last: {lastSent.status} at {lastSent.time}
            {lastSent.status === 'DRY_RUN' && (
              <Badge variant="outline" className="text-[9px] ml-1">DRY_RUN mode</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
