import { useState, useEffect } from 'react';
import { 
  Activity, Filter, RefreshCw, Loader2, 
  CheckCircle2, XCircle, Clock, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface GoogleEventLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export default function AdminGoogleLogs() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<GoogleEventLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('');

  async function loadLogs() {
    setIsLoading(true);
    try {
      let query = supabase
        .from('google_events_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filterAction !== 'all') {
        query = query.eq('action_type', filterAction as 'SEND_EMAIL' | 'CREATE_MEET' | 'CREATE_DRIVE_FOLDER' | 'POST_CHAT_MESSAGE');
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as 'SUCCESS' | 'FAILED' | 'DRY_RUN' | 'PENDING');
      }
      if (filterEntity) {
        query = query.or(`entity_type.ilike.%${filterEntity}%,entity_id.ilike.%${filterEntity}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data as GoogleEventLog[]);
    } catch (err) {
      console.error('Failed to load logs:', err);
      toast({ title: 'Failed to load logs', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [filterAction, filterStatus]);

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'SUCCESS').length,
    dryRun: logs.filter(l => l.status === 'DRY_RUN').length,
    failed: logs.filter(l => l.status === 'FAILED').length,
  };

  const actionTypes = [...new Set(logs.map(l => l.action_type))];

  function getStatusIcon(status: string) {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'DRY_RUN':
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-500">{status}</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">{status}</Badge>;
      case 'DRY_RUN':
        return <Badge variant="secondary">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Google Integration Logs
          </h1>
          <p className="text-muted-foreground">Audit trail of all Google Workspace actions</p>
        </div>
        <Button onClick={loadLogs} variant="outline" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.dryRun}</div>
            <p className="text-sm text-muted-foreground">DRY_RUN</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-48">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="SEND_EMAIL">Send Email</SelectItem>
                  <SelectItem value="CREATE_MEET">Create Meet</SelectItem>
                  <SelectItem value="CREATE_DRIVE_FOLDER">Create Folder</SelectItem>
                  <SelectItem value="POST_CHAT">Post Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="DRY_RUN">DRY_RUN</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filter by entity (lead, order, invoice...)"
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
          <CardDescription>Showing last 200 events</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Duration</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No events logged yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.created_at), 'MMM d, h:mm:ss a')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.entity_type && log.entity_id
                            ? `${log.entity_type}/${log.entity_id.substring(0, 8)}...`
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.duration_ms ? `${log.duration_ms}ms` : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-destructive max-w-xs truncate">
                          {log.error_message || '—'}
                        </TableCell>
                      </TableRow>
                    ))
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
