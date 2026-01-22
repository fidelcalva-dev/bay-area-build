import { useState } from "react";
import { 
  CheckCircle2, XCircle, Calendar, Clock, Truck, 
  Loader2, AlertCircle, MapPin, Phone 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ServiceRequestWithOrder,
  approveServiceRequest,
  denyServiceRequest,
} from "@/lib/serviceRequestService";

interface RequestApprovalDialogProps {
  request: ServiceRequestWithOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  pickup: "Pickup Request",
  schedule_change: "Schedule Change",
  extension: "Rental Extension",
};

const TIME_WINDOWS = [
  { value: "morning", label: "Morning (7-11am)" },
  { value: "midday", label: "Midday (11am-3pm)" },
  { value: "afternoon", label: "Afternoon (3-6pm)" },
];

export function RequestApprovalDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
}: RequestApprovalDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Schedule adjustment state
  const [adjustedDeliveryDate, setAdjustedDeliveryDate] = useState<Date | undefined>();
  const [adjustedDeliveryWindow, setAdjustedDeliveryWindow] = useState<string>("");
  const [adjustedPickupDate, setAdjustedPickupDate] = useState<Date | undefined>();
  const [adjustedPickupWindow, setAdjustedPickupWindow] = useState<string>("");

  const handleApprove = async () => {
    if (!request) return;
    setIsSubmitting(true);

    // Determine final dates
    const finalDeliveryDate =
      adjustedDeliveryDate?.toISOString().split("T")[0] ||
      request.requested_delivery_date ||
      undefined;
    const finalDeliveryWindow =
      adjustedDeliveryWindow || request.requested_delivery_window || undefined;
    const finalPickupDate =
      adjustedPickupDate?.toISOString().split("T")[0] ||
      request.requested_pickup_date ||
      request.preferred_date ||
      undefined;
    const finalPickupWindow =
      adjustedPickupWindow ||
      request.requested_pickup_window ||
      request.preferred_window ||
      undefined;

    const result = await approveServiceRequest({
      requestId: request.id,
      orderId: request.order_id,
      resolutionNotes: resolutionNotes || "Approved",
      newDeliveryDate:
        request.request_type === "schedule_change" &&
        (request.change_type === "delivery" || request.change_type === "both")
          ? finalDeliveryDate
          : undefined,
      newDeliveryWindow:
        request.request_type === "schedule_change" &&
        (request.change_type === "delivery" || request.change_type === "both")
          ? finalDeliveryWindow
          : undefined,
      newPickupDate: finalPickupDate,
      newPickupWindow: finalPickupWindow,
      currentDeliveryDate: request.orders?.scheduled_delivery_date,
      currentDeliveryWindow: request.orders?.scheduled_delivery_window,
      currentPickupDate: request.orders?.scheduled_pickup_date,
      currentPickupWindow: request.orders?.scheduled_pickup_window,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Request approved and schedule updated" });
      resetAndClose();
      onSuccess();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleDeny = async () => {
    if (!request || !resolutionNotes.trim()) {
      toast({
        title: "Notes required",
        description: "Please provide a reason for denial.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    const result = await denyServiceRequest({
      requestId: request.id,
      resolutionNotes,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Request denied" });
      resetAndClose();
      onSuccess();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const resetAndClose = () => {
    setResolutionNotes("");
    setAdjustedDeliveryDate(undefined);
    setAdjustedDeliveryWindow("");
    setAdjustedPickupDate(undefined);
    setAdjustedPickupWindow("");
    onOpenChange(false);
  };

  if (!request) return null;

  const quote = request.orders?.quotes;
  const showDeliveryAdjust =
    request.request_type === "schedule_change" &&
    (request.change_type === "delivery" || request.change_type === "both");
  const showPickupAdjust =
    request.request_type === "pickup" ||
    (request.request_type === "schedule_change" &&
      (request.change_type === "pickup" || request.change_type === "both"));

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Service Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-muted-foreground">Request Type</Label>
              <p className="font-medium">
                {REQUEST_TYPE_LABELS[request.request_type] || request.request_type}
              </p>
              {request.change_type && (
                <Badge variant="outline" className="mt-1">
                  {request.change_type}
                </Badge>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Submitted</Label>
              <p className="font-medium">
                {format(new Date(request.created_at), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Customer Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                {quote?.customer_name || "Unknown"}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {quote?.customer_phone || request.customer_phone || "N/A"}
              </div>
              <div className="col-span-2 flex items-start gap-1">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                {quote?.delivery_address || "Address not set"}
              </div>
            </div>
          </div>

          {/* Customer's Requested Dates */}
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-3">Customer Requested</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {showDeliveryAdjust && request.requested_delivery_date && (
                <div>
                  <span className="text-amber-800">New Delivery:</span>{" "}
                  <span className="font-medium">
                    {format(new Date(request.requested_delivery_date), "MMM d, yyyy")}
                  </span>
                  {request.requested_delivery_window && (
                    <span className="text-amber-700 ml-1">
                      ({request.requested_delivery_window})
                    </span>
                  )}
                </div>
              )}
              {showPickupAdjust && (
                <div>
                  <span className="text-amber-800">
                    {request.request_type === "pickup" ? "Pickup:" : "New Pickup:"}
                  </span>{" "}
                  <span className="font-medium">
                    {request.requested_pickup_date
                      ? format(new Date(request.requested_pickup_date), "MMM d, yyyy")
                      : request.preferred_date
                      ? format(new Date(request.preferred_date), "MMM d, yyyy")
                      : "Not specified"}
                  </span>
                  {(request.requested_pickup_window || request.preferred_window) && (
                    <span className="text-amber-700 ml-1">
                      ({request.requested_pickup_window || request.preferred_window})
                    </span>
                  )}
                </div>
              )}
            </div>
            {request.notes && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <span className="text-amber-800">Notes:</span>{" "}
                <p className="text-sm text-amber-900 mt-1">{request.notes}</p>
              </div>
            )}
          </div>

          {/* Current Order Schedule */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Current Schedule
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Delivery:</span>{" "}
                {request.orders?.scheduled_delivery_date
                  ? format(
                      new Date(request.orders.scheduled_delivery_date),
                      "MMM d, yyyy"
                    )
                  : "Not scheduled"}
                {request.orders?.scheduled_delivery_window && (
                  <span className="ml-1">({request.orders.scheduled_delivery_window})</span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">Pickup:</span>{" "}
                {request.orders?.scheduled_pickup_date
                  ? format(
                      new Date(request.orders.scheduled_pickup_date),
                      "MMM d, yyyy"
                    )
                  : "Not scheduled"}
                {request.orders?.scheduled_pickup_window && (
                  <span className="ml-1">({request.orders.scheduled_pickup_window})</span>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Adjustment (Optional) */}
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Adjust Schedule (Optional)
            </h4>
            <p className="text-sm text-muted-foreground">
              Leave blank to use customer's requested dates, or select alternative dates.
            </p>

            {showDeliveryAdjust && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adjusted Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !adjustedDeliveryDate && "text-muted-foreground"
                        )}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        {adjustedDeliveryDate
                          ? format(adjustedDeliveryDate, "MMM d, yyyy")
                          : "Use requested"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarPicker
                        mode="single"
                        selected={adjustedDeliveryDate}
                        onSelect={setAdjustedDeliveryDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Window</Label>
                  <Select
                    value={adjustedDeliveryWindow}
                    onValueChange={setAdjustedDeliveryWindow}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Use requested" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_WINDOWS.map((tw) => (
                        <SelectItem key={tw.value} value={tw.value}>
                          {tw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {showPickupAdjust && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adjusted Pickup Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !adjustedPickupDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {adjustedPickupDate
                          ? format(adjustedPickupDate, "MMM d, yyyy")
                          : "Use requested"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarPicker
                        mode="single"
                        selected={adjustedPickupDate}
                        onSelect={setAdjustedPickupDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Pickup Window</Label>
                  <Select
                    value={adjustedPickupWindow}
                    onValueChange={setAdjustedPickupWindow}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Use requested" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_WINDOWS.map((tw) => (
                        <SelectItem key={tw.value} value={tw.value}>
                          {tw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Notes */}
          <div className="space-y-2">
            <Label>Resolution Notes</Label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add notes about this resolution (required for denial)..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleDeny}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Deny
            </Button>
            <Button className="flex-1" onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve & Update Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
