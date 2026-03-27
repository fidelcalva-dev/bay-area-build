import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function CrewToday() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Today's Jobs</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-5 h-5" /> No jobs scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Jobs assigned to you will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
