import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Truck, Calendar, MapPin, Phone, Download, 
  Camera, Clock, FileText, AlertCircle, CheckCircle2,
  Loader2, MessageSquare, CreditCard, CalendarDays, Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS_INFO } from "@/lib/seo";
import { PayNowDialog } from "@/components/payment/PayNowDialog";
import { PaymentHistory } from "@/components/payment/PaymentHistory";
import { InvoiceLineItems } from "@/components/payment/InvoiceLineItems";
import { ServiceRequestDialog } from "@/components/portal/ServiceRequestDialog";
import { PendingRequestsBanner } from "@/components/portal/PendingRequestsBanner";
import { OrderTimeline } from "@/components/portal/OrderTimeline";
import { SitePlacementViewer } from "@/components/placement";
import logoCalsan from "@/assets/logo-calsan.jpeg";

interface OrderDetails {
  id: string;
  status: string;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  actual_delivery_at: string | null;
  actual_pickup_at: string | null;
  final_total: number | null;
  amount_due: number | null;
  amount_paid: number | null;
  balance_due: number | null;
  payment_status: string | null;
  placement_photo_url: string | null;
  pickup_photo_url: string | null;
  dump_ticket_url: string | null;
  invoice_url: string | null;
  driver_notes: string | null;
  quotes: {
    id: string;
    zip_code: string;
    material_type: string;
    delivery_address: string | null;
    placement_type: string | null;
    placement_notes: string | null;
    size_id: string | null;
    yard_name: string | null;
    distance_miles: number | null;
    subtotal: number;
    estimated_min: number;
    estimated_max: number;
    rental_days: number;
    extras: string[] | null;
    customer_email: string | null;
    customer_phone: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", description: "Awaiting confirmation" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", description: "Order confirmed" },
  scheduled: { label: "Scheduled", color: "bg-purple-100 text-purple-800", description: "Delivery scheduled" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", description: "Dumpster on-site" },
  pickup_scheduled: { label: "Pickup Scheduled", color: "bg-orange-100 text-orange-800", description: "Pickup date set" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", description: "Service complete" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", description: "Order cancelled" },
};

const CustomerOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading: authLoading, isAuthenticated, session } = useCustomerAuth();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupRequestOpen, setPickupRequestOpen] = useState(false);
  const [scheduleChangeOpen, setScheduleChangeOpen] = useState(false);
  const [payNowOpen, setPayNowOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/portal");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch order data
  const fetchOrder = async () => {
    if (!orderId || !session?.phone) return;

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          quotes (
            id,
            zip_code,
            material_type,
            delivery_address,
            placement_type,
            placement_notes,
            size_id,
            yard_name,
            distance_miles,
            subtotal,
            estimated_min,
            estimated_max,
            rental_days,
            extras,
            customer_phone,
            customer_email
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: "Could not load order details",
          variant: "destructive",
        });
      } else {
        // Verify phone ownership
        const phoneDigits = session.phone.replace(/\D/g, "");
        const quotePhone = (data.quotes as any)?.customer_phone?.replace(/\D/g, "") || "";
        if (!quotePhone.includes(phoneDigits) && !phoneDigits.includes(quotePhone.slice(-10))) {
          navigate("/portal/dashboard");
          return;
        }
        setOrder(data as OrderDetails);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchOrder();
    }
  }, [orderId, session, navigate, toast]);

  // Subscribe to realtime updates for instant payment status changes
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order updated via realtime:', payload);
          // Update the order state with new payment info
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              payment_status: payload.new.payment_status,
              amount_paid: payload.new.amount_paid,
              balance_due: payload.new.balance_due,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Status check for showing actions
  const canRequestPickup = order?.status === "delivered";
  const canRequestScheduleChange = order && !["completed", "cancelled"].includes(order.status);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Order not found</p>
          <Button asChild>
            <Link to="/portal/dashboard">Back to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/portal/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Order Details</p>
            <p className="text-xs text-gray-500">#{order.id.slice(0, 8)}</p>
          </div>
          <img src={logoCalsan} alt="Calsan" className="h-8 w-auto rounded" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Banner */}
        <Card className="overflow-hidden">
          <div className={`${statusConfig.color.replace('text-', 'bg-').replace('-800', '-500')} p-4`}>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-semibold text-lg">{statusConfig.label}</p>
                <p className="text-sm opacity-90">{statusConfig.description}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4 space-y-4">
            {/* Schedule Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Truck className="w-4 h-4" /> Delivery
                </p>
                {order.scheduled_delivery_date ? (
                  <p className="font-medium">
                    {new Date(order.scheduled_delivery_date).toLocaleDateString()}
                    {order.scheduled_delivery_window && (
                      <span className="text-gray-500 text-sm ml-1">
                        ({order.scheduled_delivery_window})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-gray-400">Not scheduled</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Pickup
                </p>
                {order.scheduled_pickup_date ? (
                  <p className="font-medium">
                    {new Date(order.scheduled_pickup_date).toLocaleDateString()}
                    {order.scheduled_pickup_window && (
                      <span className="text-gray-500 text-sm ml-1">
                        ({order.scheduled_pickup_window})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-gray-400">Not scheduled</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {canRequestPickup && (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setPickupRequestOpen(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Pickup
                </Button>
                <Button variant="outline" onClick={() => setScheduleChangeOpen(true)}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Change Schedule
                </Button>
              </div>
            )}
            {canRequestScheduleChange && !canRequestPickup && (
              <Button variant="outline" onClick={() => setScheduleChangeOpen(true)}>
                <CalendarDays className="w-4 h-4 mr-2" />
                Request Schedule Change
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" /> Order Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline
              status={order.status}
              scheduledDeliveryDate={order.scheduled_delivery_date}
              actualDeliveryAt={order.actual_delivery_at}
              scheduledPickupDate={order.scheduled_pickup_date}
              actualPickupAt={order.actual_pickup_at}
            />
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Delivery Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-900">{order.quotes?.delivery_address || "Address not set"}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{order.quotes?.placement_type || "Driveway"}</Badge>
              <Badge variant="outline">{order.quotes?.material_type}</Badge>
              {order.quotes?.yard_name && (
                <Badge variant="outline">{order.quotes.yard_name}</Badge>
              )}
            </div>
            {order.quotes?.placement_notes && (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <strong>Notes:</strong> {order.quotes.placement_notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Site Placement Map */}
        <Collapsible>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="text-base flex items-center gap-2">
                  <Map className="w-4 h-4" /> Dumpster Placement Map
                  <Badge variant="outline" className="ml-auto text-xs">
                    Click to expand
                  </Badge>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <SitePlacementViewer orderId={order.id} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Pricing & Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" /> Pricing & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Rental ({order.quotes?.rental_days} days)</span>
              <span>${order.quotes?.subtotal?.toFixed(2)}</span>
            </div>
            {order.quotes?.extras && order.quotes.extras.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Extras</span>
                <span>{order.quotes.extras.join(", ")}</span>
              </div>
            )}
            
            {/* Invoice Line Items (overage, extras, etc.) */}
            <InvoiceLineItems orderId={order.id} />
            
            {/* Legacy: Show overage if amount_due > original total but no line items yet */}
            {order.amount_due && order.final_total && order.amount_due > order.final_total && (
              <div className="flex justify-between text-amber-700 bg-amber-50 p-2 rounded">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Overage Charge
                </span>
                <span className="font-medium">
                  ${(order.amount_due - order.final_total).toFixed(2)}
                </span>
              </div>
            )}
            
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Due</span>
              <span>
                {order.amount_due 
                  ? `$${order.amount_due.toFixed(2)}`
                  : order.final_total 
                    ? `$${order.final_total.toFixed(2)}`
                    : `$${order.quotes?.estimated_min?.toFixed(0)} - $${order.quotes?.estimated_max?.toFixed(0)}`
                }
              </span>
            </div>
            {order.amount_paid && order.amount_paid > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Amount Paid</span>
                <span>-${order.amount_paid.toFixed(2)}</span>
              </div>
            )}
            
            {/* Payment Status */}
            <div className="pt-2 border-t space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Status</span>
                <Badge 
                  className={
                    order.payment_status === "paid" 
                      ? "bg-green-100 text-green-800" 
                      : order.payment_status === "partial"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {order.payment_status === "paid" 
                    ? "Paid in Full" 
                    : order.payment_status === "partial"
                    ? "Partial Payment"
                    : "Payment Due"}
                </Badge>
              </div>
              {order.payment_status !== "paid" && (order.balance_due || order.final_total) && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Balance Due</span>
                    <span className="font-semibold text-red-600">
                      ${(order.balance_due || order.final_total || 0).toFixed(2)}
                    </span>
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setPayNowOpen(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </Button>
                </>
              )}
              
              {/* Payment History */}
              <div className="pt-3 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Payment History</p>
                <PaymentHistory orderId={order.id} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pay Now Dialog */}
        <PayNowDialog
          open={payNowOpen}
          onOpenChange={setPayNowOpen}
          orderId={order.id}
          amountDue={order.amount_due || order.final_total || 0}
          balanceDue={order.balance_due || order.final_total || 0}
          customerEmail={order.quotes?.customer_email || undefined}
          customerPhone={order.quotes?.customer_phone || undefined}
          onSuccess={() => {
            // Realtime will handle the update automatically
            // Just refresh the order data to be sure
            fetchOrder();
          }}
        />

        {/* Photos & Documents */}
        {(order.placement_photo_url || order.pickup_photo_url || order.dump_ticket_url || order.invoice_url) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4" /> Photos & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.placement_photo_url && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Placement Photo</p>
                  <img 
                    src={order.placement_photo_url} 
                    alt="Dumpster placement" 
                    className="rounded-lg max-h-48 object-cover"
                  />
                </div>
              )}
              {order.pickup_photo_url && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Pickup Photo</p>
                  <img 
                    src={order.pickup_photo_url} 
                    alt="After pickup" 
                    className="rounded-lg max-h-48 object-cover"
                  />
                </div>
              )}
              <div className="flex gap-2">
                {order.dump_ticket_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={order.dump_ticket_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-1" /> Scale Ticket
                    </a>
                  </Button>
                )}
                {order.invoice_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={order.invoice_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-1" /> Invoice
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-900">Need Help?</p>
              <p className="text-sm text-amber-700">Call or text us anytime</p>
            </div>
            <Button variant="outline" className="border-amber-300" asChild>
              <a href={`tel:${BUSINESS_INFO.phone.support}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Pending Requests Banner */}
        {orderId && <PendingRequestsBanner orderId={orderId} />}
      </main>

      {/* Service Request Dialogs */}
      {order && (
        <>
          <ServiceRequestDialog
            open={pickupRequestOpen}
            onOpenChange={setPickupRequestOpen}
            orderId={order.id}
            requestType="pickup"
            currentPickupDate={order.scheduled_pickup_date}
            customerPhone={order.quotes?.customer_phone}
          />
          <ServiceRequestDialog
            open={scheduleChangeOpen}
            onOpenChange={setScheduleChangeOpen}
            orderId={order.id}
            requestType="schedule_change"
            currentDeliveryDate={order.scheduled_delivery_date}
            currentPickupDate={order.scheduled_pickup_date}
            customerPhone={order.quotes?.customer_phone}
          />
        </>
      )}
    </div>
  );
};

export default CustomerOrderDetail;
