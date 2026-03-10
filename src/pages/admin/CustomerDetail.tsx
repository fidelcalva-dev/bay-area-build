import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, Phone, Mail, Building2, MapPin, FileText, DollarSign, 
  ArrowLeft, Loader2, Package, Receipt, CreditCard,
  Camera, StickyNote, Plus, Send, Truck, Star, Upload, 
  ExternalLink, Image, FolderOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { TimelineView, AddNoteDialog } from '@/components/timeline';
import { getCustomerTimeline, type TimelineEvent } from '@/lib/timelineService';
import { HealthScoreCard, HealthEventsTimeline, HealthBadge } from '@/components/health';
import { getCustomerHealthScore, type CustomerHealthScore } from '@/lib/customerHealthService';
import { CommunicationTimeline } from '@/components/communication/CommunicationTimeline';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileScrollTabs } from '@/components/mobile/MobileScrollTabs';
import { MobileQuickActions } from '@/components/mobile/MobileQuickActions';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  OverviewTab, ContactsTab, SitesTab, RequestsTab, AnalyticsTab, QuotesTab,
  type Customer, type Order, type Invoice, type Payment, type Quote,
  type CustomerContact, type CustomerSite, type Customer360Data,
} from '@/components/customer360';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const isMobile = useIsMobile();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [sites, setSites] = useState<CustomerSite[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [healthScore, setHealthScore] = useState<CustomerHealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  const loadTimeline = useCallback(async () => {
    if (!id) return;
    setIsTimelineLoading(true);
    const { events } = await getCustomerTimeline(id, { limit: 100 });
    setTimelineEvents(events);
    setIsTimelineLoading(false);
  }, [id]);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);

    const [customerResult, ordersResult, invoicesResult, paymentsResult, quotesResult, contactsResult, sitesResult, health] = await Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase.from('orders').select('id, status, amount_due, created_at, scheduled_delivery_date, scheduled_pickup_date').eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('customers').select('billing_email').eq('id', id).single().then(async (res) => {
        const email = res.data?.billing_email;
        if (!email) return { data: [], error: null };
        return supabase.from('quotes').select('id, customer_name, customer_email, status, subtotal, created_at, zip_code, material_type').eq('customer_email', email).order('created_at', { ascending: false });
      }),
      supabase.from('customer_contacts').select('*').eq('customer_id', id).order('is_primary', { ascending: false }),
      supabase.from('customer_sites').select('*').eq('customer_id', id).order('is_primary', { ascending: false }),
      getCustomerHealthScore(id),
    ]);

    if (customerResult.data) setCustomer(customerResult.data as Customer);
    if (ordersResult.data) setOrders(ordersResult.data as Order[]);
    if (invoicesResult.data) setInvoices(invoicesResult.data as Invoice[]);
    if (paymentsResult.data) setPayments(paymentsResult.data as Payment[]);
    if (quotesResult.data) setQuotes(quotesResult.data as Quote[]);
    if (contactsResult.data) setContacts(contactsResult.data as CustomerContact[]);
    if (sitesResult.data) setSites(sitesResult.data as CustomerSite[]);
    setHealthScore(health);
    setIsLoading(false);
    loadTimeline();
  }, [id, loadTimeline]);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time subscription for timeline
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`customer-timeline-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'timeline_events', filter: `customer_id=eq.${id}` },
        (payload) => { setTimelineEvents(prev => [payload.new as TimelineEvent, ...prev]); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!customer) {
    return <div className="container mx-auto py-6"><p className="text-muted-foreground">Customer not found</p></div>;
  }

  const data: Customer360Data = { customer, orders, invoices, payments, quotes, contacts, sites };
  const totalRevenue = payments.filter(p => p.status === 'approved' || p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + (i.balance_due || 0), 0);

  // Photo and document events from timeline
  const photoEvents = timelineEvents.filter(e => {
    const d = e.details_json as Record<string, unknown> | null;
    return d?.photo_url || d?.photos || e.event_type === 'DUMP_TICKET';
  });
  const documentEvents = timelineEvents.filter(e => {
    const d = e.details_json as Record<string, unknown> | null;
    return d?.document_url || d?.file_url || (e.event_type === 'SYSTEM' && e.summary?.toLowerCase().includes('document'));
  });

  return (
    <div className="mx-auto py-4 md:py-6 space-y-4 md:space-y-6 max-w-7xl px-4 md:px-6">
      {/* ─── HEADER ─── */}
      {isMobile ? (
        <MobileCustomerHeader
          customer={customer}
          healthScore={healthScore}
          totalRevenue={totalRevenue}
          totalOutstanding={totalOutstanding}
          onLoadTimeline={loadTimeline}
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin/customers"><ArrowLeft className="w-5 h-5" /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  {customer.company_name || customer.contact_name || 'Customer'}
                  {healthScore && <HealthBadge status={healthScore.status} showScore score={healthScore.score} size="sm" />}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  {customer.customer_type && <Badge variant="secondary">{customer.customer_type}</Badge>}
                  {customer.is_active ? <Badge variant="default" className="text-xs">Active</Badge> : <Badge variant="outline" className="text-xs">Inactive</Badge>}
                  <span className="text-sm">Since {new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AddNoteDialog entityType="CUSTOMER" entityId={customer.id} customerId={customer.id} onNoteAdded={loadTimeline} />
              <QuickActionsMenu customerId={customer.id} customerEmail={customer.billing_email} />
            </div>
          </div>

          {/* Contact Strip - Desktop */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
              {customer.billing_phone && (
                <a href={`tel:${customer.billing_phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Phone className="w-4 h-4" />{customer.billing_phone}
                </a>
              )}
              {customer.phone && customer.phone !== customer.billing_phone && (
                <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Phone className="w-4 h-4" />{customer.phone}
                </a>
              )}
              {customer.billing_email && (
                <a href={`mailto:${customer.billing_email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline truncate">
                  <Mail className="w-4 h-4" />{customer.billing_email}
                </a>
              )}
              {customer.company_name && (
                <span className="flex items-center gap-1.5 text-sm"><Building2 className="w-4 h-4 text-muted-foreground" />{customer.company_name}</span>
              )}
              {customer.billing_address && (
                <span className="flex items-center gap-1.5 text-sm truncate"><MapPin className="w-4 h-4 text-muted-foreground" />{customer.billing_address}</span>
              )}
              <div className="ml-auto flex items-center gap-4 text-sm font-medium">
                <span className="text-muted-foreground">Revenue: <span className="text-foreground">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
                {totalOutstanding > 0 && (
                  <span className="text-destructive">Outstanding: ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── MAIN TABS ─── */}
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <MobileScrollTabs>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="sites">Sites ({sites.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Comms</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </MobileScrollTabs>

        {/* ─── OVERVIEW ─── */}
        <TabsContent value="overview">
          <OverviewTab data={data} timelineEvents={timelineEvents} isTimelineLoading={isTimelineLoading} />
        </TabsContent>

        {/* ─── CONTACTS ─── */}
        <TabsContent value="contacts">
          <ContactsTab
            customerId={customer.id}
            contacts={contacts}
            customerPhone={customer.billing_phone}
            customerEmail={customer.billing_email}
            customerName={customer.contact_name}
            onRefresh={loadData}
          />
        </TabsContent>

        {/* ─── SITES ─── */}
        <TabsContent value="sites">
          <SitesTab
            customerId={customer.id}
            sites={sites}
            billingAddress={customer.billing_address}
            onRefresh={loadData}
          />
        </TabsContent>

        {/* ─── ORDERS ─── */}
        <TabsContent value="orders">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {orders.map(order => (
                    <Link key={order.id} to={`/admin/orders?id=${order.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Package className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{order.status}</Badge>
                        {order.amount_due != null && <span className="font-medium text-sm">${order.amount_due.toFixed(2)}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── REQUESTS ─── */}
        <TabsContent value="requests">
          <RequestsTab timelineEvents={timelineEvents} isLoading={isTimelineLoading} />
        </TabsContent>

        {/* ─── TIMELINE ─── */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Full Activity Timeline</CardTitle>
              {!isMobile && <CardDescription>Calls, texts, emails, orders, payments, notes — all interactions</CardDescription>}
            </CardHeader>
            <CardContent>
              <TimelineView events={timelineEvents} isLoading={isTimelineLoading} onRefresh={loadTimeline} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── PAYMENTS ─── */}
        <TabsContent value="payments">
          <div className="space-y-4 md:space-y-6">
            {/* Invoices */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Invoices</CardTitle></CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No invoices yet</p>
                ) : (
                  <div className="space-y-2">
                    {invoices.map(inv => (
                      <Link key={inv.id} to={`/finance/invoices/${inv.order_id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Receipt className="w-5 h-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{inv.invoice_number || `INV-${inv.id.slice(0, 8)}`}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : new Date(inv.created_at).toLocaleDateString()}
                              {inv.due_date && ` · Due ${new Date(inv.due_date).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={inv.payment_status === 'paid' ? 'default' : inv.payment_status === 'overdue' ? 'destructive' : 'secondary'} className="text-xs">{inv.payment_status}</Badge>
                          <div className="text-right">
                            <p className="font-medium text-sm">${inv.amount_due.toFixed(2)}</p>
                            {inv.balance_due > 0 && <p className="text-[10px] text-destructive">Bal: ${inv.balance_due.toFixed(2)}</p>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Payment History</CardTitle></CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No payments recorded</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map(pmt => (
                      <div key={pmt.id} className="flex items-center justify-between p-3 rounded-lg border gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <CreditCard className="w-5 h-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{pmt.payment_type}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {new Date(pmt.created_at).toLocaleDateString()}
                              {pmt.card_type && pmt.card_last_four && ` · ${pmt.card_type} ****${pmt.card_last_four}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={pmt.status === 'approved' || pmt.status === 'completed' ? 'default' : pmt.status === 'failed' || pmt.status === 'declined' ? 'destructive' : 'secondary'} className="text-xs">{pmt.status}</Badge>
                          <span className="font-medium text-sm">${pmt.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── DOCUMENTS ─── */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Documents</CardTitle>
                  {!isMobile && <CardDescription>Contracts, receipts, and uploaded files</CardDescription>}
                </div>
                <Button variant="outline" size="sm" disabled><Upload className="w-4 h-4 mr-1.5" />Upload</Button>
              </div>
            </CardHeader>
            <CardContent>
              {documentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No documents yet</p>
                  <p className="text-xs mt-1">Contracts, dump tickets, and uploaded files will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documentEvents.map(event => {
                    const details = event.details_json as Record<string, unknown> | null;
                    const url = (details?.document_url || details?.file_url) as string | undefined;
                    return (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{event.summary}</p>
                            <p className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {url && <Button variant="ghost" size="sm" onClick={() => window.open(url, '_blank')}><ExternalLink className="w-4 h-4" /></Button>}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── COMMUNICATIONS ─── */}
        <TabsContent value="communications">
          <CommunicationTimeline entityType="customer" entityId={customer.id} title="All Communications" maxHeight={isMobile ? "400px" : "600px"} />
        </TabsContent>

        {/* ─── NOTES ─── */}
        <TabsContent value="notes">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Internal Notes</CardTitle>
                  {!isMobile && <CardDescription>Notes visible only to staff</CardDescription>}
                </div>
                <AddNoteDialog entityType="CUSTOMER" entityId={customer.id} customerId={customer.id} onNoteAdded={loadTimeline} />
              </div>
            </CardHeader>
            <CardContent>
              {customer.notes && (
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-sm flex items-start gap-2"><FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />{customer.notes}</p>
                </div>
              )}
              <TimelineView events={timelineEvents.filter(e => e.event_type === 'NOTE')} isLoading={isTimelineLoading} showFilters={false} title="Note History" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── PHOTOS ─── */}
        <TabsContent value="photos">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Photos & Media</CardTitle>
              {!isMobile && <CardDescription>Site photos, dump tickets, and delivery documentation</CardDescription>}
            </CardHeader>
            <CardContent>
              {photoEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No photos yet</p>
                  <p className="text-xs mt-1">Delivery photos, site images, and dump tickets will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {photoEvents.map(event => {
                    const details = event.details_json as Record<string, unknown> | null;
                    const photoUrl = details?.photo_url as string | undefined;
                    const photos = details?.photos as string[] | undefined;
                    return (
                      <div key={event.id} className="p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">{event.summary}</span>
                          <span className="text-xs text-muted-foreground ml-auto shrink-0">{new Date(event.created_at).toLocaleDateString()}</span>
                        </div>
                        {photoUrl && <img src={photoUrl} alt={event.summary} className="w-full max-w-md rounded-md border" loading="lazy" />}
                        {photos && photos.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {photos.map((url, i) => (
                              <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity" loading="lazy" onClick={() => window.open(url, '_blank')} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ANALYTICS ─── */}
        <TabsContent value="analytics">
          <AnalyticsTab data={data} />
        </TabsContent>
      </Tabs>

      {/* ─── MOBILE FAB (Quick Actions) ─── */}
      {isMobile && customer && (
        <MobileQuickActions
          customerPhone={customer.billing_phone}
          address={customer.billing_address}
          extraActions={[
            {
              icon: <FileText className="w-5 h-5" />,
              label: 'Create Quote',
              onClick: () => navigate('/sales/quotes/new'),
            },
            {
              icon: <Package className="w-5 h-5" />,
              label: 'Create Order',
              onClick: () => navigate(`/admin/orders?action=new&customer=${customer.id}`),
            },
            {
              icon: <Truck className="w-5 h-5" />,
              label: 'Schedule Pickup',
              onClick: () => navigate(`/dispatch?action=pickup&customer=${customer.id}`),
            },
            {
              icon: <CreditCard className="w-5 h-5" />,
              label: 'Send Payment Link',
              onClick: () => navigate(`/finance/payment-actions?customer=${customer.id}`),
            },
          ]}
        />
      )}
    </div>
  );
}

// ─── MOBILE CUSTOMER HEADER ──────────────────────────────────────
function MobileCustomerHeader({ customer, healthScore, totalRevenue, totalOutstanding, onLoadTimeline }: {
  customer: Customer;
  healthScore: CustomerHealthScore | null;
  totalRevenue: number;
  totalOutstanding: number;
  onLoadTimeline: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {/* Back + Name */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 -ml-2 h-9 w-9" asChild>
          <Link to="/admin/customers"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold truncate flex items-center gap-2">
            {customer.company_name || customer.contact_name || 'Customer'}
            {healthScore && <HealthBadge status={healthScore.status} size="sm" />}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            {customer.customer_type && <Badge variant="secondary" className="text-[10px] h-5">{customer.customer_type}</Badge>}
            {customer.is_active ? <Badge variant="default" className="text-[10px] h-5">Active</Badge> : <Badge variant="outline" className="text-[10px] h-5">Inactive</Badge>}
          </div>
        </div>
      </div>

      {/* Contact Actions Row */}
      <div className="flex gap-2">
        {customer.billing_phone && (
          <>
            <a href={`tel:${customer.billing_phone}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full h-11 text-xs gap-1.5">
                <Phone className="w-4 h-4" />Call
              </Button>
            </a>
            <a href={`sms:${customer.billing_phone}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full h-11 text-xs gap-1.5">
                <Mail className="w-4 h-4" />Text
              </Button>
            </a>
          </>
        )}
        {customer.billing_email && (
          <a href={`mailto:${customer.billing_email}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full h-11 text-xs gap-1.5">
              <Mail className="w-4 h-4" />Email
            </Button>
          </a>
        )}
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border bg-card p-3">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Revenue</p>
          <p className="text-lg font-bold text-foreground">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
        <div className={`rounded-xl border p-3 ${totalOutstanding > 0 ? 'border-destructive/30 bg-destructive/5' : 'bg-card'}`}>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Outstanding</p>
          <p className={`text-lg font-bold ${totalOutstanding > 0 ? 'text-destructive' : 'text-foreground'}`}>
            ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── QUICK ACTIONS MENU (Desktop) ──────────────────────────────────
function QuickActionsMenu({ customerId, customerEmail }: { customerId: string; customerEmail: string | null }) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm"><Plus className="w-4 h-4 mr-1.5" />Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/sales/quotes/new')}>
          <FileText className="w-4 h-4 mr-2" />Create Quote
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/admin/orders?action=new&customer=${customerId}`)}>
          <Package className="w-4 h-4 mr-2" />Create Order
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/dispatch?customer=${customerId}`)}>
          <Truck className="w-4 h-4 mr-2" />Schedule Delivery
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/dispatch?action=pickup&customer=${customerId}`)}>
          <Truck className="w-4 h-4 mr-2" />Request Pickup
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/finance/invoices?customer=${customerId}`)}>
          <Receipt className="w-4 h-4 mr-2" />Send Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/finance/payment-actions?customer=${customerId}`)}>
          <CreditCard className="w-4 h-4 mr-2" />Send Payment Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/admin/customers/${customerId}?tab=notes`)}>
          <StickyNote className="w-4 h-4 mr-2" />Add Note
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Upload className="w-4 h-4 mr-2" />Upload Document
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Star className="w-4 h-4 mr-2" />Request Review
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
