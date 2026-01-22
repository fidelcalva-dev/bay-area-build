import { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlerts, type Alert } from '@/hooks/useAlerts';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface AlertsPanelProps {
  className?: string;
  maxHeight?: number;
}

export function AlertsPanel({ className, maxHeight = 400 }: AlertsPanelProps) {
  const [showResolved, setShowResolved] = useState(false);
  const { alerts, loading, refetch, markAsRead, resolveAlert, unreadCount, criticalCount } = 
    useAlerts({ resolved: showResolved ? undefined : false });

  const getSeverityConfig = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return { 
          icon: AlertCircle, 
          color: 'text-red-500', 
          bg: 'bg-red-50', 
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-700',
        };
      case 'warning':
        return { 
          icon: AlertTriangle, 
          color: 'text-amber-500', 
          bg: 'bg-amber-50', 
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-700',
        };
      default:
        return { 
          icon: Info, 
          color: 'text-blue-500', 
          bg: 'bg-blue-50', 
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
        };
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'low_inventory': return 'Inventory';
      case 'schedule_overload': return 'Schedule';
      case 'overdue_invoice': return 'Finance';
      case 'high_risk_quote': return 'Risk';
      case 'repeat_customer': return 'Customer';
      default: return alertType;
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Alerts
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
            >
              <Filter className="w-4 h-4 mr-1" />
              {showResolved ? 'Hide Resolved' : 'Show All'}
            </Button>
            <Button variant="ghost" size="icon" onClick={refetch}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary badges */}
        <div className="flex gap-2 mb-4">
          {criticalCount > 0 && (
            <Badge variant="destructive">{criticalCount} Critical</Badge>
          )}
          <Badge variant="outline">{warningAlerts.filter(a => !a.is_resolved).length} Warnings</Badge>
          <Badge variant="secondary">{infoAlerts.filter(a => !a.is_resolved).length} Info</Badge>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
            <TabsTrigger value="critical" className="text-red-600">
              Critical ({criticalAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="warning" className="text-amber-600">
              Warning ({warningAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="info">Info ({infoAlerts.length})</TabsTrigger>
          </TabsList>

          {['all', 'critical', 'warning', 'info'].map(tab => {
            const filtered = tab === 'all' ? alerts : alerts.filter(a => a.severity === tab);
            
            return (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div 
                  className="space-y-2 overflow-y-auto" 
                  style={{ maxHeight: `${maxHeight}px` }}
                >
                  {loading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading...</div>
                  ) : filtered.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No alerts in this category</p>
                    </div>
                  ) : (
                    filtered.map(alert => {
                      const config = getSeverityConfig(alert.severity);
                      const Icon = config.icon;

                      return (
                        <div
                          key={alert.id}
                          className={cn(
                            'p-3 rounded-lg border flex items-start gap-3 transition-all',
                            config.bg,
                            config.border,
                            !alert.is_read && 'ring-2 ring-primary/20',
                            alert.is_resolved && 'opacity-60'
                          )}
                          onClick={() => !alert.is_read && markAsRead(alert.id)}
                        >
                          <Icon className={cn('w-5 h-5 mt-0.5', config.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{alert.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {getAlertTypeLabel(alert.alert_type)}
                              </Badge>
                              {alert.is_resolved && (
                                <Badge variant="secondary" className="text-xs">Resolved</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                              </span>
                              {!alert.is_resolved && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resolveAlert(alert.id);
                                  }}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
