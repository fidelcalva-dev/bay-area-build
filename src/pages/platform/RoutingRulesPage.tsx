import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoutingRulesPage() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Routing Rules</h1>
        <Card>
          <CardHeader><CardTitle>Lead Routing Configuration</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Configure service match, geo match, exclusive territory, round-robin, and priority scoring rules here.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
