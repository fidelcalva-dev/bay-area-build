import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, Building2, MapPin, FileText, DollarSign, 
  ArrowLeft, Loader2, Package, Activity, Receipt, CreditCard,
  MessageSquare, Camera, StickyNote, Clock, Plus, Send,
  Truck, Star, Upload, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TimelineView, AddNoteDialog } from '@/components/timeline';
import { getCustomerTimeline, type TimelineEvent } from '@/lib/timelineService';
import { HealthScoreCard, HealthEventsTimeline, HealthBadge } from '@/components/health';
import { getCustomerHealthScore, type CustomerHealthScore } from '@/lib/customerHealthService';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

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
  scheduled_delivery_date: string | null;
  scheduled_pickup_date: string | null;
}

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string | null;
  amount_due: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  due_date: string | null;
  issue_date: string | null;
  created_at: string;
}

interface Payment {
  id: string;
  order_id: string;
  payment_type: string;
  amount: number;
  status: string;
  card_last_four: string | null;
  card_type: string | null;
  created_at: string;
}

interface Quote {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  subtotal: number | null;
  created_at: string;
  zip_code: string | null;
  material_type: string | null;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [healthScore, setHealthScore] = useState<CustomerHealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);

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

      const [customerResult, ordersResult, invoicesResult, paymentsResult, quotesResult, health] = await Promise.all([
        supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('orders')
          .select('id, status, amount_due, created_at, scheduled_delivery_date, scheduled_pickup_date')
          .eq('customer_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('invoices')
          .select('*')
          .eq('customer_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('*')
          .eq('customer_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('quotes')
          .select('id, customer_name, customer_email, status, subtotal, created_at, zip_code, material_type')
          .eq('customer_email', (await supabase.from('customers').select('billing_email').eq('id', id).single()).data?.billing_email || '__none__')
          .order('created_at', { ascending: false }),
        getCustomerHealthScore(id),
      ]);

      if (customerResult.data) setCustomer(customerResult.data);
      if (ordersResult.data) setOrders(ordersResult.data);
      if (invoicesResult.data) setInvoices(invoicesResult.data as Invoice[]);
      if (paymentsResult.data) setPayments(paymentsResult.data as Payment[]);
      if (quotesResult.data) setQuotes(quotesResult.data as Quote[]);
      setHealthScore(health);

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    );
  }

  // Summary stats
  const totalRevenue = payments.filter(p => p.status === 'approved' || p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + (i.balance_due || 0), 0);
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/customers">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              {customer.company_name || 'Customer'}
              {healthScore && (
                <HealthBadge status={healthScore.status} showScore score={healthScore.score} size="sm" />
              )}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              {customer.customer_type && (
                <Badge variant="secondary">{customer.customer_type}</Badge>
              )}
              <span className="text-sm">Since {new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Dropdown */}
        <div className="flex items-center gap-2">
          <AddNoteDialog
            entityType="CUSTOMER"
            entityId={customer.id}
            customerId={customer.id}
            onNoteAdded={loadTimeline}
          />
          <QuickActionsMenu customerId={customer.id} customerEmail={customer.billing_email} />
        </div>
      </div>

      {/* Contact Info + Stats Strip */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {customer.billing_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`tel:${customer.billing_phone}`} className="text-primary hover:underline">{customer.billing_phone}</a>
              </div>
            )}
            {customer.billing_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${customer.billing_email}`} className="text-primary hover:underline truncate">{customer.billing_email}</a>
              </div>
            )}
            {customer.company_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{customer.company_name}</span>
              </div>
            )}
            {customer.billing_address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{customer.billing_address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
        <StatCard icon={Receipt} label="Outstanding" value={`$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} alert={totalOutstanding > 0} />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        {/* ─── OVERVIEW TAB ─── */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <Badge variant="outline">{activeOrders} active</Badge>
              </CardHeader>
              <CardContent>
                {orders.slice(0, 5).map(order => (
                  <Link
                    key={order.id}
                    to={`/admin/orders?id=${order.id}`}
                    className="flex items-center justify-between py-2.5 border-b last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {order.status}
                      </Badge>
                      {order.amount_due != null && (
                        <span className="text-sm font-medium">${order.amount_due.toFixed(2)}</span>
                      )}
                    </div>
                  </Link>
                ))}
                {orders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineView
                  events={timelineEvents.slice(0, 8)}
                  isLoading={isTimelineLoading}
                  showFilters={false}
                  title=""
                />
              </CardContent>
            </Card>

            {/* Service Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Service Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Orders</span><span className="font-medium">{orders.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Active Orders</span><span className="font-medium">{activeOrders}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Invoices</span><span className="font-medium">{invoices.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Payments</span><span className="font-medium">{payments.length}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Health Summary */}
            {healthScore && <HealthScoreCard customerId={customer.id} />}
          </div>
        </TabsContent>

        {/* ─── ORDERS TAB ─── */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-1">
                  {orders.map(order => (
                    <Link
                      key={order.id}
                      to={`/admin/orders?id=${order.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                            {order.site_address && ` · ${order.site_address}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                        {order.amount_due != null && (
                          <span className="flex items-center gap-1 font-medium">
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

        {/* ─── QUOTES TAB ─── */}
        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quotes</CardTitle>
              <CardDescription>All quotes associated with this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No quotes found</p>
              ) : (
                <div className="space-y-1">
                  {quotes.map(quote => (
                    <Link
                      key={quote.id}
                      to={`/sales/quotes/${quote.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Quote #{quote.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quote.created_at).toLocaleDateString()}
                            {quote.zip_code && ` · ZIP ${quote.zip_code}`}
                            {quote.material_type && ` · ${quote.material_type}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={quote.status === 'converted' ? 'default' : 'secondary'}>
                          {quote.status}
                        </Badge>
                        {quote.subtotal != null && (
                          <span className="font-medium">${quote.subtotal.toFixed(2)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── INVOICES TAB ─── */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoices</CardTitle>
              <CardDescription>Billing history and outstanding balances</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No invoices yet</p>
              ) : (
                <div className="space-y-1">
                  {invoices.map(inv => (
                    <Link
                      key={inv.id}
                      to={`/finance/invoices/${inv.order_id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{inv.invoice_number || `INV-${inv.id.slice(0, 8)}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : new Date(inv.created_at).toLocaleDateString()}
                            {inv.due_date && ` · Due ${new Date(inv.due_date).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          inv.payment_status === 'paid' ? 'default' :
                          inv.payment_status === 'overdue' ? 'destructive' : 'secondary'
                        }>
                          {inv.payment_status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-medium">${inv.amount_due.toFixed(2)}</p>
                          {inv.balance_due > 0 && (
                            <p className="text-xs text-destructive">Bal: ${inv.balance_due.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── PAYMENTS TAB ─── */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
              <CardDescription>All transactions for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No payments recorded</p>
              ) : (
                <div className="space-y-1">
                  {payments.map(pmt => (
                    <div
                      key={pmt.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{pmt.payment_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(pmt.created_at).toLocaleDateString()}
                            {pmt.card_type && pmt.card_last_four && ` · ${pmt.card_type} ****${pmt.card_last_four}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          pmt.status === 'approved' || pmt.status === 'completed' ? 'default' :
                          pmt.status === 'failed' || pmt.status === 'declined' ? 'destructive' : 'secondary'
                        }>
                          {pmt.status}
                        </Badge>
                        <span className="font-medium">${pmt.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TIMELINE TAB ─── */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Full Activity Timeline</CardTitle>
              <CardDescription>
                Calls, texts, emails, orders, payments, notes — all interactions
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

        {/* ─── NOTES TAB ─── */}
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

        {/* ─── HEALTH TAB ─── */}
        <TabsContent value="health">
          <div className="grid gap-6 lg:grid-cols-2">
            <HealthScoreCard customerId={customer.id} />
            <HealthEventsTimeline customerId={customer.id} limit={15} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, alert }: { icon: typeof DollarSign; label: string; value: string; alert?: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          <Icon className={`w-5 h-5 ${alert ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold ${alert ? 'text-destructive' : ''}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── QUICK ACTIONS MENU ──────────────────────────────────────────
function QuickActionsMenu({ customerId, customerEmail }: { customerId: string; customerEmail: string | null }) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/sales/quotes/new')}>
          <FileText className="w-4 h-4 mr-2" />
          Create Quote
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/admin/orders?action=new&customer=${customerId}`)}>
          <Package className="w-4 h-4 mr-2" />
          Create Order
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/dispatch?customer=${customerId}`)}>
          <Truck className="w-4 h-4 mr-2" />
          Schedule Delivery
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/dispatch?action=pickup&customer=${customerId}`)}>
          <Truck className="w-4 h-4 mr-2" />
          Request Pickup
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/finance/invoices?customer=${customerId}`)}>
          <Receipt className="w-4 h-4 mr-2" />
          Send Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/finance/payment-actions?customer=${customerId}`)}>
          <CreditCard className="w-4 h-4 mr-2" />
          Send Payment Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/admin/customers/${customerId}?tab=notes`)}>
          <StickyNote className="w-4 h-4 mr-2" />
          Add Note
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Star className="w-4 h-4 mr-2" />
          Request Review
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
