// Scheduling Step - Delivery date/time selection with auto pickup suggestion
// P0-09: Time windows only (no exact times), weekend = special request

import { useState, useMemo, useEffect } from 'react';
import { format, addDays, isWeekend, isBefore, startOfToday, getDay } from 'date-fns';
import { Calendar, Clock, Truck, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// ============================================================
// TIME WINDOWS (from canonical business hours)
// ============================================================

type TimeWindow = 'morning' | 'midday' | 'afternoon';

interface TimeWindowOption {
  value: TimeWindow;
  label: string;
  range: string;
  icon: string;
}

const TIME_WINDOWS: TimeWindowOption[] = [
  { value: 'morning', label: 'Morning', range: '7 AM – 11 AM', icon: '🌅' },
  { value: 'midday', label: 'Midday', range: '11 AM – 3 PM', icon: '☀️' },
  { value: 'afternoon', label: 'Afternoon', range: '3 PM – 6 PM', icon: '🌆' },
];

// ============================================================
// TYPES
// ============================================================

export interface SchedulingResult {
  deliveryDate: Date;
  deliveryWindow: TimeWindow;
  pickupDate: Date;
  isWeekendDelivery: boolean;
  notes?: string;
}

interface SchedulingStepProps {
  rentalDays: number;
  onSchedulingConfirmed: (scheduling: SchedulingResult) => void;
  value?: SchedulingResult | null;
}

// ============================================================
// COMPONENT
// ============================================================

export function SchedulingStep({
  rentalDays,
  onSchedulingConfirmed,
  value,
}: SchedulingStepProps) {
  const today = startOfToday();
  const minDate = addDays(today, 1); // Minimum tomorrow
  
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    value?.deliveryDate || undefined
  );
  const [timeWindow, setTimeWindow] = useState<TimeWindow | null>(
    value?.deliveryWindow || null
  );
  const [isConfirmed, setIsConfirmed] = useState(!!value);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Auto-calculate pickup date based on delivery + rental days
  const pickupDate = useMemo(() => {
    if (!deliveryDate) return null;
    return addDays(deliveryDate, rentalDays);
  }, [deliveryDate, rentalDays]);

  // Check if delivery is on weekend
  const isWeekendDelivery = useMemo(() => {
    if (!deliveryDate) return false;
    return isWeekend(deliveryDate);
  }, [deliveryDate]);

  // Check if pickup falls on weekend
  const isWeekendPickup = useMemo(() => {
    if (!pickupDate) return false;
    return isWeekend(pickupDate);
  }, [pickupDate]);

  // Reset confirmation when values change
  useEffect(() => {
    setIsConfirmed(false);
  }, [deliveryDate, timeWindow]);

  // Day name helper
  const getDayName = (date: Date) => format(date, 'EEEE');

  // Disable dates before tomorrow
  const disabledDays = (date: Date) => isBefore(date, minDate);

  // Handle confirmation
  const handleConfirm = () => {
    if (!deliveryDate || !timeWindow || !pickupDate) return;

    const result: SchedulingResult = {
      deliveryDate,
      deliveryWindow: timeWindow,
      pickupDate,
      isWeekendDelivery,
    };
    
    setIsConfirmed(true);
    onSchedulingConfirmed(result);
  };

  const canConfirm = deliveryDate && timeWindow;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Schedule Delivery</h4>
          <p className="text-sm text-muted-foreground">
            Pick a delivery day and time window
          </p>
        </div>
      </div>

      {/* Delivery Date Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          Delivery Date
        </label>
        
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 justify-start text-left font-normal",
                !deliveryDate && "text-muted-foreground",
                isWeekendDelivery && "border-warning/50 bg-warning/5"
              )}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {deliveryDate ? (
                <span>
                  {format(deliveryDate, 'EEEE, MMMM d, yyyy')}
                  {isWeekendDelivery && (
                    <span className="ml-2 text-warning text-xs">(Special Request)</span>
                  )}
                </span>
              ) : (
                <span>Select delivery date...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={deliveryDate}
              onSelect={(date) => {
                setDeliveryDate(date);
                setCalendarOpen(false);
              }}
              disabled={disabledDays}
              initialFocus
              className="p-3 pointer-events-auto"
              modifiers={{
                weekend: (date) => getDay(date) === 0 || getDay(date) === 6,
              }}
              modifiersClassNames={{
                weekend: 'text-warning font-medium',
              }}
            />
            <div className="px-3 pb-3 text-xs text-muted-foreground text-center border-t pt-2">
              <span className="text-warning">●</span> Weekend = Special Request
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Weekend Warning */}
      {isWeekendDelivery && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">Weekend Delivery</span>
            <p className="text-xs mt-0.5 opacity-80">
              Weekend service is by special request. We'll confirm availability.
            </p>
          </div>
        </div>
      )}

      {/* Time Window Selection */}
      {deliveryDate && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Preferred Time Window
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {TIME_WINDOWS.map((window) => (
              <button
                key={window.value}
                type="button"
                onClick={() => setTimeWindow(window.value)}
                className={cn(
                  "p-3 rounded-xl border-2 text-center transition-all",
                  timeWindow === window.value
                    ? "border-primary bg-primary/5"
                    : "border-input bg-background hover:border-primary/50"
                )}
              >
                <div className="text-xl mb-1">{window.icon}</div>
                <div className="font-medium text-foreground text-sm">{window.label}</div>
                <div className="text-xs text-muted-foreground">{window.range}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Suggested Pickup */}
      {deliveryDate && pickupDate && (
        <div className={cn(
          "p-4 rounded-xl border",
          isWeekendPickup 
            ? "bg-warning/5 border-warning/30" 
            : "bg-success/5 border-success/30"
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              isWeekendPickup ? "bg-warning/20" : "bg-success/20"
            )}>
              <Sparkles className={cn(
                "w-4 h-4",
                isWeekendPickup ? "text-warning" : "text-success"
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  Suggested Pickup
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {rentalDays} days later
                </span>
              </div>
              <p className="text-sm text-foreground mt-1">
                <span className="font-semibold">{getDayName(pickupDate)}, {format(pickupDate, 'MMMM d')}</span>
                {isWeekendPickup && (
                  <span className="ml-2 text-warning text-xs">(Weekend - Special Request)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Call or text anytime to schedule an earlier pickup
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        type="button"
        variant={isConfirmed ? "outline" : "cta"}
        size="lg"
        className="w-full h-12"
        onClick={handleConfirm}
        disabled={!canConfirm}
      >
        {isConfirmed ? (
          <>
            <CheckCircle className="w-5 h-5 text-success" />
            Schedule Confirmed
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Confirm Schedule
          </>
        )}
      </Button>

      {/* Note about time windows */}
      <p className="text-xs text-muted-foreground text-center">
        We'll call 30 min before arrival with an estimated ETA. Deliveries are scheduled in time windows.
      </p>
    </div>
  );
}
