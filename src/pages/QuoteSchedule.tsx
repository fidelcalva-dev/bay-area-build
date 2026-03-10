import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Truck, ChevronRight, Loader2, ArrowLeft, CheckCircle, Zap, CalendarDays, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import logoCalsan from '@/assets/logo-calsan.jpeg';

// ============================================================
// CONSTANTS
// ============================================================

const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning', time: '8 AM – 12 PM', icon: '🌅' },
  { id: 'midday', label: 'Midday', time: '12 PM – 3 PM', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', time: '3 PM – 6 PM', icon: '🌇' },
];

const QUICK_OPTIONS = [
  { id: 'earliest', label: 'Earliest Available', icon: Zap, description: 'We\'ll schedule the soonest open slot' },
  { id: 'flexible', label: 'I\'m Flexible', icon: CalendarDays, description: 'Any day that works for your crew' },
  { id: 'call_me', label: 'Call Me to Confirm', icon: Phone, description: 'Our team will reach out to schedule' },
];

// ============================================================
// HELPERS
// ============================================================

function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function isDisabledDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Disable past dates and today; allow Sundays but not past
  return date < tomorrow;
}

// ============================================================
// COMPONENT
// ============================================================

export default function QuoteSchedule() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const orderId = searchParams.get('orderId');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [selectedFlex, setSelectedFlex] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ total: number; size: string } | null>(null);

  // Fetch basic order info
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

  // When user picks a flex option, clear date/window; vice versa
  const handleFlexSelect = (flexId: string) => {
    setSelectedFlex(flexId === selectedFlex ? null : flexId);
    setSelectedDate(undefined);
    setSelectedWindow(null);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedFlex(null);
  };

  const canSubmit = selectedFlex || (selectedDate && selectedWindow);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setShowFallback(false);

    const payload: Record<string, string> = { orderId };

    if (selectedFlex) {
      const flexLabel = QUICK_OPTIONS.find(o => o.id === selectedFlex)?.label || selectedFlex;
      payload.flexOption = flexLabel;
    } else if (selectedDate && selectedWindow) {
      payload.deliveryDate = toLocalISODate(selectedDate);
      payload.deliveryWindow = selectedWindow;
    }

    // Attempt save with 1 retry
    let success = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('schedule-delivery', { body: payload });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        success = true;
        break;
      } catch (err) {
        console.error(`Schedule save attempt ${attempt + 1} failed:`, err);
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
        }
      }
    }

    setIsSubmitting(false);

    if (success) {
      const desc = selectedFlex
        ? QUICK_OPTIONS.find(o => o.id === selectedFlex)?.label
        : `${formatDateDisplay(selectedDate!)} — ${TIME_WINDOWS.find(w => w.id === selectedWindow)?.time}`;
      toast({ title: 'Delivery Scheduled!', description: desc });
      navigate(`/quote/pay?orderId=${orderId}`);
    } else {
      // Fallback — don't leave user stuck
      setShowFallback(true);
    }
  };

  const handleFallbackContinue = () => {
    // Let user proceed to payment anyway; the team will confirm the date
    navigate(`/quote/pay?orderId=${orderId}`);
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
            <p className="font-semibold text-foreground">Choose Your Preferred Delivery Date</p>
            <p className="text-xs text-muted-foreground">Step 2 of 3</p>
          </div>
          <img src={logoCalsan} alt="Calsan" className="h-8 w-auto rounded" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-28">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
          </Badge>
          <ChevronRight className="w-3 h-3" />
          <Badge className="bg-primary text-primary-foreground">
            <CalendarIcon className="w-3 h-3 mr-1" /> Schedule
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

        {/* Helper text */}
        <p className="text-sm text-muted-foreground">
          Select the date that works best for you. We'll confirm availability right away.
        </p>

        {/* Quick Select Options */}
        <div>
          <h3 className="font-bold text-foreground mb-2 text-sm">Quick Options</h3>
          <div className="grid grid-cols-1 gap-2">
            {QUICK_OPTIONS.map((opt) => {
              const isSelected = selectedFlex === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleFlexSelect(opt.id)}
                  className={cn(
                    'w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/40',
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                    isSelected ? 'bg-primary/15' : 'bg-muted'
                  )}>
                    <Icon className={cn('w-4 h-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className={cn('font-semibold text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or pick a specific date</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Calendar */}
        <div>
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-primary" />
            Delivery Date
          </h3>
          <Card>
            <CardContent className="p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDisabledDate}
                className="p-2 pointer-events-auto"
                fromDate={new Date()}
              />
            </CardContent>
          </Card>

          {selectedDate && (
            <p className="text-sm font-medium text-primary mt-2 text-center">
              {formatDateDisplay(selectedDate)}
            </p>
          )}
        </div>

        {/* Time Window — only if date picked */}
        {selectedDate && (
          <div className="animate-fade-in">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2 text-sm">
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

        {/* Fallback message */}
        {showFallback && (
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">
                We saved your request and our team will confirm the delivery date with you shortly.
              </p>
              <p className="text-xs text-muted-foreground">
                You can continue to payment — we'll reach out to finalize scheduling.
              </p>
              <Button variant="outline" className="w-full" onClick={handleFallbackContinue}>
                Continue to Payment
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reassurance */}
        <p className="text-[11px] text-muted-foreground text-center">
          Need it fast? Same-day or next-day delivery may be available depending on your area.
          We'll call 30 min before arrival with an estimated ETA.
        </p>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="max-w-lg mx-auto">
          <Button
            variant="cta"
            size="lg"
            className="w-full h-14 rounded-xl text-base font-semibold"
            disabled={!canSubmit || isSubmitting}
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
        </div>
      </div>
    </div>
  );
}
