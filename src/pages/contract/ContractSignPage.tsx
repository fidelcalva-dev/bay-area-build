/**
 * Public contract signing page — /contract/:token
 * Customers open this link to review and sign their contract.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContractData {
  id: string;
  customer_id: string;
  contract_type: string;
  status: string;
  terms_content: string | null;
  service_address: string | null;
  signed_at: string | null;
  signer_name: string | null;
  expires_at: string | null;
  quote_id: string | null;
}

interface QuoteData {
  customer_name: string | null;
  subtotal: number | null;
  material_type: string | null;
  zip_code: string | null;
}

export default function ContractSignPage() {
  const { token } = useParams<{ token: string }>();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [signerName, setSignerName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (token) loadContract();
  }, [token]);

  async function loadContract() {
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('contracts' as 'orders')
        .select('*')
        .eq('id' as 'id', token!)
        .single();

      if (err || !data) {
        setError('Contract not found or has expired.');
        return;
      }

      const c = data as unknown as ContractData;
      setContract(c);

      if (c.status === 'signed') {
        setIsSigned(true);
      }

      // Mark as viewed
      if (c.status === 'pending') {
        await supabase
          .from('contracts' as 'orders')
          .update({ viewed_at: new Date().toISOString() } as never)
          .eq('id' as 'id', c.id);
      }

      // Fetch linked quote data if available
      if (c.quote_id) {
        const { data: q } = await supabase
          .from('quotes')
          .select('customer_name, subtotal, material_type, zip_code')
          .eq('id', c.quote_id)
          .single();
        if (q) setQuote(q);
      }
    } catch {
      setError('Failed to load contract.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSign() {
    if (!signerName.trim() || !agreed || !contract) return;
    setIsSubmitting(true);

    try {
      const { error: err } = await supabase
        .from('contracts' as 'orders')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          signer_name: signerName.trim(),
          signature_method: 'web_link',
        } as never)
        .eq('id' as 'id', contract.id);

      if (err) throw err;

      // Log event
      await supabase
        .from('contract_events' as 'orders')
        .insert({
          contract_id: contract.id,
          event_type: 'signed',
          metadata: { method: 'web_link', signer_name: signerName.trim() },
        } as never);

      // Create timeline event
      await supabase
        .from('timeline_events')
        .insert({
          entity_type: 'CUSTOMER',
          entity_id: contract.customer_id,
          customer_id: contract.customer_id,
          event_type: 'SYSTEM',
          summary: `Contract signed by ${signerName.trim()}`,
          details_json: {
            contract_id: contract.id,
            contract_type: contract.contract_type,
            signer_name: signerName.trim(),
            event: 'CONTRACT_SIGNED',
          },
        });

      setIsSigned(true);
    } catch {
      setError('Failed to sign contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Contract Unavailable</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSigned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2">Contract Signed!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for signing. You'll receive a confirmation shortly.
            </p>
            <Badge className="bg-green-100 text-green-800">Signed Successfully</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-primary" />
          <h1 className="text-2xl font-bold">Service Agreement</h1>
          <p className="text-muted-foreground mt-1">
            {contract?.contract_type === 'msa' ? 'Master Service Agreement' : 'Service Addendum'}
          </p>
        </div>

        {/* Quote Summary */}
        {(quote || contract?.service_address) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {quote?.customer_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{quote.customer_name}</span>
                </div>
              )}
              {contract?.service_address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Address</span>
                  <span className="font-medium">{contract.service_address}</span>
                </div>
              )}
              {quote?.material_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material</span>
                  <span className="font-medium capitalize">{quote.material_type}</span>
                </div>
              )}
              {quote?.subtotal != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">${quote.subtotal.toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Terms */}
        {contract?.terms_content && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto rounded border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {contract.terms_content}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signature */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sign Below</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name (as signature)</label>
              <Input
                placeholder="Type your full legal name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="text-lg"
              />
              {signerName && (
                <div className="mt-3 p-4 border rounded-lg bg-muted/20 text-center">
                  <p className="font-serif text-2xl italic text-foreground">{signerName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Electronic Signature</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c === true)}
              />
              <label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                I agree to the terms and conditions above. I understand this is a legally binding electronic signature.
              </label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full h-12 text-base"
              disabled={!signerName.trim() || !agreed || isSubmitting}
              onClick={handleSign}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing...</>
              ) : (
                'Sign Contract'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing, you agree to the service terms. A copy will be sent to you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
