import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Eye, BarChart3, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface VisitorProfile {
  id: string;
  first_seen_at: string;
  last_seen_at: string;
  visit_count: number;
  total_sessions: number;
  total_pageviews: number;
  first_referrer: string | null;
  last_referrer: string | null;
  last_known_city: string | null;
  last_known_region: string | null;
  device_summary: string | null;
  consent_status: string;
}

export default function VisitorsDashboard() {
  const [search, setSearch] = useState('');

  const { data: visitors, isLoading, refetch } = useQuery({
    queryKey: ['visitor-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitor_profiles' as never)
        .select('*')
        .order('last_seen_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as VisitorProfile[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['visitor-stats'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('visitor_profiles' as never)
        .select('id, visit_count, total_sessions, total_pageviews')
        .limit(1000);
      const all = (profiles || []) as unknown as VisitorProfile[];
      const total = all.length;
      const returning = all.filter((v) => v.visit_count > 1).length;
      const totalSessions = all.reduce((s, v) => s + (v.total_sessions || 0), 0);
      const totalPageviews = all.reduce((s, v) => s + (v.total_pageviews || 0), 0);
      return { total, returning, totalSessions, totalPageviews };
    },
  });

  const filtered = visitors?.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.id.includes(q) ||
      v.last_known_city?.toLowerCase().includes(q) ||
      v.first_referrer?.toLowerCase().includes(q) ||
      v.device_summary?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visitor Intelligence</h1>
          <p className="text-muted-foreground">Privacy-safe visitor tracking &amp; analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Users className="h-4 w-4" /> Total Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Returning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.returning ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSessions ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Eye className="h-4 w-4" /> Total Pageviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPageviews ?? '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visitors</CardTitle>
            <Input
              placeholder="Search by ID, city, referrer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Pageviews</TableHead>
                    <TableHead>First Seen</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Consent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-xs">{v.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Badge variant={v.visit_count > 1 ? 'default' : 'secondary'}>
                          {v.visit_count}
                        </Badge>
                      </TableCell>
                      <TableCell>{v.total_sessions}</TableCell>
                      <TableCell>{v.total_pageviews}</TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(v.first_seen_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(v.last_seen_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">
                        {v.first_referrer || 'Direct'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{v.device_summary || '—'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            v.consent_status === 'GRANTED'
                              ? 'default'
                              : v.consent_status === 'DENIED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {v.consent_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filtered || filtered.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No visitors tracked yet
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
