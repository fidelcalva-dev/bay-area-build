import { Link } from "react-router-dom";
import { Truck, Calendar, MapPin, CreditCard, ChevronRight, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CTA_LINKS } from "@/lib/shared-data";

interface Order {
  id: string;
  status: string;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  final_total: number | null;
  balance_due: number | null;
  payment_status: string | null;
  quotes?: {
    delivery_address: string | null;
    zip_code?: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; nextAction?: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", nextAction: "We'll confirm your order soon" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", nextAction: "Delivery date being scheduled" },
  scheduled: { label: "Scheduled", color: "bg-purple-100 text-purple-800", nextAction: "Delivery on its way" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", nextAction: "Request pickup when ready" },
  pickup_scheduled: { label: "Pickup Scheduled", color: "bg-orange-100 text-orange-800", nextAction: "We'll pick up soon" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

interface CustomerOrderCardProps {
  order: Order;
  showActions?: boolean;
}

export function CustomerOrderCard({ order, showActions = true }: CustomerOrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const balanceDue = order.balance_due || 0;
  const showPayNow = order.payment_status !== "paid" && balanceDue > 0;
  const showPickupRequest = order.status === "delivered";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Status Header */}
        <div className={`${statusConfig.color.replace('text-', 'bg-').replace('-800', '-50')} p-3 border-b`}>
          <div className="flex items-center justify-between">
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            {order.payment_status === "paid" ? (
              <Badge variant="outline" className="text-green-600 border-green-200">Paid</Badge>
            ) : balanceDue > 0 ? (
              <Badge variant="outline" className="text-red-600 border-red-200">${balanceDue.toFixed(0)} Due</Badge>
            ) : null}
          </div>
          {statusConfig.nextAction && (
            <p className="text-xs text-muted-foreground mt-1">
              What's next: {statusConfig.nextAction}
            </p>
          )}
        </div>

        {/* Order Info */}
        <div className="p-4 space-y-3">
          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Delivery</p>
                <p className="font-medium">
                  {order.scheduled_delivery_date 
                    ? new Date(order.scheduled_delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : "Pending"
                  }
                </p>
                {order.scheduled_delivery_window && (
                  <p className="text-xs text-muted-foreground capitalize">{order.scheduled_delivery_window}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Pickup</p>
                <p className="font-medium">
                  {order.scheduled_pickup_date 
                    ? new Date(order.scheduled_pickup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : "Not scheduled"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {order.quotes?.delivery_address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground truncate">{order.quotes.delivery_address}</p>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              {showPickupRequest && (
                <Button asChild size="sm" className="flex-1">
                  <Link to={`/portal/order/${order.id}`}>
                    <Calendar className="w-4 h-4 mr-1" />
                    Request Pickup
                  </Link>
                </Button>
              )}
              {showPayNow && (
                <Button asChild size="sm" variant={showPickupRequest ? "outline" : "default"} className="flex-1">
                  <Link to={`/portal/order/${order.id}`}>
                    <CreditCard className="w-4 h-4 mr-1" />
                    Pay Now
                  </Link>
                </Button>
              )}
              {!showPickupRequest && !showPayNow && (
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to={`/portal/order/${order.id}`}>
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              )}
              <Button asChild size="sm" variant="ghost">
                <a href={CTA_LINKS.text}>
                  <MessageSquare className="w-4 h-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
