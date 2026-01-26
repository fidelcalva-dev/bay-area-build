import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, RefreshCw, Bell, Send, 
  CheckCircle, XCircle, Clock, Eye
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMasterAI } from '@/hooks/useMasterAI';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  channel: string;
  target_team: string;
  target_user_id?: string;
  title: string;
  body: string;
  entity_type?: string;
  entity_id?: string;
  priority?: string;
  status: string;
  mode: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  SENT: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
  DRAFTED: { color: 'bg-blue-100 text-blue-800', icon: Eye },
};

const priorityColors: Record<string, string> = {
  LOW: 'text-muted-foreground',
  NORMAL: 'text-foreground',
  HIGH: 'text-orange-600',
  URGENT: 'text-destructive',
};

export default function MasterAINotifications() {
  const { toast } = useToast();
  const { fetchNotifications } = useMasterAI();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadNotifications = async (status?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchNotifications(status === 'all' ? undefined : status, 100);
      setNotifications(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load notifications', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(activeTab);
  }, [activeTab]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <NavLink to="/admin/master-ai">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </NavLink>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications Outbox
          </h1>
          <p className="text-muted-foreground">AI-generated notifications and delivery status</p>
        </div>
        <Button variant="outline" onClick={() => loadNotifications(activeTab)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="DRAFTED">Drafted (DRY_RUN)</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="SENT">Sent</TabsTrigger>
          <TabsTrigger value="FAILED">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications found</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => {
                    const StatusIcon = statusConfig[notif.status]?.icon || Clock;
                    return (
                      <div 
                        key={notif.id} 
                        className="rounded-lg border bg-card p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'p-2 rounded-full shrink-0',
                            statusConfig[notif.status]?.color || 'bg-muted'
                          )}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge variant="outline">{notif.channel}</Badge>
                              <Badge variant="secondary">{notif.target_team}</Badge>
                              <Badge className={statusConfig[notif.status]?.color}>
                                {notif.status}
                              </Badge>
                              {notif.mode === 'DRY_RUN' && (
                                <Badge variant="outline" className="border-dashed">
                                  DRY_RUN
                                </Badge>
                              )}
                            </div>
                            <h4 className={cn('font-semibold', priorityColors[notif.priority])}>
                              {notif.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notif.body}
                            </p>
                            {notif.error_message && (
                              <p className="text-sm text-destructive mt-2">
                                Error: {notif.error_message}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {new Date(notif.created_at).toLocaleString()}
                              {notif.sent_at && (
                                <> • Sent: {new Date(notif.sent_at).toLocaleString()}</>
                              )}
                            </p>
                          </div>
                          {notif.status === 'DRAFTED' && (
                            <Button size="sm" variant="outline" disabled>
                              <Send className="w-3 h-3 mr-1" />
                              Send
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
