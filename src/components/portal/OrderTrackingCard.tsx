// ============================================================
// ORDER TRACKING CARD - Uber-like order status display
// Shows timeline, map placement, and contact options
// ============================================================
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, MessageCircle, MapPin, Package, Calendar, 
  Truck, Clock, ExternalLink, ChevronRight 
} from 'lucide-react';
import { TrackingTimeline, generateOrderTimeline } from '@/components/quote/ui/TrackingTimeline';
import { BUSINESS_INFO } from '@/lib/seo';
import { Link } from 'react-router-dom';

interface OrderTrackingCardProps {
  orderId: string;
  orderNumber?: string;
  status: string;
  deliveryAddress?: string;
  scheduledDeliveryDate?: string;
  scheduledPickupDate?: string;
  sizeLabel?: string;
  materialType?: string;
  timestamps?: {
    created?: string;
    scheduled?: string;
    delivered?: string;
    pickupScheduled?: string;
    completed?: string;
  };
  showPlacementLink?: boolean;
  className?: string;
}

export function OrderTrackingCard({
  orderId,
  orderNumber,
  status,
  deliveryAddress,
  scheduledDeliveryDate,
  scheduledPickupDate,
  sizeLabel,
  materialType,
  timestamps,
  showPlacementLink = true,
  className,
}: OrderTrackingCardProps) {
  const timelineSteps = generateOrderTimeline(status, timestamps);
  const currentStep = timelineSteps.find(s => s.status === 'current');

  // Map status to display status
  const displayStatus = (() => {
    switch (status) {
      case 'placed':
      case 'pending':
        return 'Order Confirmed';
      case 'scheduled':
        return 'Delivery Scheduled';
      case 'delivered':
        return 'On-Site';
      case 'pickup_scheduled':
        return 'Pickup Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  })();

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header with status */}
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Order {orderNumber || orderId.slice(0, 8)}
            </p>
            <CardTitle className="text-lg flex items-center gap-2">
              {displayStatus}
              {status === 'delivered' && (
                <span className="inline-flex items-center px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                  Active
                </span>
              )}
            </CardTitle>
          </div>
          {currentStep?.eta && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="font-semibold text-foreground">{currentStep.eta}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Order details summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {sizeLabel && (
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Size</p>
              <p className="font-medium flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                {sizeLabel}
              </p>
            </div>
          )}
          {materialType && (
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Material</p>
              <p className="font-medium">{materialType}</p>
            </div>
          )}
          {scheduledDeliveryDate && (
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Delivery</p>
              <p className="font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {scheduledDeliveryDate}
              </p>
            </div>
          )}
          {scheduledPickupDate && (
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Pickup</p>
              <p className="font-medium flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                {scheduledPickupDate}
              </p>
            </div>
          )}
        </div>

        {/* Delivery address */}
        {deliveryAddress && (
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Delivery Location</p>
              <p className="text-sm font-medium">{deliveryAddress}</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Order Progress</h3>
          <TrackingTimeline steps={timelineSteps} compact />
        </div>

        {/* Placement tool link */}
        {showPlacementLink && status !== 'completed' && status !== 'cancelled' && (
          <Link to={`/portal/order/${orderId}/placement`}>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Set Dumpster Placement</p>
                  <p className="text-xs text-muted-foreground">
                    Show us where to place it
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        )}

        {/* Contact options */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Need help?</p>
          <div className="flex gap-3">
            <a href={`tel:${BUSINESS_INFO.phone.sales.replace(/\D/g, '')}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Phone className="w-4 h-4" />
                Call
              </Button>
            </a>
            <a href={`sms:${BUSINESS_INFO.phone.sales.replace(/\D/g, '')}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <MessageCircle className="w-4 h-4" />
                Text
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderTrackingCard;
