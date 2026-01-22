import { Clock, Calendar, Check, X, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MobileRequestCardProps {
  request: {
    id: string;
    request_type: string;
    requested_date?: string | null;
    requested_window?: string | null;
    status: string;
    notes?: string | null;
    created_at: string;
    orders?: {
      id: string;
      quotes?: {
        customer_name?: string | null;
        street_address?: string | null;
      } | null;
    } | null;
  };
  onView: () => void;
  onApprove?: () => void;
  onDeny?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  denied: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
};

const TYPE_LABELS: Record<string, string> = {
  pickup_request: 'Pickup Request',
  schedule_change: 'Schedule Change',
  extension: 'Extension',
  early_pickup: 'Early Pickup',
};

export function MobileRequestCard({ 
  request, 
  onView, 
  onApprove, 
  onDeny 
}: MobileRequestCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isPending = request.status === 'pending';

  return (
    <Card className="p-4 active:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Type + Status */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">
              {TYPE_LABELS[request.request_type] || request.request_type}
            </Badge>
            <Badge className={STATUS_COLORS[request.status] || 'bg-muted'}>
              {request.status}
            </Badge>
          </div>

          {/* Customer */}
          {request.orders?.quotes?.customer_name && (
            <p className="text-sm font-medium truncate">
              {request.orders.quotes.customer_name}
            </p>
          )}

          {/* Requested date */}
          {request.requested_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {formatDate(request.requested_date)}
                {request.requested_window && ` · ${request.requested_window}`}
              </span>
            </div>
          )}

          {/* Created */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Requested {formatDate(request.created_at)}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onView}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Actions for pending */}
      {isPending && (onApprove || onDeny) && (
        <div className="flex gap-2 mt-3">
          {onApprove && (
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); onApprove(); }}
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
          )}
          {onDeny && (
            <Button 
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDeny(); }}
            >
              <X className="w-4 h-4 mr-1" />
              Deny
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
