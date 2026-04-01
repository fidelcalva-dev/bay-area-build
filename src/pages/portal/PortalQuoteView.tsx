import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Calendar, CreditCard, Phone, MessageCircle, Package, MapPin, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { logTimelineEvent } from '@/lib/timelineService';
import { BUSINESS_INFO } from '@/lib/seo';
import logoCalsan from '@/assets/logo-calsan.webp';

interface OutboundQuote {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  address_text: string | null;
  zip: string | null;
  customer_type: string;
  material_category: string;
  size_yd: number;
  tier: string;
  customer_price: number;
  included_days: number;
  included_tons: string;
  overage_rule_text: string;
  status: string;
  order_id: string | null;
  quote_id: string | null;
  created_at: string;
}

export default function PortalQuoteView() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<OutboundQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) return;

    const fetchQuote = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('outbound_quotes')
          .select('*')
          .eq('id', quoteId)
          .single();

        if (fetchError || !data) {
          setError('Quote not found or has expired.');
          return;
        }

        setQuote(data as unknown as OutboundQuote);

        // Log view event
        logTimelineEvent({
          entityType: 'QUOTE',
          entityId: quoteId,
          eventType: 'QUOTE',
          eventAction: 'UPDATED',
          summary: 'Customer viewed quote via portal',
          orderId: data.order_id || null,
          source: 'SYSTEM',
          visibility: 'CUSTOMER',
          actorRole: 'customer',
        });
      } catch {
        setError('Failed to load quote.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error || 'Quote not found'}</p>
          <Button onClick={() => navigate('/portal')}>Go to Portal</Button>
        </Card>
      </div>
    );
  }

  const tierLabel = quote.tier === 'BASE' ? 'Standard' : quote.tier === 'CORE' ? 'Core' : 'Premium';

  return (
    <div className="min-h-screen bg-[hsl(150_10%_98%)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <img src={logoCalsan} alt="Calsan" className="h-10 w-auto rounded-lg" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">Your Quote</p>
            <p className="text-xs text-muted-foreground">Calsan Dumpsters Pro</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hi {quote.customer_name}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's your {quote.size_yd} yard dumpster quote
          </p>
        </div>

        {/* Price Card */}
        <Card className="overflow-hidden">
          <div className="bg-primary/5 p-6 text-center border-b border-border">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              {tierLabel} Package
            </Badge>
            <p className="text-4xl font-bold text-foreground">${quote.customer_price.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">All-inclusive price</p>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>{quote.size_yd} Yard Dumpster</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{quote.included_days} Days Included</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="text-muted-foreground text-xs">
                  {quote.included_tons}T included weight · {quote.overage_rule_text}
                </span>
              </div>
            </div>
            {quote.address_text && (
              <>
                <Separator />
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{quote.address_text}</span>
                </div>
              </>
            )}
            <Separator />
            <p className="text-xs text-muted-foreground">
              Includes delivery, pickup, {quote.included_days}-day rental, and {quote.included_tons} tons of {quote.material_category.toLowerCase()} disposal.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full h-14 rounded-xl text-base font-semibold"
            onClick={() => navigate(`/portal/schedule?quote=${quote.id}`)}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Delivery
            <ChevronRight className="w-5 h-5 ml-auto" />
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 rounded-xl text-base font-semibold"
            onClick={() => navigate(`/portal/pay?quote=${quote.id}`)}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Pay Now
            <ChevronRight className="w-5 h-5 ml-auto" />
          </Button>
        </div>

        {/* Contact */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Questions about this quote?</p>
          <div className="flex gap-3">
            <a href={`tel:${BUSINESS_INFO.phone.sales.replace(/\D/g, '')}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Phone className="w-4 h-4" />
                Call
              </Button>
            </a>
            <a href={`sms:${BUSINESS_INFO.phone.sales.replace(/\D/g, '')}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <MessageCircle className="w-4 h-4" />
                Text
              </Button>
            </a>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          This quote is valid for 7 days. Prices may vary based on material weight.
        </p>
      </main>
    </div>
  );
}
