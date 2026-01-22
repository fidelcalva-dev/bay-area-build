import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Truck, Calendar, MapPin, Phone, LogOut, Clock, 
  FileText, Download, AlertCircle, CheckCircle2, 
  Package, ChevronRight, Loader2, ClipboardList, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { supabase } from "@/integrations/supabase/client";
import logoCalsan from "@/assets/logo-calsan.jpeg";

interface Order {
  id: string;
  status: string;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  final_total: number | null;
  payment_status: string | null;
  quotes: {
    zip_code: string;
    material_type: string;
    delivery_address: string | null;
    size_id: string | null;
    yard_name: string | null;
    distance_miles: number | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Truck }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", color: "bg-purple-100 text-purple-800", icon: Calendar },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: Truck },
  pickup_scheduled: { label: "Pickup Scheduled", color: "bg-orange-100 text-orange-800", icon: Calendar },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, session, logout } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/portal");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.phone) return;

      try {
        // Get orders via quotes that match the customer's phone
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            status,
            scheduled_delivery_date,
            scheduled_delivery_window,
            scheduled_pickup_date,
            scheduled_pickup_window,
            final_total,
            payment_status,
            quotes!inner (
              zip_code,
              material_type,
              delivery_address,
              size_id,
              yard_name,
              distance_miles,
              customer_phone
            )
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          // Filter orders by phone (since RLS might not work with phone-based auth)
          const phoneDigits = session.phone.replace(/\D/g, "");
          const filteredOrders = (data || []).filter((order) => {
            const quotePhone = (order.quotes as any)?.customer_phone?.replace(/\D/g, "") || "";
            return quotePhone.includes(phoneDigits) || phoneDigits.includes(quotePhone.slice(-10));
          });
          setOrders(filteredOrders as Order[]);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    if (session) {
      fetchOrders();
    }
  }, [session]);

  const handleLogout = () => {
    logout();
    navigate("/portal");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => ["completed", "cancelled"].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoCalsan} alt="Calsan" className="h-10 w-auto rounded-lg" />
            <div>
              <p className="font-semibold text-gray-900">Customer Portal</p>
              <p className="text-xs text-gray-500">{session?.phone}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">
            Welcome{session?.customer?.company_name ? `, ${session.customer.company_name}` : ""}!
          </h1>
          <p className="text-amber-100">
            {activeOrders.length > 0 
              ? `You have ${activeOrders.length} active order${activeOrders.length > 1 ? "s" : ""}`
              : "No active orders right now"
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <a href="tel:+15101234567">
              <Phone className="w-5 h-5 text-amber-600" />
              <span className="text-sm">Call Support</span>
            </a>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/quote">
              <Package className="w-5 h-5 text-amber-600" />
              <span className="text-sm">New Order</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/portal/orders">
              <ClipboardList className="w-5 h-5 text-amber-600" />
              <span className="text-sm">All Orders</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/portal/documents">
              <Image className="w-5 h-5 text-amber-600" />
              <span className="text-sm">Documents</span>
            </Link>
          </Button>
        </div>

        {/* Active Orders */}
        {isLoadingOrders ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Orders</h2>
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Order History</h2>
                <div className="space-y-3">
                  {completedOrders.slice(0, 5).map((order) => (
                    <OrderCard key={order.id} order={order} compact />
                  ))}
                </div>
              </section>
            )}

            {orders.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Button asChild>
                    <Link to="/quote">Get a Quote</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

function OrderCard({ order, compact = false }: { order: Order; compact?: boolean }) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className={compact ? "p-4" : "p-4"}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {order.payment_status === "paid" && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Paid
                </Badge>
              )}
            </div>

            {!compact && (
              <>
                {order.quotes?.delivery_address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="truncate">{order.quotes.delivery_address}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  {order.scheduled_delivery_date && (
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Delivery: {new Date(order.scheduled_delivery_date).toLocaleDateString()}
                      {order.scheduled_delivery_window && ` (${order.scheduled_delivery_window})`}
                    </span>
                  )}
                  {order.scheduled_pickup_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Pickup: {new Date(order.scheduled_pickup_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {order.final_total && (
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    ${order.final_total.toFixed(2)}
                  </p>
                )}
              </>
            )}

            {compact && (
              <p className="text-sm text-gray-500">
                {order.quotes?.material_type} • {order.quotes?.zip_code}
              </p>
            )}
          </div>

          <Link 
            to={`/portal/order/${order.id}`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerDashboard;
