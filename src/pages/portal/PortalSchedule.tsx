import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Truck, ChevronRight, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { logTimelineEvent } from '@/lib/timelineService';
import { useToast } from '@/hooks/use-toast';
import logoCalsan from '@/assets/logo-calsan.jpeg';

const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning', time: '8 AM - 12 PM', icon: '🌅' },
  { id: 'midday', label: 'Midday', time: '12 PM - 3 PM', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', time: '3 PM - 6 PM', icon: '🌇' },
];

function getNextBusinessDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  let d = new Date(today);
  d.setDate(d.getDate() + 1);
  while (days.length < count) {
    if (d.getDay() !== 0) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function PortalSchedule() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const quoteParam = searchParams.get('quote');
  const orderParam = searchParams.get('orderId');

  const [orderId, setOrderId] = useState<string | null>(orderParam);
  const [quoteInfo, setQuoteInfo] = useState<{ size: number; price: number; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDays = useMemo(() => getNextBusinessDays(14), []);

  // Resolve quote param to order, or load order directly
  useEffect(() => {
    const resolve = async () => {
      try {
        if (quoteParam) {
          // Look up outbound_quote to get/create order
          const { data: oq, error: oqErr } = await supabase
            .from('outbound_quotes')
            .select('*')
            .eq('id', quoteParam)
            .single();

          if (oqErr || !oq) {
            setError('Quote not found.');
            return;
          }

          setQuoteInfo({ size: oq.size_yd, price: oq.customer_price as number, name: oq.customer_name });

          if (oq.order_id) {
            setOrderId(oq.order_id);
          } else if (oq.quote_id) {
            // Check if order exists for this quote
            const { data: existingOrder } = await supabase
              .from('orders')
              .select('id')
              .eq('quote_id', oq.quote_id)
              .single();

            if (existingOrder) {
              setOrderId(existingOrder.id);
              // Link it back
              await supabase.from('outbound_quotes').update({ order_id: existingOrder.id } as any).eq('id', quoteParam);
            } else {
              // Create order from quote
              const { data: newOrder, error: createErr } = await supabase.functions.invoke('create-order-from-quote', {
                body: { quote_id: oq.quote_id },
              });
              if (createErr || !newOrder?.order_id) {
                setError('Unable to create order. Please contact support.');
                return;
              }
              setOrderId(newOrder.order_id);
              await supabase.from('outbound_quotes').update({ order_id: newOrder.order_id } as any).eq('id', quoteParam);
            }
          } else {
            setError('This quote has no linked order. Please contact support.');
            return;
          }
        } else if (orderParam) {
          // Load order info
          const { data: order } = await supabase
            .from('orders')
            .select('final_total, quotes(size_id, customer_name, dumpster_sizes:size_id(label))')
            .eq('id', orderParam)
            .single();

          if (order) {
            const q = order.quotes as any;
            setQuoteInfo({
              size: parseInt(q?.dumpster_sizes?.label || '0'),
              price: order.final_total || 0,
              name: q?.customer_name || 'Customer',
            });
          }
        } else {
          setError('Missing quote or order reference.');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    resolve();
  }, [quoteParam, orderParam]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedWindow || !orderId) return;
    setIsSubmitting(true);

    try {
      const windowLabel = TIME_WINDOWS.find(w => w.id === selectedWindow)?.time || selectedWindow;

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          scheduled_delivery_date: toISODate(selectedDate),
          scheduled_delivery_window: windowLabel,
          status: 'scheduled',
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log timeline event
      await logTimelineEvent({
        entityType: 'ORDER',
        entityId: orderId,
        eventType: 'DISPATCH',
        eventAction: 'SCHEDULED',
        summary: `Customer scheduled delivery: ${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (${windowLabel})`,
        orderId,
        source: 'USER',
        visibility: 'CUSTOMER',
        actorRole: 'customer',
        details: { scheduled_delivery_date: toISODate(selectedDate), scheduled_delivery_window: windowLabel },
      });

      // Log to schedule_logs
      await supabase.from('schedule_logs').insert({
        order_id: orderId,
        action: 'confirmed',
        new_date: toISODate(selectedDate),
        new_window: windowLabel,
        actor_role: 'customer',
        reason: 'Customer scheduled via portal',
      });

      toast({ title: 'Delivery Scheduled!', description: `${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - ${windowLabel}` });

      // Navigate to payment
      if (quoteParam) {
        navigate(`/portal/pay?quote=${quoteParam}`);
      } else {
        navigate(`/portal/pay?orderId=${orderId}`);
      }
    } catch (err) {
      console.error('Schedule error:', err);
      toast({ title: 'Error', description: 'Failed to save schedule.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/portal')}>Go to Portal</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(150_10%_98%)]">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Schedule Delivery</p>
            <p className="text-xs text-muted-foreground">Step 1 of 2</p>
          </div>
          <img src={logoCalsan} alt="Calsan" className="h-8 w-auto rounded" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge className="bg-primary text-primary-foreground">
            <Calendar className="w-3 h-3 mr-1" /> Schedule
          </Badge>
          <ChevronRight className="w-3 h-3" />
          <Badge variant="outline">Payment</Badge>
        </div>

        {/* Order summary */}
        {quoteInfo && (
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{quoteInfo.size} Yard Dumpster</p>
                  <p className="text-xs text-muted-foreground">{quoteInfo.name}</p>
                </div>
              </div>
              <p className="font-bold text-foreground">${quoteInfo.price.toLocaleString()}</p>
            </CardContent>
          </Card>
        )}

        {/* Date Selection */}
        <div>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Choose Delivery Date
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {availableDays.map((day) => {
              const isSelected = selectedDate && toISODate(selectedDate) === toISODate(day);
              return (
                <button
                  key={toISODate(day)}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/40',
                  )}
                >
                  <p className={cn('font-semibold text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Window */}
        {selectedDate && (
          <div className="animate-fade-in">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Preferred Time Window
            </h3>
            <div className="space-y-2">
              {TIME_WINDOWS.map((w) => {
                const isSelected = selectedWindow === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWindow(w.id)}
                    className={cn(
                      'w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/40',
                    )}
                  >
                    <span className="text-2xl">{w.icon}</span>
                    <div>
                      <p className={cn('font-semibold text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
                        {w.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{w.time}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="w-full h-14 rounded-xl text-base font-semibold"
          disabled={!selectedDate || !selectedWindow || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : (
            <>Continue to Payment <ChevronRight className="w-5 h-5" /></>
          )}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          Delivery times are estimated windows. We'll confirm the exact time closer to your date.
        </p>
      </main>
    </div>
  );
}
