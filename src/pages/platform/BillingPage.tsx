import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BillingPage() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Billing</h1>
        <Card>
          <CardHeader><CardTitle>Billing Dashboard</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Platform invoices, lead fees, and subscription billing will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
