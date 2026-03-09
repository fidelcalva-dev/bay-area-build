import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'customer' | 'dispatcher' | 'finance' | 'driver' | 'sales' | 'owner_operator' | 'system_admin' | 'ops_admin' | 'finance_admin' | 'sales_admin' | 'read_only_admin' | 'cs' | 'cs_agent' | 'billing_specialist' | 'executive';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isDispatcher: boolean;
  isFinance: boolean;
  isCustomer: boolean;
  isSales: boolean;
  isDriver: boolean;
  isOwnerOperator: boolean;
  isCS: boolean;
  roles: AppRole[];
  isLoading: boolean;
  driverId: string | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isDispatcher: false,
    isFinance: false,
    isCustomer: false,
    isSales: false,
    isDriver: false,
    isOwnerOperator: false,
    isCS: false,
    roles: [],
    isLoading: true,
    driverId: null,
  });

useEffect(() => {
    let isMounted = true;

    const fetchRoles = async (user: User, retries = 3) => {
      try {
        // Fetch all roles for this user
        const { data: rolesData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        // Retry on network errors (with exponential backoff)
        if (error && retries > 0) {
          await new Promise(r => setTimeout(r, 1500 * (4 - retries)));
          return fetchRoles(user, retries - 1);
        }

        let roles = (rolesData?.map((r) => r.role as AppRole) || []);

        // FALLBACK: If role fetch failed completely but this is the owner account,
        // grant temporary admin access so they're never locked out
        if (roles.length === 0 && error) {
          const ownerEmails = ['fidelcalva@gmail.com'];
          if (user.email && ownerEmails.includes(user.email.toLowerCase())) {
            roles = ['admin'] as AppRole[];
            console.warn('[Auth] Owner fallback: granting temporary admin access due to network error');
          }
        }

        // Check if user is linked to a driver (non-blocking)
        let driverId: string | null = null;
        if (roles.includes('driver') || roles.includes('owner_operator')) {
          try {
            const { data: driverData } = await supabase
              .from('drivers')
              .select('id')
              .eq('user_id', user.id)
              .single();
            driverId = driverData?.id || null;
          } catch {
            // Driver lookup is non-critical — don't block role assignment
            console.warn('[Auth] Driver lookup failed, continuing with role assignment');
          }
        }

        if (isMounted) {
          setState({
            user,
            isAdmin: roles.includes('admin'),
            isDispatcher: roles.includes('dispatcher'),
            isFinance: roles.includes('finance'),
            isCustomer: roles.includes('customer'),
            isSales: roles.includes('sales'),
            isDriver: roles.includes('driver'),
            isOwnerOperator: roles.includes('owner_operator'),
            isCS: roles.includes('cs') || roles.includes('cs_agent'),
            roles,
            isLoading: false,
            driverId,
          });
        }
      } catch (error) {
        // Even on total failure, check owner fallback
        if (isMounted) {
          const ownerEmails = ['fidelcalva@gmail.com'];
          if (user.email && ownerEmails.includes(user.email.toLowerCase())) {
            console.warn('[Auth] Owner fallback on catch: granting temporary admin');
            setState({
              user,
              isAdmin: true,
              isDispatcher: false,
              isFinance: false,
              isCustomer: false,
              isSales: false,
              isDriver: false,
              isOwnerOperator: false,
              isCS: false,
              roles: ['admin'] as AppRole[],
              isLoading: false,
              driverId: null,
            });
          } else {
            setState((prev) => ({
              ...prev,
              isLoading: false,
            }));
          }
        }
      }
    };

    // Listener for ONGOING auth changes (does NOT control isLoading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        const user = session?.user ?? null;

        // Handle token expiry / sign out — soft redirect
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          setState(prev => ({
            ...prev,
            user: null,
            isAdmin: false,
            isDispatcher: false,
            isFinance: false,
            isDriver: false,
            isSales: false,
            isCS: false,
            isBilling: false,
            isExecutive: false,
            role: null,
            isLoading: false,
          }));
          return;
        }

        // Update session but don't touch isLoading
        if (user) {
          // Dispatch after callback completes to avoid deadlock
          setTimeout(() => {
            if (isMounted) fetchRoles(user);
          }, 0);
        }
      }
    );

    // INITIAL load (controls isLoading)
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        const user = session?.user ?? null;

        // Fetch role BEFORE setting loading false
        if (user) {
          await fetchRoles(user);
        } else {
          setState({
            user: null,
            isAdmin: false,
            isDispatcher: false,
            isFinance: false,
            isCustomer: false,
            isSales: false,
            isDriver: false,
            isOwnerOperator: false,
            isCS: false,
            roles: [],
            isLoading: false,
            driverId: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (...checkRoles: AppRole[]) => {
    return checkRoles.some((r) => state.roles.includes(r));
  };

  // Check if user can access admin portal (any staff role)
  const canAccessAdmin = () => {
    return state.isAdmin || state.isDispatcher || state.isFinance || state.isSales || state.isCS;
  };

  // Check if user can access driver app
  const canAccessDriver = () => {
    return state.isDriver || state.isOwnerOperator || state.isAdmin;
  };

  // Get primary role for routing
  const getPrimaryRole = (): AppRole | null => {
    if (state.isAdmin) return 'admin';
    if (state.isSales) return 'sales';
    if (state.isCS) return 'cs';
    if (state.isDispatcher) return 'dispatcher';
    if (state.isFinance) return 'finance';
    if (state.isOwnerOperator) return 'owner_operator';
    if (state.isDriver) return 'driver';
    if (state.isCustomer) return 'customer';
    return null;
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    hasAnyRole,
    canAccessAdmin,
    canAccessDriver,
    getPrimaryRole,
  };
}
