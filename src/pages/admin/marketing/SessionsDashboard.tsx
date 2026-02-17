import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Session {
  id: string;
  visitor_id: string;
  started_at: string;
  landing_url: string | null;
  referrer_url: string | null;
  utm_json: Record<string, string> | null;
  gclid: string | null;
  device_json: Record<string, string> | null;
  timezone: string | null;
  consent_status: string;
}

export default function SessionsDashboard() {
  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['visitor-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitor_sessions' as never)
        .select('*')
        .order('started_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as Session[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">All visitor sessions with source &amp; device info</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Landing Page</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>UTM</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Timezone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions?.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-xs">{s.visitor_id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(s.started_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {s.landing_url || '—'}
                      </TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate">
                        {s.referrer_url || 'Direct'}
                      </TableCell>
                      <TableCell>
                        {s.utm_json?.utm_source ? (
                          <Badge variant="outline" className="text-xs">
                            {s.utm_json.utm_source}
                            {s.utm_json.utm_campaign ? ` / ${s.utm_json.utm_campaign}` : ''}
                          </Badge>
                        ) : s.gclid ? (
                          <Badge variant="default" className="text-xs">Google Ads</Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {(s.device_json as Record<string, string>)?.device_type || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{s.timezone || '—'}</TableCell>
                    </TableRow>
                  ))}
                  {(!sessions || sessions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No sessions tracked yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
