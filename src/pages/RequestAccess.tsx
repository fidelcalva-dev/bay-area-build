import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, LogOut, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function RequestAccess() {
  const { user, isLoading, signOut, roles, getPrimaryRole } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-create access request on mount
  useEffect(() => {
    if (!user || isLoading || roles.length > 0) return;
    const autoCreate = async () => {
      try {
        // Upsert: only create if no OPEN request exists
        await supabase
          .from('access_requests')
          .upsert(
            { user_id: user.id, email: user.email || '', status: 'OPEN' },
            { onConflict: 'user_id,status' }
          );
      } catch {
        // Silently fail - non-critical
      }
    };
    autoCreate();
  }, [user, isLoading, roles]);

  const handleRequestAccess = async () => {
    setRequesting(true);
    try {
      // Upsert access request
      await supabase
        .from('access_requests')
        .upsert(
          { user_id: user!.id, email: user!.email || '', status: 'OPEN' },
          { onConflict: 'user_id,status' }
        );

      // Also create an internal alert for admins
      await supabase.from('alerts').insert({
        alert_type: 'access_request',
        entity_type: 'user',
        entity_id: user!.id,
        severity: 'info',
        title: 'Role Access Request',
        message: user!.email + ' has requested a role assignment. Please review in Admin > Access Requests.',
      });
      setRequested(true);
      toast({
        title: 'Request Sent',
        description: "An admin has been notified. You will receive access shortly.",
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Could not send request. Please contact your admin directly.',
        variant: 'destructive',
      });
    }
    setRequesting(false);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Force a session refresh to pick up any new role assignments
    await supabase.auth.refreshSession();
    // Small delay to let auth state propagate
    setTimeout(() => {
      setRefreshing(false);
      // Re-check: if roles are now present, the auth listener will update state
      // and RoleRouter will handle redirect
      window.location.href = '/app';
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="max-w-md w-full mx-4 bg-card rounded-2xl shadow-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Account Active — No Role Assigned
        </h1>
        <p className="text-muted-foreground mb-2">
          Your account is active but hasn't been assigned to a department yet.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Logged in as: <strong>{user.email}</strong>
        </p>

        <div className="space-y-3">
          {requested ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Request sent — an admin will assign your role soon.</span>
            </div>
          ) : (
            <Button onClick={handleRequestAccess} disabled={requesting} className="w-full">
              {requesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Notify Admin for Access'
              )}
            </Button>
          )}

          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="w-full">
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Access
              </>
            )}
          </Button>

          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            Return to Home
          </Button>

          <Button variant="ghost" onClick={signOut} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
