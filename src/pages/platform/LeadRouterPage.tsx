import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route } from 'lucide-react';

export default function LeadRouterPage() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Lead Router</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="w-5 h-5" /> Routing Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Lead routing engine monitors service match, geo match, subscription status, capacity, SLA, QA score, and exclusivity rights to deliver leads to the best provider.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
