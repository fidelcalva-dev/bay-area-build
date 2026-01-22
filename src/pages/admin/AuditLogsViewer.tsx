import { useState, useEffect } from 'react';
import { 
  History, Search, Filter, ChevronDown, User, 
  Clock, FileText, Settings, DollarSign, Users,
  Loader2, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PermissionGate } from '@/components/admin/config';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  before_data: any;
  after_data: any;
  changes_summary: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  status_change: 'bg-amber-500',
  config_edit: 'bg-purple-500',
  approve: 'bg-emerald-500',
  reject: 'bg-rose-500',
};

const ENTITY_ICONS: Record<string, typeof FileText> = {
  order: FileText,
  user_roles: Users,
  config_settings: Settings,
  city_rates: DollarSign,
  heavy_pricing: DollarSign,
  toll_surcharges: DollarSign,
};

export default function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter, page]);

  async function fetchLogs() {
    setIsLoading(true);
    
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (actionFilter !== 'all') {
      query = query.eq('action', actionFilter);
    }
    if (entityFilter !== 'all') {
      query = query.eq('entity_type', entityFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
    } else {
      setLogs(data || []);
    }
    setIsLoading(false);
  }

  function exportCSV() {
    const csvContent = [
      ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User Email', 'Summary'].join(','),
      ...logs.map((log) => [
        log.created_at,
        log.action,
        log.entity_type,
        log.entity_id || '',
        log.user_email || '',
        `"${(log.changes_summary || '').replace(/"/g, '""')}"`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  }

  const filteredLogs = logs.filter((log) =>
    searchTerm === '' ||
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.changes_summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueEntities = [...new Set(logs.map((l) => l.entity_type))];

  return (
    <PermissionGate module="audit" action="read">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">
              View all configuration changes and administrative actions
            </p>
          </div>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, ID, or summary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {uniqueEntities.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const Icon = ENTITY_ICONS[log.entity_type] || FileText;
              const isExpanded = expandedLog === log.id;

              return (
                <Collapsible
                  key={log.id}
                  open={isExpanded}
                  onOpenChange={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <CardContent className="flex items-center justify-between py-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${ACTION_COLORS[log.action] || 'bg-gray-500'} text-white text-xs`}>
                                {log.action.replace(/_/g, ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {log.entity_type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm">
                              {log.changes_summary || `${log.action} on ${log.entity_type}`}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.user_email || 'System'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </CardContent>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t px-6 py-4 bg-muted/30">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Before</p>
                            <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-48 border">
                              {JSON.stringify(log.before_data, null, 2) || 'N/A'}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">After</p>
                            <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-48 border">
                              {JSON.stringify(log.after_data, null, 2) || 'N/A'}
                            </pre>
                          </div>
                        </div>
                        {log.entity_id && (
                          <p className="text-xs text-muted-foreground mt-3">
                            Entity ID: {log.entity_id}
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}

            {filteredLogs.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No audit logs found matching your filters.
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={logs.length < PAGE_SIZE}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
