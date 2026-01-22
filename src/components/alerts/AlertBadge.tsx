import { Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlerts, type Alert } from '@/hooks/useAlerts';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertBadgeProps {
  className?: string;
}

export function AlertBadge({ className }: AlertBadgeProps) {
  const { alerts, unreadCount, criticalCount, markAsRead, resolveAlert, loading } = useAlerts({ resolved: false });

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn('relative', className)}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className={cn(
              'absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center text-white',
              criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Alerts</h3>
          {criticalCount > 0 && (
            <Badge variant="destructive">{criticalCount} Critical</Badge>
          )}
        </div>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active alerts</p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.slice(0, 20).map((alert) => (
                <div 
                  key={alert.id} 
                  className={cn(
                    'p-3 hover:bg-muted/50 transition-colors',
                    !alert.is_read && 'bg-muted/30'
                  )}
                  onClick={() => !alert.is_read && markAsRead(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg border', getSeverityBg(alert.severity))}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{alert.title}</p>
                        {!alert.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveAlert(alert.id);
                          }}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <a href="/admin/alerts">View All Alerts</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
