import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Truck, ChevronRight, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import logoCalsan from '@/assets/logo-calsan.jpeg';

const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning', time: '8 AM – 12 PM', icon: '🌅' },
  { id: 'midday', label: 'Midday', time: '12 PM – 3 PM', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', time: '3 PM – 6 PM', icon: '🌇' },
];

function getNextBusinessDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  let d = new Date(today);
  d.setDate(d.getDate() + 1); // Start from tomorrow

  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0) { // Skip Sunday only
      days.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function QuoteSchedule() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const orderId = searchParams.get('orderId');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ total: number; size: string } | null>(null);

  const availableDays = useMemo(() => getNextBusinessDays(14), []);

  // Fetch basic order info for display
  useEffect(() => {
    if (!orderId) return;
    supabase
      .from('orders')
      .select('final_total, quotes(size_id, dumpster_sizes:size_id(label))')
      .eq('id', orderId)
      .single()
      .then(({ data }) => {
        if (data) {
          const sizeLabel = (data.quotes as any)?.dumpster_sizes?.label || 'Dumpster';
          setOrderInfo({ total: data.final_total || 0, size: sizeLabel });
        }
      });
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Missing order information.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedWindow) return;
    setIsSubmitting(true);

    try {
      const windowLabel = TIME_WINDOWS.find(w => w.id === selectedWindow)?.time || selectedWindow;

      // Update order with schedule
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          scheduled_delivery_date: toISODate(selectedDate),
          scheduled_delivery_window: windowLabel,
          status: 'scheduled',
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log schedule event
      await supabase.from('order_events').insert({
        order_id: orderId,
        event_type: 'SCHEDULE_SELECTED',
        actor_role: 'customer',
        message: `Customer selected delivery: ${formatDate(selectedDate)} (${windowLabel})`,
        after_json: {
          scheduled_delivery_date: toISODate(selectedDate),
          scheduled_delivery_window: windowLabel,
        },
      });

      // Log to schedule_logs
      await supabase.from('schedule_logs').insert({
        order_id: orderId,
        action: 'confirmed',
        new_date: toISODate(selectedDate),
        new_window: windowLabel,
        actor_role: 'customer',
        reason: 'Customer confirmed via quote flow',
      });

      toast({ title: 'Delivery Scheduled!', description: `${formatDate(selectedDate)} — ${windowLabel}` });

      // Navigate to payment
      navigate(`/quote/pay?orderId=${orderId}`);
    } catch (err) {
      console.error('Schedule error:', err);
      toast({ title: 'Error', description: 'Failed to save schedule. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(150_10%_98%)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Schedule Delivery</p>
            <p className="text-xs text-muted-foreground">Step 2 of 3</p>
          </div>
          <img src={logoCalsan} alt="Calsan" className="h-8 w-auto rounded" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
          </Badge>
          <ChevronRight className="w-3 h-3" />
          <Badge className="bg-primary text-primary-foreground">
            <Calendar className="w-3 h-3 mr-1" /> Schedule
          </Badge>
          <ChevronRight className="w-3 h-3" />
          <Badge variant="outline">Payment</Badge>
        </div>

        {/* Order summary */}
        {orderInfo && (
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{orderInfo.size}</p>
                  <p className="text-xs text-muted-foreground">Order #{orderId.slice(0, 8)}</p>
                </div>
              </div>
              <p className="font-bold text-foreground">${orderInfo.total.toLocaleString()}</p>
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
              const isToday = toISODate(day) === toISODate(new Date());
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
                  {isToday && (
                    <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">Tomorrow</Badge>
                  )}
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

        {/* Submit */}
        <Button
          variant="cta"
          size="lg"
          className="w-full h-14 rounded-xl text-base font-semibold"
          disabled={!selectedDate || !selectedWindow || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue to Payment
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          Delivery times are estimated windows. We'll confirm the exact time closer to your date.
        </p>
      </main>
    </div>
  );
}
