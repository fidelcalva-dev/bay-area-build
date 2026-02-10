import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Monitor, RefreshCw, Send, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InternalAlert {
  id: string;
  event_type: string;
  source: string;
  entity_type: string;
  entity_id: string;
  title: string;
  body_text: string | null;
  links_json: Array<{ label: string; url: string }>;
  dedupe_key: string;
  status: string;
  payload_json: Record<string, unknown> | null;
  created_at: string;
}

interface AlertDelivery {
  id: string;
  alert_id: string;
  channel: string;
  recipient: string;
  status: string;
  provider: string;
  error_message: string | null;
  created_at: string;
}

const statusIcons: Record<string, typeof CheckCircle> = {
  SENT: CheckCircle,
  DRAFT: Clock,
  FAILED: XCircle,
  SKIPPED: AlertTriangle,
};

const statusColors: Record<string, string> = {
  SENT: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  SKIPPED: 'bg-gray-100 text-gray-800',
};

const channelIcons: Record<string, typeof Mail> = {
  EMAIL: Mail,
  CHAT: MessageSquare,
  IN_APP: Monitor,
};

export default function InternalAlertsPage() {
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['internal-alerts', eventFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('internal_alerts' as never)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventFilter !== 'ALL') {
        query = query.eq('event_type', eventFilter);
      }
      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as InternalAlert[];
    },
  });

  const { data: deliveriesMap = {} } = useQuery({
    queryKey: ['internal-alert-deliveries', alerts.map(a => a.id).join(',')],
    queryFn: async () => {
      if (alerts.length === 0) return {};
      const alertIds = alerts.map(a => a.id);
      const { data, error } = await supabase
        .from('internal_alert_deliveries' as never)
        .select('*')
        .in('alert_id', alertIds);
      if (error) throw error;
      const map: Record<string, AlertDelivery[]> = {};
      ((data || []) as unknown as AlertDelivery[]).forEach(d => {
        if (!map[d.alert_id]) map[d.alert_id] = [];
        map[d.alert_id].push(d);
      });
      return map;
    },
    enabled: alerts.length > 0,
  });

  const { data: configMode } = useQuery({
    queryKey: ['internal-notifications-mode'],
    queryFn: async () => {
      const { data } = await supabase
        .from('config_settings' as never)
        .select('value')
        .eq('key', 'internal_notifications.mode')
        .maybeSingle();
      return data ? JSON.parse((data as { value: string }).value) : 'DRY_RUN';
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) throw new Error('Alert not found');
      
      const { error } = await supabase.functions.invoke('internal-alert-dispatcher', {
        body: {
          event_type: alert.event_type,
          entity_type: alert.entity_type,
          entity_id: alert.entity_id,
          source: alert.source,
          payload: alert.payload_json,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Alert re-dispatched');
      queryClient.invalidateQueries({ queryKey: ['internal-alerts'] });
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  const stats = {
    total: alerts.length,
    sent: alerts.filter(a => a.status === 'SENT').length,
    draft: alerts.filter(a => a.status === 'DRAFT').length,
    failed: alerts.filter(a => a.status === 'FAILED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Internal Alerts</h1>
          <p className="text-muted-foreground">Website activity notifications sent to the team</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={configMode === 'LIVE' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
            {configMode === 'LIVE' ? '🟢 LIVE' : '🟡 DRY_RUN'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['internal-alerts'] })}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          <div className="text-xs text-muted-foreground">Sent</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          <div className="text-xs text-muted-foreground">Draft</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Event Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Events</SelectItem>
            <SelectItem value="LEAD_CREATED">Lead Created</SelectItem>
            <SelectItem value="QUOTE_SAVED">Quote Saved</SelectItem>
            <SelectItem value="ORDER_CONFIRMED">Order Confirmed</SelectItem>
            <SelectItem value="PAYMENT_RECEIVED">Payment Received</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="SKIPPED">Skipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No internal alerts yet</p>
            <p className="text-xs text-muted-foreground mt-1">Alerts will appear when leads, quotes, or orders are created from the website</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const deliveries = deliveriesMap[alert.id] || [];
            const StatusIcon = statusIcons[alert.status] || Clock;
            return (
              <Card key={alert.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className={`h-4 w-4 ${alert.status === 'SENT' ? 'text-green-600' : alert.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`} />
                        <span className="font-semibold text-sm truncate">{alert.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-xs">{alert.event_type}</Badge>
                        <Badge variant="outline" className="text-xs">{alert.source}</Badge>
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                      {alert.body_text && (
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">{alert.body_text}</pre>
                      )}

                      {/* Deliveries */}
                      {deliveries.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {deliveries.map(d => {
                            const ChannelIcon = channelIcons[d.channel] || Bell;
                            return (
                              <div key={d.id} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${statusColors[d.status] || 'bg-gray-100'}`}>
                                <ChannelIcon className="h-3 w-3" />
                                <span>{d.channel}: {d.recipient}</span>
                                {d.error_message && (
                                  <span className="text-red-600 ml-1" title={d.error_message}>⚠</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Links */}
                      {alert.links_json && alert.links_json.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {alert.links_json.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline">
                              {link.label} →
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendMutation.mutate(alert.id)}
                      disabled={resendMutation.isPending}
                    >
                      <Send className="h-3 w-3 mr-1" /> Resend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
