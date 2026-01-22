import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Truck, Calendar, MapPin, ArrowLeft, Loader2, 
  CheckCircle2, Clock, AlertCircle, Package, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  created_at: string;
  quotes: {
    zip_code: string;
    material_type: string;
    delivery_address: string | null;
    size_id: string | null;
    yard_name: string | null;
    customer_phone: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Truck }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", color: "bg-purple-100 text-purple-800", icon: Calendar },
  scheduled_requested: { label: "Schedule Requested", color: "bg-indigo-100 text-indigo-800", icon: Clock },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: Truck },
  pickup_scheduled: { label: "Pickup Scheduled", color: "bg-orange-100 text-orange-800", icon: Calendar },
  pickup_requested: { label: "Pickup Requested", color: "bg-amber-100 text-amber-800", icon: Clock },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, session } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/portal");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.phone) return;

      try {
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
            created_at,
            quotes!inner (
              zip_code,
              material_type,
              delivery_address,
              size_id,
              yard_name,
              customer_phone
            )
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          // Filter orders by phone - security enforcement
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => 
    !["completed", "cancelled"].includes(o.status)
  );
  const completedOrders = orders.filter((o) => 
    ["completed", "cancelled"].includes(o.status)
  );

  const filteredOrders = activeTab === "active" 
    ? activeOrders 
    : activeTab === "completed" 
      ? completedOrders 
      : orders;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link 
            to="/portal/dashboard" 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <img src={logoCalsan} alt="Calsan" className="h-8 w-auto rounded-lg" />
            <div>
              <p className="font-semibold text-gray-900">My Orders</p>
              <p className="text-xs text-gray-500">{orders.length} total</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">
              All ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        {isLoadingOrders ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {activeTab === "active" 
                  ? "No active orders" 
                  : activeTab === "completed" 
                    ? "No completed orders yet"
                    : "No orders yet"
                }
              </p>
              <Button asChild>
                <Link to="/quote">Get a Quote</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

function OrderCard({ order }: { order: Order }) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
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

            {order.quotes?.delivery_address && (
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="truncate">{order.quotes.delivery_address}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              {order.scheduled_delivery_date && (
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  {new Date(order.scheduled_delivery_date).toLocaleDateString()}
                </span>
              )}
              {order.scheduled_pickup_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Pickup: {new Date(order.scheduled_pickup_date).toLocaleDateString()}
                </span>
              )}
              <span className="text-xs text-gray-400">
                Created: {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>

            {order.final_total && (
              <p className="text-lg font-semibold text-gray-900 mt-2">
                ${order.final_total.toFixed(2)}
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

export default CustomerOrders;
