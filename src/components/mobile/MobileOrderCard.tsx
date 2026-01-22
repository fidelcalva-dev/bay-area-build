import { MapPin, Package, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MobileOrderCardProps {
  order: {
    id: string;
    status: string;
    payment_status?: string | null;
    scheduled_delivery_date?: string | null;
    scheduled_delivery_window?: string | null;
    scheduled_pickup_date?: string | null;
    final_total?: number | null;
    quotes?: {
      street_address?: string | null;
      city?: string | null;
      zip_code?: string | null;
      size?: number | null;
      material_type?: string | null;
      customer_name?: string | null;
    } | null;
  };
  onView: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  schedule_requested: 'bg-blue-100 text-blue-800',
  schedule_confirmed: 'bg-indigo-100 text-indigo-800',
  dispatched: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  picked_up: 'bg-teal-100 text-teal-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function MobileOrderCard({ order, onView, onPrimaryAction, primaryActionLabel }: MobileOrderCardProps) {
  const quote = order.quotes;
  const nextDate = order.scheduled_delivery_date || order.scheduled_pickup_date;
  const nextWindow = order.scheduled_delivery_window || 'TBD';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="p-4 active:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Status badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge className={STATUS_COLORS[order.status] || 'bg-muted'}>
              {order.status.replace('_', ' ')}
            </Badge>
            {order.payment_status && order.payment_status !== 'paid' && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                {order.payment_status}
              </Badge>
            )}
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {quote?.city || 'Unknown'}, {quote?.zip_code || '—'}
              </p>
              {quote?.street_address && (
                <p className="text-xs text-muted-foreground truncate">
                  {quote.street_address}
                </p>
              )}
            </div>
          </div>

          {/* Size + Material */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {quote?.size ? `${quote.size} yd` : '—'} · {quote?.material_type || 'General'}
            </span>
          </div>

          {/* Schedule */}
          {nextDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {formatDate(nextDate)} · {nextWindow}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <Button variant="ghost" size="icon" onClick={onView}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          
          {order.final_total && (
            <span className="text-sm font-semibold">
              ${order.final_total.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Primary action */}
      {onPrimaryAction && primaryActionLabel && (
        <Button 
          className="w-full mt-3" 
          size="sm"
          onClick={(e) => { e.stopPropagation(); onPrimaryAction(); }}
        >
          {primaryActionLabel}
        </Button>
      )}
    </Card>
  );
}
