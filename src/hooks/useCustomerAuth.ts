import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomerSession {
  phone: string;
  customer: {
    id: string;
    company_name: string | null;
    customer_type: string;
    billing_email: string | null;
  } | null;
}

interface UseCustomerAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  session: CustomerSession | null;
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string; devCode?: string }>;
  verifyOTP: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const SESSION_KEY = 'calsan_customer_session';

export function useCustomerAuth(): UseCustomerAuthReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<CustomerSession | null>(null);

  const validateSession = useCallback(async () => {
    const storedToken = localStorage.getItem(SESSION_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('validate-session', {
        body: { session_token: storedToken },
      });

      if (error || !data?.valid) {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      } else {
        setSession({
          phone: data.phone,
          customer: data.customer,
        });
      }
    } catch (err) {
      console.error('Session validation error:', err);
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const sendOTP = async (phone: string): Promise<{ success: boolean; error?: string; devCode?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone },
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to send code' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: true, devCode: data?.dev_code };
    } catch (err) {
      console.error('Send OTP error:', err);
      return { success: false, error: 'Failed to send code. Please try again.' };
    }
  };

  const verifyOTP = async (phone: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, code },
      });

      if (error) {
        return { success: false, error: error.message || 'Verification failed' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      if (data?.session_token) {
        localStorage.setItem(SESSION_KEY, data.session_token);
        setSession({
          phone: phone,
          customer: data.customer,
        });
        return { success: true };
      }

      return { success: false, error: 'No session received' };
    } catch (err) {
      console.error('Verify OTP error:', err);
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return {
    isLoading,
    isAuthenticated: !!session,
    session,
    sendOTP,
    verifyOTP,
    logout,
  };
}
