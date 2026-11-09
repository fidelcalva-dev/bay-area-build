/**
 * Public contract signing page — /contract/:token
 * Customers open this link to review and sign their contract.
 * Stores versioned e-sign consent per UETA/E-SIGN requirements.
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
import { ESIGN_CONSENT, POLICY_VERSION, CONTRACT_VERSION, ADDENDUM_VERSION } from '@/lib/policyLanguage';

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
  contract_version: string | null;
  terms_version: string | null;
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
  const [signerEmail, setSignerEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [esignConsent, setEsignConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (token) loadContract();
  }, [token]);

  // CAL 010: the page no longer reads or writes the contracts table directly.
  // Two database functions check the link's contract id and only expose that one
  // contract. Holding the link authorizes signing; it is not proof of identity.
  async function loadContract() {
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase.rpc('contract_for_signing' as never, {
        p_contract_id: token,
      } as never);
      const payload = data as unknown as { contract: ContractData; quote: QuoteData | null } | null;

      if (err || !payload?.contract) {
        setError('Contract not found or has expired.');
        return;
      }

      setContract(payload.contract);
      if (payload.contract.status === 'signed') setIsSigned(true);
      if (payload.quote) setQuote(payload.quote);
    } catch {
      setError('Failed to load contract.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSign() {
    if (!signerName.trim() || !agreed || !esignConsent || !contract) return;
    setIsSubmitting(true);

    try {
      const termsVersion = contract.contract_type === 'msa' ? CONTRACT_VERSION : ADDENDUM_VERSION;
      const { data, error: err } = await supabase.rpc('contract_sign' as never, {
        p_contract_id: contract.id,
        p_signer_name: signerName.trim(),
        p_signer_email: signerEmail.trim() || null,
        p_terms_version: termsVersion,
        p_policy_version: POLICY_VERSION,
        p_user_agent: navigator.userAgent,
      } as never);
      const result = data as unknown as { ok: boolean; code?: string } | null;

      if (err || !result?.ok) {
        setError(result?.code === 'expired'
          ? 'This contract link has expired. Please contact us for a new one.'
          : 'Failed to sign contract. Please try again.');
        return;
      }

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
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Contract Signed!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for signing. You'll receive a confirmation shortly.
            </p>
            <Badge variant="default">Signed Successfully</Badge>
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
          {contract?.contract_version && (
            <p className="text-xs text-muted-foreground mt-1">
              Version {contract.contract_version}
            </p>
          )}
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

        {/* E-Sign Consent & Signature */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Electronic Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* E-Sign Consent Block */}
            <div className="rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground text-sm mb-2">Consent to Electronic Records & Signatures</p>
              <p>{ESIGN_CONSENT.en}</p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="esign-consent"
                checked={esignConsent}
                onCheckedChange={(c) => setEsignConsent(c === true)}
              />
              <label htmlFor="esign-consent" className="text-sm leading-relaxed cursor-pointer">
                I consent to sign this agreement electronically and to receive records electronically.
              </label>
            </div>

            {/* Signer Info */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name (as signature)</label>
                <Input
                  placeholder="Type your full legal name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email (optional, for confirmation)</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                />
              </div>
            </div>

            {signerName && (
              <div className="p-4 border rounded-lg bg-muted/20 text-center">
                <p className="font-serif text-2xl italic text-foreground">{signerName}</p>
                <p className="text-xs text-muted-foreground mt-1">Electronic Signature</p>
              </div>
            )}

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
              disabled={!signerName.trim() || !agreed || !esignConsent || isSubmitting}
              onClick={handleSign}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing...</>
              ) : (
                'Sign Contract'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing, you agree to the service terms (v{POLICY_VERSION}). A copy will be sent to you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
