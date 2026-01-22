import { useState } from 'react';
import { 
  CheckCircle, Calendar, ShoppingCart, MessageCircle, Copy, Mail, 
  ChevronRight, RefreshCw, Loader2, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

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

// Bilingual content
const content = {
  en: {
    quoteSaved: 'Quote Saved',
    smsSuccess: 'We texted you a link so you can resume anytime.',
    smsFailed: "Saved ✅ We couldn't send the text. Copy your link below.",
    readyNext: 'Your quote is ready. What would you like to do next?',
    continueSchedule: 'Continue to Schedule',
    placeOrder: 'Place Order Now',
    textSupport: 'Text Support',
    copyLink: 'Copy Quote Link',
    emailLink: 'Email me this link',
    editQuote: 'Edit my quote',
    resendSms: 'Resend SMS',
    linkCopied: 'Link Copied! 📋',
    linkCopiedDesc: 'Share or save this link to resume your quote.',
    noEmail: 'No email provided',
    noEmailDesc: 'Please copy the link instead.',
    emailDraft: 'Email Draft Opened',
    emailDraftDesc: 'Send yourself the quote link.',
    couldNotEmail: 'Could not open email',
    heavy: 'Heavy',
    general: 'General',
    heavyMaterials: 'Heavy Materials',
    generalDebris: 'General Debris',
    flatFee: 'Flat fee – disposal included',
    included: 'included',
    days: 'days',
    resumeText: 'Click the link in your text anytime to continue.',
    resumeLink: 'Use the link above anytime to resume where you left off.',
    textSupportMsg: (quoteId: string, size: string, material: string, zip: string) =>
      `Hi, I saved a quote.\nQuote ID: ${quoteId}\n${size} (${material})\nZIP: ${zip}\n\nCan you help me schedule?`,
    emailSubject: (size: string) => `Your CalSan Quote - ${size}`,
    emailBody: (size: string, material: string, days: number, min: number, max: number, link: string) =>
      `Here's your saved quote:\n\n${size} (${material})\n${days} days rental\nEstimate: $${min}–$${max}\n\nResume your quote here:\n${link}`,
  },
  es: {
    quoteSaved: 'Cotización Guardada',
    smsSuccess: 'Te enviamos un enlace por mensaje de texto para continuar cuando quieras.',
    smsFailed: 'Guardado ✅ No pudimos enviar el mensaje. Copia tu enlace abajo.',
    readyNext: 'Tu cotización está lista. ¿Qué te gustaría hacer ahora?',
    continueSchedule: 'Continuar a Programar',
    placeOrder: 'Hacer Pedido Ahora',
    textSupport: 'Enviar Mensaje',
    copyLink: 'Copiar Enlace',
    emailLink: 'Enviarme por correo',
    editQuote: 'Editar cotización',
    resendSms: 'Reenviar SMS',
    linkCopied: '¡Enlace Copiado! 📋',
    linkCopiedDesc: 'Comparte o guarda este enlace para continuar tu cotización.',
    noEmail: 'Sin correo electrónico',
    noEmailDesc: 'Por favor copia el enlace.',
    emailDraft: 'Borrador de Correo Abierto',
    emailDraftDesc: 'Envíate el enlace de la cotización.',
    couldNotEmail: 'No se pudo abrir el correo',
    heavy: 'Pesado',
    general: 'General',
    heavyMaterials: 'Materiales Pesados',
    generalDebris: 'Escombros Generales',
    flatFee: 'Tarifa fija – disposición incluida',
    included: 'incluidas',
    days: 'días',
    resumeText: 'Haz clic en el enlace de tu mensaje en cualquier momento para continuar.',
    resumeLink: 'Usa el enlace de arriba en cualquier momento para continuar.',
    textSupportMsg: (quoteId: string, size: string, material: string, zip: string) =>
      `Hola, guardé una cotización.\nID: ${quoteId}\n${size} (${material})\nCódigo Postal: ${zip}\n\n¿Me pueden ayudar a programar?`,
    emailSubject: (size: string) => `Tu Cotización CalSan - ${size}`,
    emailBody: (size: string, material: string, days: number, min: number, max: number, link: string) =>
      `Aquí está tu cotización guardada:\n\n${size} (${material})\n${days} días de alquiler\nEstimado: $${min}–$${max}\n\nContinúa tu cotización aquí:\n${link}`,
  },
};

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
  const { language } = useLanguage();
  const t = content[language] || content.en;
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
    toast({ title: t.linkCopied, description: t.linkCopiedDesc });
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
    const materialLabel = quoteSummary.materialType === 'heavy' ? t.heavy : t.general;
    const msg = encodeURIComponent(
      t.textSupportMsg(shortQuoteId || 'N/A', quoteSummary.sizeLabel, materialLabel, quoteSummary.zipCode)
    );
    window.open(`sms:${BUSINESS_PHONE}?body=${msg}`, '_blank');
    trackQuoteEvent('clicked_text_support');
  };

  // Email me this link
  const handleEmailLink = async () => {
    if (!customerEmail) {
      toast({ 
        title: t.noEmail, 
        description: t.noEmailDesc,
        variant: 'destructive'
      });
      return;
    }

    setIsSendingEmail(true);
    
    try {
      const materialLabel = quoteSummary.materialType === 'heavy' ? t.heavyMaterials : t.generalDebris;
      const subject = encodeURIComponent(t.emailSubject(quoteSummary.sizeLabel));
      const body = encodeURIComponent(
        t.emailBody(
          quoteSummary.sizeLabel,
          materialLabel,
          quoteSummary.rentalDays,
          quoteSummary.estimatedMin,
          quoteSummary.estimatedMax,
          resumeLink
        )
      );
      window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank');
      toast({ title: t.emailDraft, description: t.emailDraftDesc });
      trackQuoteEvent('clicked_email_link');
    } catch (err) {
      toast({ title: t.couldNotEmail, variant: 'destructive' });
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
        
        <h4 className="text-xl font-bold text-foreground mb-2">{t.quoteSaved}</h4>
        
        {/* SMS Status Subtext */}
        {smsStatus === 'sent' ? (
          <p className="text-muted-foreground">{t.smsSuccess}</p>
        ) : smsStatus === 'failed' ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
            <p className="text-orange-700 text-sm">{t.smsFailed}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">{t.readyNext}</p>
        )}
      </div>

      {/* Quote Summary Card */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-foreground">
              {quoteSummary.sizeLabel}
              <span className="text-muted-foreground font-normal ml-1">
                ({quoteSummary.materialType === 'heavy' ? t.heavy : t.general})
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {quoteSummary.materialType === 'heavy' 
                ? `${quoteSummary.rentalDays} ${t.days} • ${t.flatFee}`
                : `${quoteSummary.rentalDays} ${t.days} • ${quoteSummary.includedTons}T ${t.included}`
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
          {t.continueSchedule}
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
          {t.placeOrder}
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
          {t.textSupport}
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
          {t.copyLink}
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
          {t.emailLink}
        </button>

        <span className="text-muted-foreground">•</span>

        <button
          type="button"
          onClick={onEditQuote}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          {t.editQuote}
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
            {t.resendSms}
          </Button>
        </div>
      )}

      {/* Reassurance Text */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        {smsStatus === 'sent' ? t.resumeText : t.resumeLink}
      </p>
    </div>
  );
}
