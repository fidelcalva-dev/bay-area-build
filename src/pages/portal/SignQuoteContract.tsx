import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, PenTool, Keyboard, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { ESIGN_CONSENT, POLICY_VERSION } from "@/lib/policyLanguage";

export default function SignQuoteContract() {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get("id");

  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signature state
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [esignConsent, setEsignConsent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (contractId) fetchContract();
  }, [contractId]);

  async function fetchContract() {
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("quote_contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (err || !data) {
        setError("Contract not found or has expired.");
        return;
      }

      setContract(data);
      if (data.status === "signed") setIsSigned(true);
    } catch {
      setError("Failed to load contract.");
    } finally {
      setIsLoading(false);
    }
  }

  // Canvas drawing handlers
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const pos = "touches" in e
      ? { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      : { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const pos = "touches" in e
      ? { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      : { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawnSignature(true);
  }, []);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  }

  const hasSignature = signatureMode === "draw" ? hasDrawnSignature : typedSignature.trim().length > 0;
  const canSubmit = hasSignature && esignConsent && agreedToTerms;

  async function handleApprove() {
    if (!canSubmit || !contractId) return;
    setIsSubmitting(true);

    try {
      let signatureData: string;
      let signatureType: "drawn" | "typed";

      if (signatureMode === "draw") {
        signatureData = canvasRef.current?.toDataURL("image/png") || "";
        signatureType = "drawn";
      } else {
        signatureData = typedSignature.trim();
        signatureType = "typed";
      }

      const now = new Date().toISOString();

      const { error: err } = await supabase
        .from("quote_contracts")
        .update({
          status: "signed",
          signature_data: signatureData,
          signature_type: signatureType,
          signed_at: now,
        })
        .eq("id", contractId);

      if (err) throw err;

      // Record document acceptance for version tracking
      if (contract?.customer_id) {
        await supabase
          .from('document_acceptances' as 'orders')
          .insert({
            customer_id: contract.customer_id,
            contract_id: contractId,
            document_type: 'quote_contract',
            version_code: POLICY_VERSION,
            signer_name: signatureType === 'typed' ? signatureData : contract.customer_name,
            delivery_method: 'web_link',
            electronic_consent_given: true,
            electronic_consent_at: now,
            user_agent: navigator.userAgent,
          } as never);
      }

      // Log timeline event
      if (contract?.customer_id) {
        await supabase.from('timeline_events').insert({
          entity_type: 'CUSTOMER' as const,
          entity_id: contract.customer_id,
          customer_id: contract.customer_id,
          event_type: 'SYSTEM' as const,
          event_action: 'COMPLETED' as const,
          summary: `Quote contract signed by ${contract.customer_name}`,
          details_json: {
            contract_id: contractId,
            quote_id: contract.quote_id,
            policy_version: POLICY_VERSION,
            event: 'QUOTE_CONTRACT_SIGNED',
          },
        });
      }

      setIsSigned(true);
    } catch {
      alert("Failed to submit signature. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Contract Not Found</h1>
          <p className="text-gray-500">{error || "This contract link is invalid."}</p>
        </div>
      </div>
    );
  }

  if (isSigned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4 max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Contract Approved!</h1>
          <p className="text-gray-600">
            Thank you, {contract.customer_name}. Your contract has been signed successfully.
            We will proceed with scheduling your service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">CalSan Dumpsters</h1>
          <p className="text-gray-500 text-sm mt-1">Service Agreement</p>
        </div>

        {/* Contract Content */}
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Service Contract</h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Customer:</span>
              <p className="font-medium">{contract.customer_name}</p>
            </div>
            {contract.service_address && (
              <div>
                <span className="text-gray-500">Address:</span>
                <p className="font-medium">{contract.service_address}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Dumpster Size:</span>
              <p className="font-medium">{contract.dumpster_size}</p>
            </div>
            <div>
              <span className="text-gray-500">Material:</span>
              <p className="font-medium">{contract.material_type}</p>
            </div>
            <div>
              <span className="text-gray-500">Rental Period:</span>
              <p className="font-medium">{contract.rental_days} days</p>
            </div>
            <div>
              <span className="text-gray-500">Total Price:</span>
              <p className="font-bold text-lg text-green-700">${Number(contract.price).toFixed(2)}</p>
            </div>
          </div>

          {/* Terms */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Terms & Conditions</h3>
            <div className="text-sm text-gray-700 whitespace-pre-line max-h-64 overflow-y-auto bg-gray-50 p-4 rounded border">
              {contract.terms_content}
            </div>
          </div>
        </div>

        {/* E-Sign Consent & Signature Section */}
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Electronic Signature</h2>

          {/* UETA/E-SIGN Consent Block */}
          <div className="rounded-lg border bg-gray-50 p-4 text-xs text-gray-600 leading-relaxed">
            <p className="font-medium text-gray-900 text-sm mb-2">Consent to Electronic Records & Signatures</p>
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

          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-terms"
              checked={agreedToTerms}
              onCheckedChange={(c) => setAgreedToTerms(c === true)}
            />
            <label htmlFor="agree-terms" className="text-sm leading-relaxed cursor-pointer">
              I agree to the terms and conditions above. I understand this is a legally binding electronic signature.
            </label>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={signatureMode === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => setSignatureMode("draw")}
            >
              <PenTool className="w-4 h-4 mr-1" /> Draw
            </Button>
            <Button
              variant={signatureMode === "type" ? "default" : "outline"}
              size="sm"
              onClick={() => setSignatureMode("type")}
            >
              <Keyboard className="w-4 h-4 mr-1" /> Type
            </Button>
          </div>

          {signatureMode === "draw" ? (
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={160}
                  className="w-full h-40 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawnSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-300 text-lg">Sign here</p>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearCanvas}>
                <Eraser className="w-4 h-4 mr-1" /> Clear
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Type your full name as signature..."
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                className="text-lg"
              />
              {typedSignature && (
                <div className="border rounded-lg p-4 bg-white">
                  <p className="text-2xl italic font-serif text-gray-800">{typedSignature}</p>
                </div>
              )}
            </div>
          )}

          {/* Approve Button */}
          <Button
            className="w-full h-12 text-lg"
            disabled={!canSubmit || isSubmitting}
            onClick={handleApprove}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {isSubmitting ? "Submitting..." : "Approve & Sign Contract"}
          </Button>

          {!canSubmit && (
            <p className="text-sm text-red-500 text-center">
              {!esignConsent || !agreedToTerms
                ? "Please accept the consent and terms above."
                : "Please sign above before approving the contract."}
            </p>
          )}

          <p className="text-xs text-center text-gray-500">
            By signing, you agree to the service terms (v{POLICY_VERSION}). A copy will be sent to you.
          </p>
        </div>
      </div>
    </div>
  );
}
