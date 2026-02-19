import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CustomerActivationStatus } from '@/components/customers/CustomerActivationStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

interface Props {
  phone?: string | null;
  email?: string | null;
}

export function LeadActivationStatus({ phone, email }: Props) {
  const { data: customer } = useQuery({
    queryKey: ['lead-customer-activation', phone, email],
    queryFn: async () => {
      if (!phone && !email) return null;

      // Try to find linked customer by phone
      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length >= 7) {
          const { data } = await supabase
            .from('customers')
            .select('id, activation_status, activation_attempts, phone, billing_email')
            .ilike('phone', `%${cleanPhone}`)
            .limit(1)
            .maybeSingle();
          if (data) return data;
        }
      }

      // Try by email
      if (email) {
        const { data } = await supabase
          .from('customers')
          .select('id, activation_status, activation_attempts, phone, billing_email')
          .ilike('billing_email', email)
          .limit(1)
          .maybeSingle();
        if (data) return data;
      }

      return null;
    },
    enabled: !!(phone || email),
  });

  if (!customer) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Portal Activation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerActivationStatus
          customerId={customer.id}
          activationStatus={customer.activation_status}
          activationAttempts={customer.activation_attempts}
          phone={customer.phone}
          email={customer.billing_email}
        />
      </CardContent>
    </Card>
  );
}
