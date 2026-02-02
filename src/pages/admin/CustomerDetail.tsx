import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Phone, Mail, Building2, MapPin, FileText, DollarSign, 
  ArrowLeft, Loader2, Package 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimelineView, AddNoteDialog } from '@/components/timeline';
import { getCustomerTimeline, type TimelineEvent } from '@/lib/timelineService';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  company_name: string | null;
  customer_type: string | null;
  billing_email: string | null;
  billing_phone: string | null;
  billing_address: string | null;
  notes: string | null;
  created_at: string;
}

interface Order {
  id: string;
  status: string;
  amount_due: number | null;
  created_at: string;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  const loadTimeline = useCallback(async () => {
    if (!id) return;
    setIsTimelineLoading(true);
    const { events } = await getCustomerTimeline(id, { limit: 100 });
    setTimelineEvents(events);
    setIsTimelineLoading(false);
  }, [id]);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);

      const [customerResult, ordersResult] = await Promise.all([
        supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('orders')
          .select('id, status, amount_due, created_at')
          .eq('customer_id', id)
          .order('created_at', { ascending: false }),
      ]);

      if (customerResult.data) {
        setCustomer(customerResult.data);
      }
      if (ordersResult.data) {
        setOrders(ordersResult.data);
      }

      setIsLoading(false);
      loadTimeline();
    }

    loadData();
  }, [id, loadTimeline]);

  // Real-time subscription for timeline
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`customer-timeline-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'timeline_events',
          filter: `customer_id=eq.${id}`,
        },
        (payload) => {
          const newEvent = payload.new as TimelineEvent;
          setTimelineEvents(prev => [newEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/customers">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" />
              {customer.company_name || 'Customer'}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              {customer.customer_type && (
                <Badge variant="secondary">{customer.customer_type}</Badge>
              )}
              <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <AddNoteDialog
          entityType="CUSTOMER"
          entityId={customer.id}
          customerId={customer.id}
          onNoteAdded={loadTimeline}
        />
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {customer.billing_phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{customer.billing_phone}</span>
            </div>
          )}
          {customer.billing_email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{customer.billing_email}</span>
            </div>
          )}
          {customer.company_name && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span>{customer.company_name}</span>
            </div>
          )}
          {customer.billing_address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{customer.billing_address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
              <CardDescription>
                All interactions with this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineView
                events={timelineEvents}
                isLoading={isTimelineLoading}
                onRefresh={loadTimeline}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {orders.map(order => (
                    <Link
                      key={order.id}
                      to={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                        {order.amount_due && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {order.amount_due.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Internal Notes</CardTitle>
                  <CardDescription>Notes visible only to staff</CardDescription>
                </div>
                <AddNoteDialog
                  entityType="CUSTOMER"
                  entityId={customer.id}
                  customerId={customer.id}
                  onNoteAdded={loadTimeline}
                />
              </div>
            </CardHeader>
            <CardContent>
              {customer.notes && (
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-sm flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    {customer.notes}
                  </p>
                </div>
              )}
              
              <TimelineView
                events={timelineEvents.filter(e => e.event_type === 'NOTE')}
                isLoading={isTimelineLoading}
                showFilters={false}
                title="Note History"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
