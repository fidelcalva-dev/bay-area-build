import { useState } from 'react';
import { 
  Phone, MessageSquare, Mail, FileText, Package, DollarSign, 
  Truck, MapPin, StickyNote, Bot, AlertTriangle, Clock,
  ChevronDown, ChevronUp, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TimelineEvent, TimelineEventType, TimelineEventAction } from '@/lib/timelineService';

interface TimelineEventItemProps {
  event: TimelineEvent;
  showCustomerLink?: boolean;
  showOrderLink?: boolean;
}

const EVENT_ICONS: Record<TimelineEventType, React.ReactNode> = {
  CALL: <Phone className="w-4 h-4" />,
  SMS: <MessageSquare className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  QUOTE: <FileText className="w-4 h-4" />,
  ORDER: <Package className="w-4 h-4" />,
  PAYMENT: <DollarSign className="w-4 h-4" />,
  DISPATCH: <Truck className="w-4 h-4" />,
  DELIVERY: <Truck className="w-4 h-4" />,
  PICKUP: <Truck className="w-4 h-4" />,
  SWAP: <Truck className="w-4 h-4" />,
  PLACEMENT: <MapPin className="w-4 h-4" />,
  NOTE: <StickyNote className="w-4 h-4" />,
  SYSTEM: <Clock className="w-4 h-4" />,
  AI: <Bot className="w-4 h-4" />,
  BILLING: <DollarSign className="w-4 h-4" />,
  OVERDUE: <AlertTriangle className="w-4 h-4" />,
  CONTAMINATION: <AlertTriangle className="w-4 h-4" />,
  DUMP_TICKET: <FileText className="w-4 h-4" />,
};

const EVENT_COLORS: Record<TimelineEventType, string> = {
  CALL: 'bg-blue-100 text-blue-700 border-blue-200',
  SMS: 'bg-green-100 text-green-700 border-green-200',
  EMAIL: 'bg-purple-100 text-purple-700 border-purple-200',
  QUOTE: 'bg-amber-100 text-amber-700 border-amber-200',
  ORDER: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  PAYMENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  DISPATCH: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  DELIVERY: 'bg-teal-100 text-teal-700 border-teal-200',
  PICKUP: 'bg-orange-100 text-orange-700 border-orange-200',
  SWAP: 'bg-pink-100 text-pink-700 border-pink-200',
  PLACEMENT: 'bg-violet-100 text-violet-700 border-violet-200',
  NOTE: 'bg-slate-100 text-slate-700 border-slate-200',
  SYSTEM: 'bg-gray-100 text-gray-700 border-gray-200',
  AI: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  BILLING: 'bg-lime-100 text-lime-700 border-lime-200',
  OVERDUE: 'bg-red-100 text-red-700 border-red-200',
  CONTAMINATION: 'bg-red-100 text-red-700 border-red-200',
  DUMP_TICKET: 'bg-sky-100 text-sky-700 border-sky-200',
};

const ACTION_LABELS: Record<TimelineEventAction, string> = {
  CREATED: 'Created',
  UPDATED: 'Updated',
  SENT: 'Sent',
  RECEIVED: 'Received',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  FLAGGED: 'Flagged',
  SCHEDULED: 'Scheduled',
  CANCELLED: 'Cancelled',
  ASSIGNED: 'Assigned',
  UPLOADED: 'Uploaded',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REFUNDED: 'Refunded',
};

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

export function TimelineEventItem({ event }: TimelineEventItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = event.details_json && Object.keys(event.details_json).length > 0;

  return (
    <div className="relative flex gap-4 pl-10">
      {/* Timeline dot */}
      <div className={cn(
        'absolute left-2 w-5 h-5 rounded-full flex items-center justify-center border',
        EVENT_COLORS[event.event_type]
      )}>
        {EVENT_ICONS[event.event_type]}
      </div>
      
      <div className="flex-1 bg-muted/30 rounded-lg p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={cn('text-xs', EVENT_COLORS[event.event_type])}>
              {event.event_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {ACTION_LABELS[event.event_action] || event.event_action}
            </Badge>
            {event.actor_role && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {event.actor_role}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(event.created_at)}
          </span>
        </div>
        
        <p className="text-sm mt-1">{event.summary}</p>
        
        {event.source !== 'USER' && (
          <span className="text-xs text-muted-foreground mt-1 inline-block">
            Source: {event.source}
          </span>
        )}
        
        {hasDetails && (
          <div className="mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show details
                </>
              )}
            </Button>
            
            {isExpanded && (
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                {JSON.stringify(event.details_json, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
