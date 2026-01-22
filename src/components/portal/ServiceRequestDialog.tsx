import { useState } from "react";
import { Calendar, Clock, Truck, CalendarDays, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, addDays, isWeekend } from "date-fns";

type RequestType = "pickup" | "schedule_change";
type ChangeType = "delivery" | "pickup" | "both";
type TimeWindow = "morning" | "midday" | "afternoon";

interface ServiceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  requestType: RequestType;
  currentDeliveryDate?: string | null;
  currentPickupDate?: string | null;
  customerPhone?: string | null;
  onSuccess?: () => void;
}

const TIME_WINDOWS: { value: TimeWindow; label: string; time: string }[] = [
  { value: "morning", label: "Morning", time: "7am - 11am" },
  { value: "midday", label: "Midday", time: "11am - 3pm" },
  { value: "afternoon", label: "Afternoon", time: "3pm - 6pm" },
];

export function ServiceRequestDialog({
  open,
  onOpenChange,
  orderId,
  requestType,
  currentDeliveryDate,
  currentPickupDate,
  customerPhone,
  onSuccess,
}: ServiceRequestDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form state
  const [changeType, setChangeType] = useState<ChangeType>("pickup");
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [deliveryWindow, setDeliveryWindow] = useState<TimeWindow>("morning");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupWindow, setPickupWindow] = useState<TimeWindow>("morning");
  const [notes, setNotes] = useState("");

  const minDate = addDays(new Date(), 1); // Tomorrow minimum

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Build the insert data based on request type
      const baseData = {
        order_id: orderId,
        request_type: requestType,
        notes: notes || null,
        status: "pending" as const,
        source: "portal",
        customer_phone: customerPhone || undefined,
      };

      let insertData;

      if (requestType === "pickup") {
        insertData = {
          ...baseData,
          preferred_date: pickupDate?.toISOString().split("T")[0],
          preferred_window: pickupWindow as "morning" | "midday" | "afternoon",
          requested_pickup_date: pickupDate?.toISOString().split("T")[0],
          requested_pickup_window: pickupWindow as "morning" | "midday" | "afternoon",
        };
      } else {
        insertData = {
          ...baseData,
          change_type: changeType as "delivery" | "pickup" | "both",
          requested_delivery_date: (changeType === "delivery" || changeType === "both") 
            ? deliveryDate?.toISOString().split("T")[0] 
            : undefined,
          requested_delivery_window: (changeType === "delivery" || changeType === "both") 
            ? (deliveryWindow as "morning" | "midday" | "afternoon") 
            : undefined,
          requested_pickup_date: (changeType === "pickup" || changeType === "both") 
            ? pickupDate?.toISOString().split("T")[0] 
            : undefined,
          requested_pickup_window: (changeType === "pickup" || changeType === "both") 
            ? (pickupWindow as "morning" | "midday" | "afternoon") 
            : undefined,
        };
      }

      const { error } = await supabase.from("service_requests").insert(insertData);

      if (error) {
        // Check for rate limit error
        if (error.message.includes("Rate limit")) {
          toast({
            title: "Request Limit Reached",
            description: "You can only submit 2 requests per day. Please call us for urgent changes.",
            variant: "destructive",
          });
        } else if (error.message.includes("completed or cancelled")) {
          toast({
            title: "Cannot Submit Request",
            description: "This order is already completed or cancelled.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setIsSuccess(true);
      onSuccess?.();
      
      // Reset and close after delay
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 2000);
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

  const resetForm = () => {
    setChangeType("pickup");
    setDeliveryDate(undefined);
    setDeliveryWindow("morning");
    setPickupDate(undefined);
    setPickupWindow("morning");
    setNotes("");
    setIsSuccess(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const isFormValid = () => {
    if (requestType === "pickup") {
      return !!pickupDate;
    }
    
    if (changeType === "delivery") {
      return !!deliveryDate;
    }
    
    if (changeType === "pickup") {
      return !!pickupDate;
    }
    
    // both
    return !!deliveryDate && !!pickupDate;
  };

  // Success state
  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Received!</h3>
            <p className="text-gray-600">
              We'll review your request and contact you shortly to confirm.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {requestType === "pickup" ? (
              <>
                <Truck className="w-5 h-5" />
                Request Pickup
              </>
            ) : (
              <>
                <CalendarDays className="w-5 h-5" />
                Request Schedule Change
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {requestType === "pickup"
              ? "Select your preferred pickup date and time window."
              : "Choose what you'd like to change about your schedule."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Schedule Change Type Selector */}
          {requestType === "schedule_change" && (
            <div className="space-y-3">
              <Label>What would you like to change?</Label>
              <RadioGroup
                value={changeType}
                onValueChange={(v) => setChangeType(v as ChangeType)}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem
                    value="delivery"
                    id="change-delivery"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="change-delivery"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all",
                      changeType === "delivery"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <Truck className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Delivery</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="pickup"
                    id="change-pickup"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="change-pickup"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all",
                      changeType === "pickup"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <Calendar className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Pickup</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="both"
                    id="change-both"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="change-both"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all",
                      changeType === "both"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <CalendarDays className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Both</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Delivery Date/Window - Schedule Change */}
          {requestType === "schedule_change" &&
            (changeType === "delivery" || changeType === "both") && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <Label className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  New Delivery Date
                </Label>
                {currentDeliveryDate && (
                  <p className="text-xs text-muted-foreground">
                    Current: {format(new Date(currentDeliveryDate), "MMM d, yyyy")}
                  </p>
                )}
                <DateWindowPicker
                  date={deliveryDate}
                  window={deliveryWindow}
                  onDateChange={setDeliveryDate}
                  onWindowChange={setDeliveryWindow}
                  minDate={minDate}
                />
              </div>
            )}

          {/* Pickup Date/Window */}
          {(requestType === "pickup" ||
            (requestType === "schedule_change" &&
              (changeType === "pickup" || changeType === "both"))) && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {requestType === "pickup" ? "Preferred Pickup Date" : "New Pickup Date"}
              </Label>
              {currentPickupDate && (
                <p className="text-xs text-muted-foreground">
                  Current: {format(new Date(currentPickupDate), "MMM d, yyyy")}
                </p>
              )}
              <DateWindowPicker
                date={pickupDate}
                window={pickupWindow}
                onDateChange={setPickupDate}
                onWindowChange={setPickupWindow}
                minDate={minDate}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any special instructions or preferences..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Weekend Notice */}
          {((deliveryDate && isWeekend(deliveryDate)) ||
            (pickupDate && isWeekend(pickupDate))) && (
            <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
              <strong>Note:</strong> Weekend requests may require additional confirmation.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Date + Window Picker Sub-component
function DateWindowPicker({
  date,
  window,
  onDateChange,
  onWindowChange,
  minDate,
}: {
  date?: Date;
  window: TimeWindow;
  onDateChange: (date?: Date) => void;
  onWindowChange: (window: TimeWindow) => void;
  minDate: Date;
}) {
  return (
    <div className="space-y-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date ? format(date, "EEEE, MMMM d, yyyy") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarPicker
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={(date) => date < minDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="grid grid-cols-3 gap-2">
        {TIME_WINDOWS.map((tw) => (
          <Button
            key={tw.value}
            type="button"
            variant={window === tw.value ? "default" : "outline"}
            size="sm"
            className="flex flex-col h-auto py-2"
            onClick={() => onWindowChange(tw.value)}
          >
            <Clock className="w-3 h-3 mb-1" />
            <span className="text-xs font-medium">{tw.label}</span>
            <span className="text-[10px] opacity-70">{tw.time}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
