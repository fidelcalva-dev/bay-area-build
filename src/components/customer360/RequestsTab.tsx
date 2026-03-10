import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TimelineEvent } from '@/lib/timelineService';

interface Props {
  timelineEvents: TimelineEvent[];
  isLoading: boolean;
}

const REQUEST_TYPES = ['PICKUP_REQUEST', 'SWAP_REQUEST', 'REPLACEMENT_REQUEST', 'EXTENSION_REQUEST', 'SERVICE_REQUEST'];

export function RequestsTab({ timelineEvents, isLoading }: Props) {
  const requests = timelineEvents.filter(e => 
    REQUEST_TYPES.some(rt => e.event_type.includes(rt)) || 
    e.event_type.includes('REQUEST') ||
    e.summary?.toLowerCase().includes('request') ||
    e.summary?.toLowerCase().includes('pickup') ||
    e.summary?.toLowerCase().includes('swap')
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading requests...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Service Requests</CardTitle>
        <CardDescription>Pickup, swap, replacement, and extension requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No service requests found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map(req => {
              const details = req.details_json as Record<string, unknown> | null;
              const status = (details?.status as string) || 'pending';
              return (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : status === 'cancelled' ? (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{req.summary}</p>
                      <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={status === 'completed' ? 'default' : status === 'cancelled' ? 'destructive' : 'secondary'}>
                    {status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
