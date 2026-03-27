import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function ProvidersPage() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Provider Companies</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Provider Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No providers registered yet. Providers will appear here after onboarding via the marketplace.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
