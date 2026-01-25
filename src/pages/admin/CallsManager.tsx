import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Users,
  Clock,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { formatPhoneDisplay } from '@/lib/phoneUtils';

interface CallStats {
  total: number;
  inbound: number;
  outbound: number;
  missed: number;
  avgDuration: number;
}

export default function CallsManager() {
  const [calls, setCalls] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<CallStats>({
    total: 0,
    inbound: 0,
    outbound: 0,
    missed: 0,
    avgDuration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    direction: 'all',
    search: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch calls
      let query = supabase
        .from('call_events')
        .select(`
          *,
          contact:customers(full_name)
        `)
        .order('started_at', { ascending: false })
        .limit(100);

      if (filters.status !== 'all') {
        query = query.eq('call_status', filters.status as any);
      }
      if (filters.direction !== 'all') {
        query = query.eq('direction', filters.direction as any);
      }

      const { data: callsData } = await query;

      if (callsData) {
        let filtered = callsData as any[];
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = callsData.filter(
            (c: any) =>
              c.from_number?.includes(search) ||
              c.to_number?.includes(search) ||
              c.caller_name?.toLowerCase().includes(search) ||
              c.contact?.full_name?.toLowerCase().includes(search)
          );
        }
        setCalls(filtered);

        // Calculate stats
        const totalDuration = filtered.reduce((sum: number, c: any) => sum + (c.duration_seconds || 0), 0);
        setStats({
          total: filtered.length,
          inbound: filtered.filter((c: any) => c.direction === 'INBOUND').length,
          outbound: filtered.filter((c: any) => c.direction === 'OUTBOUND').length,
          missed: filtered.filter((c: any) => c.call_status === 'MISSED').length,
          avgDuration: filtered.length > 0 ? Math.round(totalDuration / filtered.length) : 0,
        });
      }

      // Fetch agent availability
      const { data: agentsData } = await supabase
        .from('agent_availability')
        .select('*')
        .order('status');

      if (agentsData) {
        setAgents(agentsData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [filters]);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string, direction: string) => {
    if (status === 'MISSED') return <PhoneMissed className="w-4 h-4 text-destructive" />;
    if (status === 'VOICEMAIL') return <Voicemail className="w-4 h-4 text-yellow-500" />;
    if (direction === 'INBOUND') return <PhoneIncoming className="w-4 h-4 text-blue-500" />;
    return <PhoneOutgoing className="w-4 h-4 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      COMPLETED: 'default',
      ANSWERED: 'secondary',
      RINGING: 'outline',
      MISSED: 'destructive',
      VOICEMAIL: 'secondary',
      FAILED: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Call Management</h1>
          <p className="text-muted-foreground">
            Monitor all calls and agent activity
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Phone className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inbound</p>
                <p className="text-2xl font-bold">{stats.inbound}</p>
              </div>
              <PhoneIncoming className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outbound</p>
                <p className="text-2xl font-bold">{stats.outbound}</p>
              </div>
              <PhoneOutgoing className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missed</p>
                <p className="text-2xl font-bold">{stats.missed}</p>
              </div>
              <PhoneMissed className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  agent.status === 'ONLINE'
                    ? 'bg-green-100 text-green-800'
                    : agent.status === 'BUSY'
                    ? 'bg-yellow-100 text-yellow-800'
                    : agent.status === 'AWAY'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    agent.status === 'ONLINE'
                      ? 'bg-green-500'
                      : agent.status === 'BUSY'
                      ? 'bg-yellow-500'
                      : agent.status === 'AWAY'
                      ? 'bg-orange-500'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm font-medium">
                  Agent {agent.user_id.slice(0, 8)}...
                </span>
                <span className="text-xs">({agent.calls_today} calls)</span>
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-muted-foreground text-sm">No agents online</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calls Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Call Log</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                className="w-48"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Select
                value={filters.direction}
                onValueChange={(v) => setFilters({ ...filters, direction: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="INBOUND">Inbound</SelectItem>
                  <SelectItem value="OUTBOUND">Outbound</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="MISSED">Missed</SelectItem>
                  <SelectItem value="VOICEMAIL">Voicemail</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : calls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No calls found
                  </TableCell>
                </TableRow>
              ) : (
                calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      {getStatusIcon(call.call_status, call.direction)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {call.caller_name || call.contact?.full_name || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatPhoneDisplay(call.from_number)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatPhoneDisplay(call.to_number)}
                    </TableCell>
                    <TableCell>{getStatusBadge(call.call_status)}</TableCell>
                    <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(call.started_at), 'MMM d, h:mm a')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
