import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Route, CreditCard, Settings } from 'lucide-react';

export default function ProviderDashboard() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
            <Badge variant="outline">Active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Leads This Month', value: '0', icon: Route },
              { label: 'Accepted', value: '0', icon: BarChart3 },
              { label: 'Close Rate', value: '—', icon: BarChart3 },
              { label: 'Monthly Bill', value: '$0', icon: CreditCard },
            ].map(c => (
              <Card key={c.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                  <c.icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold text-foreground">{c.value}</div></CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="leads">
            <TabsList>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="areas">Service Areas</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="leads">
              <Card><CardContent className="pt-6"><p className="text-muted-foreground">No leads delivered yet. Leads will appear here once your subscription is active.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="billing">
              <Card><CardContent className="pt-6"><p className="text-muted-foreground">Billing history and invoices will appear here.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="areas">
              <Card><CardContent className="pt-6"><p className="text-muted-foreground">Configure your service areas, counties, and ZIP codes.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card><CardContent className="pt-6"><p className="text-muted-foreground">Company profile, insurance, license, and notification preferences.</p></CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
