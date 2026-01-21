import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Truck, Calendar, MapPin, Phone, Download, 
  Camera, Clock, FileText, AlertCircle, CheckCircle2,
  Loader2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [pickupNotes, setPickupNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/portal");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    async function fetchOrder() {
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
              customer_phone
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
    }

    if (session) {
      fetchOrder();
    }
  }, [orderId, session, navigate, toast]);

  const handlePickupRequest = async () => {
    if (!order) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("service_requests").insert({
        order_id: order.id,
        request_type: "pickup",
        notes: pickupNotes || "Customer requests pickup",
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "We'll contact you to confirm the pickup date.",
      });
      setPickupRequestOpen(false);
      setPickupNotes("");
    } catch (err) {
      console.error("Failed to submit request:", err);
      toast({
        title: "Error",
        description: "Could not submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {order.status === "delivered" && (
              <div className="flex gap-2">
                <Dialog open={pickupRequestOpen} onOpenChange={setPickupRequestOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Request Pickup
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Pickup</DialogTitle>
                      <DialogDescription>
                        Let us know when you'd like the dumpster picked up.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Textarea
                          placeholder="e.g., Preferred date, time, or special instructions"
                          value={pickupNotes}
                          onChange={(e) => setPickupNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPickupRequestOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handlePickupRequest} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" asChild>
                  <a href="sms:+15101234567">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Text Us
                  </a>
                </Button>
              </div>
            )}
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

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" /> Pricing
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
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>
                {order.final_total 
                  ? `$${order.final_total.toFixed(2)}`
                  : `$${order.quotes?.estimated_min?.toFixed(0)} - $${order.quotes?.estimated_max?.toFixed(0)}`
                }
              </span>
            </div>
            <Badge className={order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {order.payment_status === "paid" ? "Paid" : "Payment Pending"}
            </Badge>
          </CardContent>
        </Card>

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
              <a href="tel:+15101234567">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CustomerOrderDetail;
