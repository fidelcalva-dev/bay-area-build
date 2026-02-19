import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertTriangle, ShieldCheck, Phone, Mail } from 'lucide-react';

type Step = 'validating' | 'welcome' | 'otp' | 'password' | 'success' | 'error';

interface CustomerInfo {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  billing_email: string | null;
  phone: string | null;
  customer_type: string;
  has_phone: boolean;
  has_email: boolean;
}

export default function PortalActivate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [step, setStep] = useState<Step>('validating');
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    if (!token) {
      setStep('error');
      setErrorMessage('No activation token provided');
      return;
    }
    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      const { data, error } = await supabase.functions.invoke('validate-activation', {
        body: { token },
      });

      if (error || !data?.valid) {
        setStep('error');
        setErrorMessage(data?.error || 'Invalid or expired activation link');
        return;
      }

      setCustomer({
        ...data.customer,
        has_phone: data.has_phone,
        has_email: data.has_email,
      });

      // Auto-select auth method
      if (data.has_phone) {
        setAuthMethod('otp');
      } else {
        setAuthMethod('password');
      }

      setStep('welcome');
    } catch (err) {
      setStep('error');
      setErrorMessage('Failed to validate activation link');
    }
  }

  async function handleSendOTP() {
    if (!customer?.phone) return;
    setOtpSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: customer.phone },
      });

      if (error || data?.error) {
        toast.error(data?.error || 'Failed to send code');
        return;
      }

      if (data?.dev_code) setDevCode(data.dev_code);
      setStep('otp');
      toast.success('Verification code sent!');
    } catch {
      toast.error('Failed to send verification code');
    } finally {
      setOtpSending(false);
    }
  }

  async function handleVerifyOTP() {
    if (!customer?.phone || otpCode.length !== 6) return;
    setOtpVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: customer.phone, code: otpCode },
      });

      if (error || data?.error) {
        toast.error(data?.error || 'Invalid code');
        return;
      }

      if (data?.session_token) {
        localStorage.setItem('calsan_customer_session', data.session_token);
      }

      // Mark token as activated
      await supabase.functions.invoke('validate-activation', {
        body: { token, action: 'activate' },
      });

      setStep('success');
    } catch {
      toast.error('Verification failed');
    } finally {
      setOtpVerifying(false);
    }
  }

  async function handleCreatePassword() {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!customer?.billing_email) {
      toast.error('No email address available');
      return;
    }

    setCreatingAccount(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: customer.billing_email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/portal',
          data: {
            customer_id: customer.id,
            full_name: customer.contact_name || customer.company_name,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          // Try to sign in instead
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: customer.billing_email,
            password,
          });
          if (signInErr) {
            toast.error('Account exists. Try a different password or use OTP login.');
            return;
          }
        } else {
          toast.error(error.message);
          return;
        }
      }

      // Mark token as activated
      await supabase.functions.invoke('validate-activation', {
        body: { token, action: 'activate' },
      });

      setStep('success');
    } catch {
      toast.error('Failed to create account');
    } finally {
      setCreatingAccount(false);
    }
  }

  if (step === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Validating your activation link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Activation Error</h2>
            <p className="text-muted-foreground text-center">{errorMessage}</p>
            <Button variant="outline" onClick={() => navigate('/portal/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 gap-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-bold">Account Activated!</h2>
            <p className="text-muted-foreground text-center">
              Welcome, {customer?.contact_name || customer?.company_name}! Your account is now active.
            </p>
            <Button onClick={() => navigate('/portal')} className="mt-4">
              Go to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Activate Your Account</CardTitle>
          <CardDescription>
            Welcome{customer?.contact_name ? `, ${customer.contact_name}` : ''}! Set up your portal access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'welcome' && (
            <>
              {/* Auth method selection */}
              {customer?.has_phone && customer?.has_email && (
                <div className="space-y-3">
                  <Label>Choose login method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={authMethod === 'otp' ? 'default' : 'outline'}
                      onClick={() => setAuthMethod('otp')}
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      SMS Code
                    </Button>
                    <Button
                      variant={authMethod === 'password' ? 'default' : 'outline'}
                      onClick={() => setAuthMethod('password')}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email + Password
                    </Button>
                  </div>
                </div>
              )}

              {authMethod === 'otp' && customer?.has_phone ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We'll send a 6-digit code to your phone ending in ...{customer.phone?.slice(-4)}
                  </p>
                  <Button
                    onClick={handleSendOTP}
                    disabled={otpSending}
                    className="w-full"
                  >
                    {otpSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Phone className="h-4 w-4 mr-2" />}
                    Send Verification Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Create a password for {customer?.billing_email}
                  </p>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreatePassword}
                    disabled={creatingAccount || password.length < 8}
                    className="w-full"
                  >
                    {creatingAccount ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Create Account
                  </Button>
                </div>
              )}
            </>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Enter the 6-digit code sent to your phone
              </p>
              {devCode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center text-sm">
                  Dev code: <strong>{devCode}</strong>
                </div>
              )}
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
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
              <Button
                onClick={handleVerifyOTP}
                disabled={otpVerifying || otpCode.length !== 6}
                className="w-full"
              >
                {otpVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Verify & Activate
              </Button>
              <Button variant="ghost" onClick={handleSendOTP} className="w-full text-sm">
                Resend Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
