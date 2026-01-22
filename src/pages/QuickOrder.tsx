import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, Package, MapPin, Calendar, Truck, Phone, ArrowRight, Edit2 } from 'lucide-react';
import { validateQuickLink, recordQuickLinkUse, QuickLink } from '@/lib/quickLinkService';
import { useQuoteCalculation, getZoneByZip } from '@/components/quote/hooks/useQuoteCalculation';
import { QuoteBreakdown } from '@/components/quote/QuoteBreakdown';
import { QuoteOrderFlow } from '@/components/quote/QuoteOrderFlow';
import type { QuoteFormData } from '@/components/quote/types';

const DUMPSTER_SIZES: Record<number, { label: string; description: string }> = {
  6: { label: '6 Yard', description: 'Compact — bathroom remodel, small cleanout' },
  8: { label: '8 Yard', description: 'Small — single room renovation' },
  10: { label: '10 Yard', description: 'Standard — garage cleanout, flooring' },
  20: { label: '20 Yard', description: 'Popular — kitchen remodel, roofing' },
  30: { label: '30 Yard', description: 'Large — whole house cleanout' },
  40: { label: '40 Yard', description: 'XL — construction, major demo' },
  50: { label: '50 Yard', description: 'Max — commercial projects' },
};

const MATERIAL_LABELS: Record<string, { label: string; icon: string }> = {
  general: { label: 'General Debris', icon: '🗑️' },
  heavy: { label: 'Heavy Materials', icon: '🪨' },
};

export default function QuickOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const paramZip = searchParams.get('zip');
  const paramSize = searchParams.get('size');
  const paramMaterial = searchParams.get('material');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickLink, setQuickLink] = useState<QuickLink | null>(null);
  const [showOrderFlow, setShowOrderFlow] = useState(false);
  
  // Derived configuration from token or params
  const config = useMemo(() => {
    if (quickLink) {
      return {
        zip: quickLink.preset_zip || '',
        size: quickLink.preset_size || 20,
        material: (quickLink.preset_material as 'general' | 'heavy') || 'general',
        address: quickLink.preferred_address || '',
        customerId: quickLink.customer_id || undefined,
      };
    }
    
    // Use query params
    return {
      zip: paramZip || '',
      size: paramSize ? parseInt(paramSize, 10) : 20,
      material: (paramMaterial === 'heavy' ? 'heavy' : 'general') as 'general' | 'heavy',
      address: '',
      customerId: undefined,
    };
  }, [quickLink, paramZip, paramSize, paramMaterial]);
  
  // Build form data for quote calculation
  const formData: QuoteFormData = useMemo(() => ({
    userType: 'homeowner',
    zip: config.zip,
    material: config.material,
    size: config.size,
    rentalDays: 7,
    extras: [],
    name: '',
    phone: '',
    email: '',
  }), [config]);
  
  const quote = useQuoteCalculation(formData);
  const zone = getZoneByZip(config.zip);
  
  // Validate token on mount
  useEffect(() => {
    async function validateLink() {
      if (token) {
        setIsLoading(true);
        const result = await validateQuickLink(token);
        
        if (result.valid && result.quickLink) {
          setQuickLink(result.quickLink);
          // Record the use
          await recordQuickLinkUse(result.quickLink.id);
        } else {
          setError(result.error || 'Invalid link');
        }
        setIsLoading(false);
      } else if (paramZip && paramSize) {
        // Using query params instead of token
        setIsLoading(false);
      } else {
        setError('No configuration provided. Please use a valid quick link or provide zip and size parameters.');
        setIsLoading(false);
      }
    }
    
    validateLink();
  }, [token, paramZip, paramSize]);
  
  // Handle starting the order flow
  const handleStartOrder = () => {
    setShowOrderFlow(true);
  };
  
  // Handle order completion
  const handleOrderComplete = () => {
    navigate('/thank-you');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Layout title="Quick Order | CALSAN Dumpsters">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Validating your order link...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout title="Quick Order | CALSAN Dumpsters">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Link Invalid or Expired</h2>
              <p className="text-muted-foreground">{error}</p>
              <div className="pt-4 space-y-2">
                <Button onClick={() => navigate('/quote')} className="w-full">
                  Get a New Quote
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Show order flow
  if (showOrderFlow && quote.isValid) {
    return (
      <Layout title="Complete Your Order | CALSAN Dumpsters">
        <div className="container-wide py-8 max-w-2xl mx-auto">
          <QuoteOrderFlow
            quoteSummary={{
              sizeLabel: DUMPSTER_SIZES[config.size]?.label || `${config.size} Yard`,
              materialType: config.material,
              rentalDays: 7,
              includedTons: quote.includedTons,
              estimatedMin: quote.estimatedMin,
              estimatedMax: quote.estimatedMax,
              zipCode: config.zip,
              subtotal: quote.subtotal,
            }}
            initialContact={{}}
            onComplete={handleOrderComplete}
            onBack={() => setShowOrderFlow(false)}
          />
        </div>
      </Layout>
    );
  }
  
  // Main quick order review
  const sizeInfo = DUMPSTER_SIZES[config.size] || { label: `${config.size} Yard`, description: 'Dumpster rental' };
  const materialInfo = MATERIAL_LABELS[config.material] || MATERIAL_LABELS.general;
  
  return (
    <Layout 
      title="Quick Order | CALSAN Dumpsters"
      description="Complete your dumpster rental order in seconds with your personalized quick link."
    >
      <section className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-primary/5 via-background to-muted py-8 lg:py-12">
        <div className="container-wide max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <CheckCircle className="w-3 h-3 mr-1" />
              Pre-Configured Order
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              Your Quick Order
            </h1>
            <p className="text-muted-foreground">
              Review your pre-filled order details and confirm to proceed
            </p>
          </div>
          
          {/* Order Summary Card */}
          <Card className="mb-6 border-2 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Size */}
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{sizeInfo.label} Dumpster</div>
                  <div className="text-sm text-muted-foreground">{sizeInfo.description}</div>
                </div>
                <Badge variant="outline">{config.size} YD</Badge>
              </div>
              
              {/* Material */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-2xl">
                  {materialInfo.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{materialInfo.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {config.material === 'heavy' 
                      ? 'Concrete, dirt, brick, asphalt' 
                      : 'Household, construction debris, furniture'}
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    {config.address || `ZIP ${config.zip}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {zone?.name || 'Bay Area'} Service Area
                  </div>
                </div>
              </div>
              
              {/* Rental Period */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">7-Day Rental</div>
                  <div className="text-sm text-muted-foreground">
                    Standard rental period • Extensions available
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quote Breakdown */}
          {quote.isValid && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Estimated Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteBreakdown 
                  quote={quote} 
                  materialType={config.material}
                  sizeYards={config.size}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Actions */}
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg"
              onClick={handleStartOrder}
              disabled={!quote.isValid}
            >
              Continue to Schedule
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/quote')}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Customize Order
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                asChild
              >
                <a href="tel:+15105551234">
                  <Phone className="w-4 h-4 mr-2" />
                  Call to Order
                </a>
              </Button>
            </div>
          </div>
          
          {/* Trust Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>🔒 Secure checkout • All-inclusive pricing • No hidden fees</p>
            <p className="mt-1">Questions? Call us at <a href="tel:+15105551234" className="text-primary hover:underline">(510) 555-1234</a></p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
