import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS_INFO } from "@/lib/seo";
import logoCalsan from "@/assets/logo-calsan.jpeg";

type Step = "phone" | "otp";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendOTP, verifyOTP } = useCustomerAuth();
  
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value);
    setPhone(formatted);
    setError("");
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await sendOTP(digits);

    if (result.success) {
      setStep("otp");
      toast({
        title: "Code Sent",
        description: "Check your phone for the 6-digit code",
      });
      // Dev mode: show code in console
      if (result.devCode) {
        console.log("DEV MODE - OTP Code:", result.devCode);
      }
    } else {
      setError(result.error || "Failed to send code");
    }

    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await verifyOTP(phone.replace(/\D/g, ""), otp);

    if (result.success) {
      toast({
        title: "Welcome!",
        description: "You're now logged in",
      });
      navigate("/portal/dashboard");
    } else {
      setError(result.error || "Invalid code");
      setOtp("");
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setOtp("");
    setError("");
    setIsLoading(true);
    
    const result = await sendOTP(phone.replace(/\D/g, ""));
    
    if (result.success) {
      toast({
        title: "New Code Sent",
        description: "Check your phone for the new 6-digit code",
      });
      if (result.devCode) {
        console.log("DEV MODE - OTP Code:", result.devCode);
      }
    } else {
      setError(result.error || "Failed to resend code");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={logoCalsan} 
            alt="Calsan Dumpsters" 
            className="h-16 w-auto mx-auto rounded-xl shadow-lg mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
          <p className="text-gray-500 text-sm">Track orders & manage your account</p>
        </div>

        <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900">
              {step === "phone" ? "Sign In" : "Enter Code"}
            </CardTitle>
            <CardDescription>
              {step === "phone" 
                ? "We'll text you a 6-digit code to verify your phone"
                : `Enter the code sent to ${phone}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={handlePhoneChange}
                    className="pl-10 border-border focus:border-primary focus:ring-primary"
                    autoComplete="tel"
                  />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/30"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 sr-only">Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/30"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="mr-2 w-4 h-4" />
                      Verify
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Change number
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="text-primary hover:text-primary/80 font-medium">
                  Call {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <KeyRound className="w-3 h-3" /> Secure Login
          </span>
          <span>•</span>
          <span>No password needed</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
