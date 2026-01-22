import { useState, useEffect } from 'react';
import { Clock, Calendar, User, Truck, Package, FileText, DollarSign, AlertCircle, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { getOrderEvents } from '@/lib/orderEventService';

interface OrderHistoryTabProps {
  orderId: string;
}

interface TimelineItem {
  id: string;
  type: 'event' | 'schedule';
  timestamp: string;
  title: string;
  description: string | null;
  actorRole: string | null;
  icon: React.ReactNode;
  badgeColor: string;
}

const EVENT_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  ORDER_CREATED: { icon: <Package className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Order Created' },
  SCHEDULE_REQUESTED: { icon: <Calendar className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700', label: 'Schedule Requested' },
  SCHEDULE_CONFIRMED: { icon: <Calendar className="w-4 h-4" />, color: 'bg-green-100 text-green-700', label: 'Schedule Confirmed' },
  SCHEDULE_CHANGED: { icon: <Calendar className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700', label: 'Schedule Changed' },
  INVENTORY_RESERVED: { icon: <Package className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700', label: 'Inventory Reserved' },
  INVENTORY_RELEASED: { icon: <Package className="w-4 h-4" />, color: 'bg-teal-100 text-teal-700', label: 'Inventory Released' },
  DRIVER_ASSIGNED: { icon: <User className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-700', label: 'Driver Assigned' },
  DRIVER_STATUS_UPDATED: { icon: <Truck className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700', label: 'Driver Update' },
  TICKET_UPLOADED: { icon: <FileText className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700', label: 'Ticket Uploaded' },
  RECEIPT_SENT: { icon: <FileText className="w-4 h-4" />, color: 'bg-green-100 text-green-700', label: 'Receipt Sent' },
  PAYMENT_STATUS_UPDATED: { icon: <DollarSign className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700', label: 'Payment Update' },
  STATUS_CHANGED: { icon: <Clock className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700', label: 'Status Changed' },
  NOTE_ADDED: { icon: <FileText className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700', label: 'Note Added' },
  CANCELLED: { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700', label: 'Cancelled' },
};

const SCHEDULE_ACTION_CONFIG: Record<string, { color: string; label: string }> = {
  requested: { color: 'bg-amber-100 text-amber-700', label: 'Schedule Requested' },
  confirmed: { color: 'bg-green-100 text-green-700', label: 'Schedule Confirmed' },
  changed: { color: 'bg-purple-100 text-purple-700', label: 'Schedule Changed' },
  cancelled: { color: 'bg-red-100 text-red-700', label: 'Schedule Cancelled' },
};

export function OrderHistoryTab({ orderId }: OrderHistoryTabProps) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      const { events, scheduleLogs } = await getOrderEvents(orderId);
      
      // Convert events to timeline items
      const eventItems: TimelineItem[] = events.map((e) => {
        const config = EVENT_CONFIG[e.event_type] || EVENT_CONFIG.STATUS_CHANGED;
        return {
          id: `event-${e.id}`,
          type: 'event',
          timestamp: e.created_at,
          title: config.label,
          description: e.message,
          actorRole: e.actor_role,
          icon: config.icon,
          badgeColor: config.color,
        };
      });

      // Convert schedule logs to timeline items
      const scheduleItems: TimelineItem[] = scheduleLogs.map((s) => {
        const config = SCHEDULE_ACTION_CONFIG[s.action] || SCHEDULE_ACTION_CONFIG.changed;
        let description = '';
        if (s.new_date) {
          description = `New: ${new Date(s.new_date).toLocaleDateString()} (${s.new_window || 'TBD'})`;
          if (s.old_date) {
            description = `${new Date(s.old_date).toLocaleDateString()} → ${new Date(s.new_date).toLocaleDateString()}`;
          }
        }
        if (s.reason) {
          description += description ? ` - ${s.reason}` : s.reason;
        }
        
        return {
          id: `schedule-${s.id}`,
          type: 'schedule',
          timestamp: s.created_at,
          title: config.label,
          description: description || null,
          actorRole: s.actor_role,
          icon: <Calendar className="w-4 h-4" />,
          badgeColor: config.color,
        };
      });

      // Combine and sort by timestamp descending
      const combined = [...eventItems, ...scheduleItems].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setTimeline(combined);
      setIsLoading(false);
    }

    loadHistory();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No history events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="w-4 h-4" />
        Order History
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {timeline.map((item) => (
            <div key={item.id} className="relative flex gap-4 pl-10">
              {/* Timeline dot */}
              <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${item.badgeColor}`}>
                {item.icon}
              </div>
              
              <div className="flex-1 bg-muted/30 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className={item.badgeColor}>
                      {item.title}
                    </Badge>
                    {item.actorRole && (
                      <span className="text-xs text-muted-foreground ml-2 capitalize">
                        by {item.actorRole}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
