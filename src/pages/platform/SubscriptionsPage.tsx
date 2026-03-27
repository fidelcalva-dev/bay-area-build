import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  const { data: plans } = useQuery({
    queryKey: ['platform-plans'],
    queryFn: async () => {
      const { data } = await supabase.from('platform_plans').select('*').order('monthly_price_cents');
      return data ?? [];
    },
  });

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Subscription Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans?.map(p => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.plan_name}</CardTitle>
                <p className="text-2xl font-bold text-primary">${(p.monthly_price_cents / 100).toFixed(0)}/mo</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Lead cap: {p.lead_cap ?? 'Unlimited'}</p>
                <Badge className="mt-2">{p.plan_code}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
