import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import logoCalsan from "@/assets/logo-calsan.jpeg";

type PaymentStatus = "loading" | "success" | "failed" | "unknown";

interface PaymentDetails {
  amount: number;
  transactionId?: string;
  paymentType: string;
  orderId: string;
  newBalance?: number;
}

const PaymentComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const transactionId = searchParams.get("transId");
  const responseCode = searchParams.get("response_code");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId || !paymentId) {
        setStatus("unknown");
        setError("Missing payment information");
        return;
      }

      try {
        // Check payment status in database
        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .select("*")
          .eq("id", paymentId)
          .single();

        if (paymentError || !payment) {
          setStatus("unknown");
          setError("Payment not found");
          return;
        }

        // Get order details for balance
        const { data: order } = await supabase
          .from("orders")
          .select("balance_due, payment_status")
          .eq("id", orderId)
          .single();

        setDetails({
          amount: payment.amount,
          transactionId: payment.transaction_id || transactionId || undefined,
          paymentType: payment.payment_type,
          orderId: orderId,
          newBalance: order?.balance_due || 0,
        });

        // Check if payment was successful
        if (payment.status === "captured" || payment.status === "settled") {
          setStatus("success");
        } else if (payment.status === "failed") {
          setStatus("failed");
          setError(payment.response_message || "Payment was declined");
        } else if (responseCode === "1") {
          // AuthNet returned success, update our records
          setStatus("success");
          
          // The webhook should handle this, but we can poll for a bit
          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            const { data: updatedPayment } = await supabase
              .from("payments")
              .select("status, transaction_id")
              .eq("id", paymentId)
              .single();
            
            if (updatedPayment?.status === "captured" || attempts >= 5) {
              clearInterval(pollInterval);
              if (updatedPayment?.transaction_id) {
                setDetails(prev => prev ? { ...prev, transactionId: updatedPayment.transaction_id } : prev);
              }
            }
          }, 2000);
        } else if (responseCode === "2" || responseCode === "3") {
          setStatus("failed");
          setError("Payment was declined. Please try again.");
        } else {
          // Still pending - webhook hasn't processed yet
          setStatus("loading");
          
          // Poll for status update
          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            const { data: updatedPayment } = await supabase
              .from("payments")
              .select("status, transaction_id, response_message")
              .eq("id", paymentId)
              .single();
            
            if (updatedPayment) {
              if (updatedPayment.status === "captured" || updatedPayment.status === "settled") {
                setStatus("success");
                setDetails(prev => prev ? { ...prev, transactionId: updatedPayment.transaction_id || undefined } : prev);
                clearInterval(pollInterval);
              } else if (updatedPayment.status === "failed") {
                setStatus("failed");
                setError(updatedPayment.response_message || "Payment failed");
                clearInterval(pollInterval);
              } else if (attempts >= 10) {
                // Timeout after ~20 seconds
                setStatus("unknown");
                setError("Payment status unknown. Please check your order for confirmation.");
                clearInterval(pollInterval);
              }
            }
          }, 2000);
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setStatus("unknown");
        setError("Unable to verify payment status");
      }
    };

    checkPaymentStatus();
  }, [orderId, paymentId, transactionId, responseCode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/portal" className="flex items-center gap-3">
              <img src={logoCalsan} alt="Calsan" className="h-10 w-auto rounded-lg" />
              <span className="font-bold text-xl text-slate-800">Calsan</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            {status === "loading" && (
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            )}
            {(status === "failed" || status === "unknown") && (
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
            <CardTitle className="text-2xl">
              {status === "loading" && "Processing Payment..."}
              {status === "success" && "Payment Successful!"}
              {status === "failed" && "Payment Failed"}
              {status === "unknown" && "Payment Status Unknown"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === "loading" && (
              <p className="text-center text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            )}

            {status === "success" && details && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Thank you! Your payment has been processed successfully.
                </p>
                
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold text-green-600">${details.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Type</span>
                    <span className="capitalize">{details.paymentType}</span>
                  </div>
                  {details.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono text-sm">{details.transactionId}</span>
                    </div>
                  )}
                  {details.newBalance !== undefined && (
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-muted-foreground">Remaining Balance</span>
                      <span className={details.newBalance <= 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                        ${details.newBalance.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  A receipt has been sent to your phone and email.
                </p>
              </div>
            )}

            {(status === "failed" || status === "unknown") && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  {error || "Something went wrong with your payment."}
                </p>
                {status === "failed" && (
                  <p className="text-center text-sm text-muted-foreground">
                    Please try again or contact support if the issue persists.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              {orderId && (
                <Button 
                  onClick={() => navigate(`/portal/orders/${orderId}`)}
                  className="w-full"
                  variant={status === "success" ? "default" : "outline"}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Order Details
                </Button>
              )}
              <Button 
                onClick={() => navigate("/portal")}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PaymentComplete;
