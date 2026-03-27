import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlatformQAPage() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Platform QA</h1>
        <Card>
          <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Multi-tenant health monitoring, RLS policy checks, and data isolation verification.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
