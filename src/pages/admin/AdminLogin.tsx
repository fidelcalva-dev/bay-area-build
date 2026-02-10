import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, KeyRound } from 'lucide-react';
import { isValidRedirect, getRoleDashboard } from '@/lib/crmLinks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const { user, isLoading, signIn, signUp, canAccessAdmin, canAccessDriver, getPrimaryRole } = useAdminAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Forced password reset state
  const [mustResetPassword, setMustResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const redirectTo = searchParams.get('redirect');

  // Check if user must reset password
  useEffect(() => {
    if (user) {
      supabase
        .from('staff_users')
        .select('must_reset_password')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.must_reset_password) {
            setMustResetPassword(true);
          }
        });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show forced password reset screen
  if (user && mustResetPassword) {
    const handlePasswordReset = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 8) {
        toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast({ title: 'Passwords do not match', variant: 'destructive' });
        return;
      }

      setIsResetting(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: 'Password Reset Failed', description: error.message, variant: 'destructive' });
        setIsResetting(false);
        return;
      }

      // Clear the flag
      await supabase
        .from('staff_users')
        .update({ must_reset_password: false })
        .eq('user_id', user.id);

      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      setMustResetPassword(false);
      setIsResetting(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="max-w-md w-full mx-4 bg-card rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Password Reset Required</h1>
            <p className="text-muted-foreground mt-2">
              You must set a new password before continuing.
            </p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 py-3 h-auto"
                required
                minLength={8}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 py-3 h-auto"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isResetting}>
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Set New Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Redirect authenticated staff to their role-based dashboard (or explicit redirect target)
  if (user && (canAccessAdmin() || canAccessDriver())) {
    const target = redirectTo && isValidRedirect(redirectTo)
      ? redirectTo
      : getRoleDashboard(getPrimaryRole());
    return <Navigate to={target} replace />;
  }

  if (user && !canAccessAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="max-w-md w-full mx-4 bg-card rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have admin privileges. Contact the administrator to request access.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Your account: <strong>{user.email}</strong>
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password);
      if (error) {
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Account Created',
          description: 'Your account has been created. Contact admin to get access.',
        });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="max-w-md w-full mx-4 bg-card rounded-2xl shadow-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Admin Login' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'login' 
              ? 'Sign in to access the pricing admin panel' 
              : 'Create an account to request admin access'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 py-3 h-auto"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 py-3 h-auto"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-primary hover:underline"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
          <p className="text-sm text-muted-foreground">
            <a href="/" className="text-primary hover:underline">
              ← Back to website
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
