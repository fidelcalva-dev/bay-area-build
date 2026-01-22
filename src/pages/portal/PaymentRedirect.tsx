import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logoCalsan from "@/assets/logo-calsan.jpeg";

// Page that auto-submits to Accept Hosted form
export default function PaymentRedirect() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token || !paymentId) {
      setError("Invalid payment link. Please contact support.");
      return;
    }

    // Auto-submit after a brief delay to show loading state
    const timer = setTimeout(() => {
      if (formRef.current) {
        setIsSubmitting(true);
        formRef.current.submit();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [token, paymentId]);

  // Determine form URL based on environment (sandbox vs production)
  // For now, using sandbox. In production, this would be https://accept.authorize.net/payment/payment
  const formPostUrl = "https://test.authorize.net/payment/payment";

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Link Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/portal")}>Go to Portal</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center">
          <img src={logoCalsan} alt="Calsan" className="h-16 mx-auto mb-6 rounded-lg" />
          <div className="w-12 h-12 mx-auto mb-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {isSubmitting ? "Redirecting to Secure Payment..." : "Preparing Payment..."}
          </h2>
          <p className="text-muted-foreground">
            You will be redirected to the secure Authorize.Net payment page.
          </p>
        </CardContent>
      </Card>

      {/* Hidden form for Accept Hosted redirect */}
      {token && (
        <form
          ref={formRef}
          method="POST"
          action={formPostUrl}
          target="_self"
          style={{ display: "none" }}
        >
          <input type="hidden" name="token" value={token} />
        </form>
      )}
    </div>
  );
}
