import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

export default function TenantsPage() {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['platform-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('*').order('created_at');
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4">
            {tenants?.map(t => (
              <Card key={t.id}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">{t.company_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t.brand_name} · {t.tenant_code}</p>
                  </div>
                  <Badge variant={t.status === 'active' ? 'default' : 'secondary'} className="ml-auto">
                    {t.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-muted-foreground">License:</span> {t.license_number || '—'}</div>
                    <div><span className="text-muted-foreground">Domain:</span> {t.primary_domain || '[ADD_DOMAIN]'}</div>
                    <div><span className="text-muted-foreground">Email:</span> {t.support_email || '[ADD_EMAIL]'}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {t.support_phone || '[ADD_PHONE]'}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
