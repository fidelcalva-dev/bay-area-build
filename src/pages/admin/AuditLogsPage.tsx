import { useEffect, useState } from 'react';
import { FileText, Search, Loader2, Filter, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes_summary: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  status_change: 'bg-purple-100 text-purple-800',
  login: 'bg-gray-100 text-gray-800',
  config_change: 'bg-orange-100 text-orange-800',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      toast({ title: 'Error loading logs', description: error.message, variant: 'destructive' });
    } else {
      setLogs(data || []);
    }
    setIsLoading(false);
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.changes_summary?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track all system changes and user actions
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, entity, or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="status_change">Status Change</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="config_change">Config Change</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{log.user_email || 'System'}</p>
                    {log.user_role && (
                      <p className="text-xs text-muted-foreground capitalize">{log.user_role}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
                    {log.action.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium capitalize">{log.entity_type}</p>
                    {log.entity_id && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {log.entity_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {log.changes_summary || '-'}
                </TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
