import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuditLogPage() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Audit Log</h1>
        <Card>
          <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Cross-tenant audit trail for platform operations, role changes, and routing decisions.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
