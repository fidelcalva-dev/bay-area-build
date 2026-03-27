import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Route, CreditCard } from 'lucide-react';

export default function PlatformDashboard() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Tenants', value: '1', icon: Building2 },
            { label: 'Providers', value: '0', icon: Users },
            { label: 'Leads Routed', value: '0', icon: Route },
            { label: 'MRR', value: '$0', icon: CreditCard },
          ].map(card => (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
