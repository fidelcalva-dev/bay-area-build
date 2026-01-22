import { useState } from 'react';
import { 
  CheckCircle, Calendar, ShoppingCart, MessageCircle, Copy, Mail, 
  ChevronRight, RefreshCw, Loader2, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuoteSummary {
  sizeLabel: string;
  materialType: string;
  rentalDays: number;
  zipCode: string;
  estimatedMin: number;
  estimatedMax: number;
  includedTons: number;
}

interface QuoteSavedScreenProps {
  quoteId: string | null;
  quoteSummary: QuoteSummary;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  smsStatus: 'pending' | 'sent' | 'failed' | null;
  onContinueToSchedule: () => void;
  onPlaceOrderNow: () => void;
  onEditQuote: () => void;
  onResendSms: () => Promise<void>;
}

const BUSINESS_PHONE = '+15106802150';

export function QuoteSavedScreen({
  quoteId,
  quoteSummary,
  customerEmail,
  smsStatus,
  onContinueToSchedule,
  onPlaceOrderNow,
  onEditQuote,
  onResendSms,
}: QuoteSavedScreenProps) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Build resume link
  const resumeLink = quoteId 
    ? `${window.location.origin}/quote?resume=${quoteId}`
    : `${window.location.origin}/quick-order?zip=${quoteSummary.zipCode}&size=${quoteSummary.sizeLabel.match(/\d+/)?.[0] || '20'}&material=${quoteSummary.materialType}`;

  const shortQuoteId = quoteId ? quoteId.slice(0, 8).toUpperCase() : null;

  // Copy quote link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(resumeLink);
    toast({ title: 'Link Copied! 📋', description: 'Share or save this link to resume your quote.' });
    
    // Track event
    trackQuoteEvent('clicked_copy_link');
  };

  // Resend SMS
  const handleResendSms = async () => {
    setIsResending(true);
    await onResendSms();
    setIsResending(false);
    trackQuoteEvent('clicked_resend_sms');
  };

  // Text Support - opens SMS app with prefilled message
  const handleTextSupport = () => {
    const msg = encodeURIComponent(
      `Hi, I saved a quote.\n` +
      `Quote ID: ${shortQuoteId || 'N/A'}\n` +
      `${quoteSummary.sizeLabel} (${quoteSummary.materialType === 'heavy' ? 'Heavy' : 'General'})\n` +
      `ZIP: ${quoteSummary.zipCode}\n\n` +
      `Can you help me schedule?`
    );
    window.open(`sms:${BUSINESS_PHONE}?body=${msg}`, '_blank');
    trackQuoteEvent('clicked_text_support');
  };

  // Email me this link (placeholder - could integrate with Resend)
  const handleEmailLink = async () => {
    if (!customerEmail) {
      toast({ 
        title: 'No email provided', 
        description: 'Please copy the link instead.',
        variant: 'destructive'
      });
      return;
    }

    setIsSendingEmail(true);
    
    // Best-effort: attempt to send via edge function if available
    try {
      // For now, open mailto as fallback
      const subject = encodeURIComponent(`Your CalSan Quote - ${quoteSummary.sizeLabel}`);
      const body = encodeURIComponent(
        `Here's your saved quote:\n\n` +
        `${quoteSummary.sizeLabel} (${quoteSummary.materialType === 'heavy' ? 'Heavy Materials' : 'General Debris'})\n` +
        `${quoteSummary.rentalDays} days rental\n` +
        `Estimate: $${quoteSummary.estimatedMin}–$${quoteSummary.estimatedMax}\n\n` +
        `Resume your quote here:\n${resumeLink}`
      );
      window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank');
      toast({ title: 'Email Draft Opened', description: 'Send yourself the quote link.' });
      trackQuoteEvent('clicked_email_link');
    } catch (err) {
      toast({ title: 'Could not open email', variant: 'destructive' });
    }
    
    setIsSendingEmail(false);
  };

  // Track quote events for analytics
  const trackQuoteEvent = async (eventType: string) => {
    if (!quoteId) return;
    try {
      await supabase.from('quote_events').insert({
        quote_id: quoteId,
        event_type: eventType,
        event_data: { source: 'quote_saved_screen' },
      });
    } catch (err) {
      console.error('[QuoteSavedScreen] Failed to track event:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        
        <h4 className="text-xl font-bold text-foreground mb-2">Quote Saved</h4>
        
        {/* SMS Status Subtext */}
        {smsStatus === 'sent' ? (
          <p className="text-muted-foreground">
            We texted you a link so you can resume anytime.
          </p>
        ) : smsStatus === 'failed' ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
            <p className="text-orange-700 text-sm">
              Saved ✅ We couldn't send the text. Copy your link below.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Your quote is ready. What would you like to do next?
          </p>
        )}
      </div>

      {/* Quote Summary Card */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-foreground">
              {quoteSummary.sizeLabel}
              <span className="text-muted-foreground font-normal ml-1">
                ({quoteSummary.materialType === 'heavy' ? 'Heavy' : 'General'})
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {quoteSummary.materialType === 'heavy' 
                ? `${quoteSummary.rentalDays} days • Flat fee – disposal included`
                : `${quoteSummary.rentalDays} days • ${quoteSummary.includedTons}T included`
              }
            </div>
            <div className="text-sm text-muted-foreground">
              ZIP {quoteSummary.zipCode}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-foreground">
              ${quoteSummary.estimatedMin}–${quoteSummary.estimatedMax}
            </div>
            {shortQuoteId && (
              <div className="text-xs text-muted-foreground font-mono mt-1">
                #{shortQuoteId}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Buttons (Max 3) */}
      <div className="space-y-3">
        {/* 1. Continue to Schedule (Primary) */}
        <Button
          type="button"
          variant="cta"
          size="lg"
          className="w-full h-14 text-base gap-2"
          onClick={() => {
            trackQuoteEvent('clicked_schedule');
            onContinueToSchedule();
          }}
        >
          <Calendar className="w-5 h-5" />
          Continue to Schedule
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* 2. Place Order Now (Secondary) */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full h-12 text-base gap-2 border-primary/30 hover:bg-primary/5"
          onClick={() => {
            trackQuoteEvent('clicked_place_order');
            onPlaceOrderNow();
          }}
        >
          <ShoppingCart className="w-5 h-5" />
          Place Order Now
        </Button>

        {/* 3. Text Support (Secondary) */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full h-12 text-base gap-2"
          onClick={handleTextSupport}
        >
          <MessageCircle className="w-5 h-5" />
          Text Support
        </Button>
      </div>

      {/* Secondary Links */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Quote Link
        </button>

        <span className="text-muted-foreground">•</span>

        <button
          type="button"
          onClick={handleEmailLink}
          disabled={isSendingEmail}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isSendingEmail ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Mail className="w-3.5 h-3.5" />
          )}
          Email me this link
        </button>

        <span className="text-muted-foreground">•</span>

        <button
          type="button"
          onClick={onEditQuote}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit my quote
        </button>
      </div>

      {/* Resend SMS if failed */}
      {smsStatus === 'failed' && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleResendSms}
            disabled={isResending}
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Resend SMS
          </Button>
        </div>
      )}

      {/* Reassurance Text */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        {smsStatus === 'sent' 
          ? "Click the link in your text anytime to continue."
          : "Use the link above anytime to resume where you left off."
        }
      </p>
    </div>
  );
}
